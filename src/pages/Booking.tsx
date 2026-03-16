import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useRoomType } from "../features/roomType/useRoomTypes";
import { usePriceCalculation } from "../features/priceRule/usePriceRule";
import { useCreateReservation } from "../features/reservation/useReservation";
import { useAuth } from "../features/auth/useAuth";
import {
    pluralNights,
    getTodayAndTomorrow,
    nightsBetween,
    nextDay,
} from "../utils/dateUtils";
import type { ReservationItemDto } from "../features/reservation/reservationTypes";

// ─── Предустановленные доп. услуги ───────────────────────────────────────────

interface PresetService {
    id: string;
    name: string;
    price: number;
    description: string;
    icon: string;
}

const PRESET_SERVICES: PresetService[] = [
    { id: "breakfast", name: "Завтрак",           price: 25,  description: "Шведский стол, каждый день", icon: "🍳" },
    { id: "transfer",  name: "Трансфер из аэропорта", price: 60,  description: "Встреча и доставка до отеля", icon: "🚗" },
    { id: "parking",   name: "Парковка",           price: 15,  description: "Охраняемая стоянка, в сутки",  icon: "🅿️" },
    { id: "minibar",   name: "Мини-бар",           price: 30,  description: "Напитки и снеки в номере",     icon: "🍾" },
];

// ─── Компонент одной услуги ───────────────────────────────────────────────────

function ServiceCard({
                         service,
                         quantity,
                         onAdd,
                         onRemove,
                     }: {
    service: PresetService;
    quantity: number;
    onAdd: () => void;
    onRemove: () => void;
}) {
    return (
        <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${quantity > 0 ? "border-amber-300 bg-amber-50" : "border-stone-200 bg-white"}`}>
            <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">{service.icon}</span>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">{service.name}</p>
                    <p className="text-xs text-stone-400 truncate">{service.description}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-medium text-amber-700">{service.price}₼</span>
                {quantity === 0 ? (
                    <button
                        onClick={onAdd}
                        className="w-7 h-7 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center text-lg leading-none transition-colors"
                    >
                        +
                    </button>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={onRemove}
                            className="w-7 h-7 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-600 flex items-center justify-center text-lg leading-none transition-colors"
                        >
                            −
                        </button>
                        <span className="text-sm font-semibold text-stone-700 w-4 text-center">{quantity}</span>
                        <button
                            onClick={onAdd}
                            className="w-7 h-7 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center text-lg leading-none transition-colors"
                        >
                            +
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Booking() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const roomTypeId = Number(searchParams.get("roomTypeId"));
    const { today, tomorrow } = getTodayAndTomorrow();

    const [checkIn,  setCheckIn]  = useState(searchParams.get("checkIn")  || today);
    const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || tomorrow);
    const { user } = useAuth();
    const [name,     setName]     = useState(user?.displayName ?? "");
    const [email,    setEmail]    = useState(user?.email       ?? "");
    const [phone,    setPhone]    = useState("");
    const [guests,   setGuests]   = useState("1");
    const [notes,    setNotes]    = useState("");
    const [errors,   setErrors]   = useState<Record<string, string>>({});

    // Кол-во каждой услуги по id
    const [serviceQty, setServiceQty] = useState<Record<string, number>>({});

    const { data: roomType, isLoading: roomLoading } = useRoomType(roomTypeId);

    const nights = nightsBetween(checkIn, checkOut);

    const { data: priceData, isLoading: priceLoading } = usePriceCalculation(
        roomTypeId && checkIn && checkOut && nights > 0
            ? { roomTypeId, startDate: checkIn, endDate: checkOut }
            : null
    );

    const { mutate: createReservation, isPending } = useCreateReservation();

    // Собираем items для отправки
    const selectedItems: ReservationItemDto[] = PRESET_SERVICES
        .filter((s) => (serviceQty[s.id] ?? 0) > 0)
        .map((s) => ({
            name:     s.name,
            price:    s.price,
            quantity: serviceQty[s.id],
        }));

    const itemsTotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const grandTotal = priceData ? Math.round(priceData.finalTotalPrice) + itemsTotal : null;

    const handleCheckInChange = (value: string) => {
        setCheckIn(value);
        if (value && checkOut && value >= checkOut) {
            setCheckOut(nextDay(value));
        }
    };

    const addService = (id: string) =>
        setServiceQty((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

    const removeService = (id: string) =>
        setServiceQty((prev) => {
            const next = { ...prev };
            if ((next[id] ?? 0) > 1) next[id]--;
            else delete next[id];
            return next;
        });

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!name.trim())  e.name  = "Введите ваше имя";
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            e.email = "Введите корректный e-mail";
        if (!phone.trim() || phone.replace(/\D/g, "").length < 7)
            e.phone = "Введите корректный номер телефона";
        if (!checkIn)  e.checkIn  = "Выберите дату заезда";
        if (!checkOut) e.checkOut = "Выберите дату выезда";
        if (nights <= 0) e.checkOut = "Дата выезда должна быть позже даты заезда";
        if (Number(guests) < 1) e.guests = "Минимум 1 гость";
        if (roomType && Number(guests) > roomType.capacity)
            e.guests = `Максимум ${roomType.capacity} гостей`;
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        createReservation(
            {
                roomTypeId,
                customerName:  name.trim(),
                customerEmail: email.trim(),
                customerPhone: phone.trim(),
                startDate:     checkIn,
                endDate:       checkOut,
                guestCount:    Number(guests),
                notes:         notes.trim() || undefined,
                items:         selectedItems.length > 0 ? selectedItems : undefined,
            },
            {
                onSuccess: (res) => {
                    localStorage.setItem("pendingReservationId", res.id);
                    navigate(`/booking/${res.id}`);
                },
                onError: (err: unknown) => {
                    const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
                    const isConflict = axiosErr?.response?.status === 409;
                    const msg = axiosErr?.response?.data?.message ?? "Произошла ошибка. Попробуйте ещё раз.";
                    setErrors({
                        submit: isConflict
                            ? "Выбранный период уже занят. Пожалуйста, выберите другие даты."
                            : msg,
                    });
                },
            }
        );
    };

    if (!roomTypeId) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <p className="font-georgia text-stone-600 text-lg">Номер не указан</p>
                <Link to="/rooms" className="mt-4 text-sm text-amber-600 hover:underline">
                    Вернуться к списку
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-6 flex flex-col gap-6">
            <Link
                to={`/rooms/${roomTypeId}`}
                className="flex items-center gap-2 text-sm text-stone-500 hover:text-amber-600 transition-colors w-fit"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад к номеру
            </Link>

            <h1 className="font-georgia font-bold text-stone-800 text-2xl">Оформление бронирования</h1>

            <div className="flex gap-6 items-start">
                {/* ── Форма ── */}
                <div className="flex-1 flex flex-col gap-5">

                    {/* Даты */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-4">
                        <h2 className="font-georgia font-semibold text-stone-700 text-base">Даты проживания</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-stone-500">Дата заезда</label>
                                <input
                                    type="date"
                                    value={checkIn}
                                    min={today}
                                    onChange={(e) => handleCheckInChange(e.target.value)}
                                    className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white ${errors.checkIn ? "border-red-400" : "border-stone-300"}`}
                                />
                                {errors.checkIn && <p className="text-xs text-red-500">{errors.checkIn}</p>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-stone-500">Дата выезда</label>
                                <input
                                    type="date"
                                    value={checkOut}
                                    min={checkIn || today}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white ${errors.checkOut ? "border-red-400" : "border-stone-300"}`}
                                />
                                {errors.checkOut && <p className="text-xs text-red-500">{errors.checkOut}</p>}
                            </div>
                        </div>
                        {nights > 0 && (
                            <p className="text-sm text-stone-500">
                                Продолжительность:{" "}
                                <span className="text-stone-700 font-medium">{pluralNights(nights)}</span>
                            </p>
                        )}
                    </div>

                    {/* Гости */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-3">
                        <h2 className="font-georgia font-semibold text-stone-700 text-base">Гости</h2>
                        <div className="flex flex-col gap-1 max-w-xs">
                            <label className="text-xs text-stone-500">
                                Количество гостей{roomType ? ` (макс. ${roomType.capacity})` : ""}
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={roomType?.capacity ?? 99}
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white ${errors.guests ? "border-red-400" : "border-stone-300"}`}
                            />
                            {errors.guests && <p className="text-xs text-red-500">{errors.guests}</p>}
                        </div>
                    </div>

                    {/* Доп. услуги */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-3">
                        <div>
                            <h2 className="font-georgia font-semibold text-stone-700 text-base">Дополнительные услуги</h2>
                            <p className="text-xs text-stone-400 mt-0.5">Необязательно — добавьте к вашему проживанию</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            {PRESET_SERVICES.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    quantity={serviceQty[service.id] ?? 0}
                                    onAdd={() => addService(service.id)}
                                    onRemove={() => removeService(service.id)}
                                />
                            ))}
                        </div>
                        {itemsTotal > 0 && (
                            <p className="text-xs text-stone-500 text-right">
                                Доп. услуги: <span className="font-medium text-stone-700">{itemsTotal}₼</span>
                            </p>
                        )}
                    </div>

                    {/* Контакты */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-4">
                        <h2 className="font-georgia font-semibold text-stone-700 text-base">Контактные данные</h2>

                        {(
                            [
                                { key: "name",  label: "Имя и фамилия", type: "text",  value: name,  setter: setName,  placeholder: "Иван Иванов" },
                                { key: "email", label: "E-mail",         type: "email", value: email, setter: setEmail, placeholder: "ivan@example.com" },
                                { key: "phone", label: "Телефон",        type: "tel",   value: phone, setter: setPhone, placeholder: "+994 50 000 00 00" },
                            ] as const
                        ).map(({ key, label, type, value, setter, placeholder }) => (
                            <div key={key} className="flex flex-col gap-1">
                                <label className="text-xs text-stone-500">{label}</label>
                                <input
                                    type={type}
                                    value={value}
                                    onChange={(e) => setter(e.target.value)}
                                    placeholder={placeholder}
                                    className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white ${errors[key] ? "border-red-400" : "border-stone-300"}`}
                                />
                                {errors[key] && <p className="text-xs text-red-500">{errors[key]}</p>}
                            </div>
                        ))}

                        {user && (
                            <p className="text-xs text-stone-400 flex items-center gap-1">
                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Имя и e-mail заполнены из вашего аккаунта
                            </p>
                        )}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-stone-500">Примечания (необязательно)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ранний заезд, особые пожелания..."
                                rows={3}
                                className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white resize-none"
                            />
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                            {errors.submit}
                        </div>
                    )}
                </div>

                {/* ── Сводка ── */}
                <div className="w-64 shrink-0 flex flex-col gap-4 sticky top-4">
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-3">
                        <h2 className="font-georgia font-semibold text-stone-700 text-base">Итого</h2>

                        {roomLoading ? (
                            <div className="h-5 w-32 bg-stone-100 animate-pulse rounded" />
                        ) : roomType ? (
                            <p className="text-stone-700 font-medium text-sm">{roomType.name}</p>
                        ) : null}

                        {nights > 0 && (
                            <p className="text-stone-500 text-sm">{pluralNights(nights)}</p>
                        )}

                        <div className="border-t border-stone-100 pt-3 flex flex-col gap-1.5">
                            {priceLoading ? (
                                <div className="h-7 w-24 bg-stone-100 animate-pulse rounded" />
                            ) : priceData && nights > 0 ? (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-500">Проживание</span>
                                        <span className="text-stone-700">{Math.round(priceData.finalTotalPrice)}₼</span>
                                    </div>
                                    {itemsTotal > 0 && (
                                        <>
                                            {selectedItems.map((item) => (
                                                <div key={item.name} className="flex justify-between text-sm">
                                                    <span className="text-stone-500 truncate">{item.name} ×{item.quantity}</span>
                                                    <span className="text-stone-700 shrink-0">{item.price * item.quantity}₼</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                    <div className="flex justify-between font-bold text-base pt-1 border-t border-stone-100 mt-1">
                                        <span className="text-stone-700">Итого</span>
                                        <span className="text-amber-700">{grandTotal}₼</span>
                                    </div>
                                </>
                            ) : nights > 0 ? (
                                <p className="text-stone-400 text-sm">Цена недоступна</p>
                            ) : (
                                <p className="text-stone-400 text-sm">Выберите даты</p>
                            )}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isPending || nights <= 0}
                            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 font-medium text-sm transition-colors"
                        >
                            {isPending ? "Создание брони..." : "Перейти к оплате"}
                        </button>

                        <p className="text-xs text-stone-400 text-center leading-relaxed">
                            Бронь удерживается 15 минут после создания
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}