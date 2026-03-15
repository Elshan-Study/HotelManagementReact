import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useReservationById, useMockPayment } from "../features/reservation/useReservation";
import { pluralNights, formatDateLong } from "../utils/dateUtils";

function useCountdown(target: string | null | undefined): number | null {
    const [seconds, setSeconds] = useState<number | null>(null);
    useEffect(() => {
        if (!target) { setSeconds(null); return; }
        const calc = () => Math.max(0, Math.floor((new Date(target + "Z").getTime() - Date.now()) / 1000));
        setSeconds(calc());
        const id = setInterval(() => setSeconds(calc()), 1000);
        return () => clearInterval(id);
    }, [target]);
    return seconds;
}

export default function PaymentPage() {
    const { reservationId } = useParams<{ reservationId: string }>();
    const navigate = useNavigate();

    const { data: reservation, isLoading, isError } = useReservationById(reservationId ?? null);
    const { mutate: pay, isPending } = useMockPayment();

    const countdown = useCountdown(reservation?.heldUntil);
    const status = reservation?.status;

    useEffect(() => {
        if (status === "Confirmed") {
            navigate(`/booking/success/${reservationId}`, { replace: true });
        }
    }, [status, reservationId, navigate]);

    const handlePay = (simulateSuccess: boolean) => {
        if (!reservationId) return;
        pay(
            { reservationId, simulateSuccess },
            {
                onSuccess: (res) => {
                    if (res.status === "Confirmed") navigate(`/booking/success/${reservationId}`);
                },
                onError: (err: unknown) => {
                    const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
                    if (code === "HOLD_EXPIRED") {
                        navigate("/rooms", {
                            state: { error: "Время удержания брони истекло. Пожалуйста, создайте новую бронь." },
                        });
                    }
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="max-w-lg mx-auto py-12 flex flex-col gap-4">
                <div className="h-8 w-48 bg-stone-100 animate-pulse rounded-xl" />
                <div className="h-64 bg-stone-100 animate-pulse rounded-2xl" />
            </div>
        );
    }

    if (isError || !reservation) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <p className="font-georgia text-stone-600 text-lg">Бронь не найдена</p>
                <Link to="/rooms" className="mt-4 text-sm text-amber-600 hover:underline">Вернуться к списку</Link>
            </div>
        );
    }

    const holdExpired = countdown === 0;
    const itemsTotal  = reservation.items.reduce((s, i) => s + i.total, 0);

    return (
        <div className="max-w-lg mx-auto py-6 flex flex-col gap-6">

            <Link to="/rooms" className="flex items-center gap-2 text-sm text-stone-500 hover:text-amber-600 transition-colors w-fit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Вернуться к номерам
            </Link>

            <h1 className="font-georgia font-bold text-stone-800 text-2xl">Оплата бронирования</h1>

            {reservation.heldUntil && !holdExpired && countdown !== null && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-amber-700">
                        Бронь удерживается ещё{" "}
                        <span className="font-semibold tabular-nums">
                            {String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")}
                        </span>
                    </p>
                </div>
            )}

            {holdExpired && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    Время удержания брони истекло. Пожалуйста,{" "}
                    <Link to="/rooms" className="underline font-medium">создайте новую бронь</Link>.
                </div>
            )}

            {/* Детали */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-4">
                <h2 className="font-georgia font-semibold text-stone-700 text-base">Детали бронирования</h2>

                <div className="flex flex-col gap-2 text-sm">
                    {(
                        [
                            { label: "Номер комнаты",     value: reservation.roomNumber,                       className: "font-medium" },
                            { label: "Заезд",             value: formatDateLong(reservation.startDate) },
                            { label: "Выезд",             value: formatDateLong(reservation.endDate) },
                            { label: "Продолжительность", value: pluralNights(reservation.nightsCount) },
                            { label: "Гость",             value: reservation.customerName },
                            { label: "E-mail",            value: reservation.customerEmail },
                        ] satisfies { label: string; value: string; className?: string }[]
                    ).map(({ label, value, className }) => (
                        <div key={label} className="flex justify-between">
                            <span className="text-stone-500">{label}</span>
                            <span className={`text-stone-700 ${className ?? ""}`}>{value}</span>
                        </div>
                    ))}

                    {reservation.notes && (
                        <div className="flex justify-between">
                            <span className="text-stone-500">Примечания</span>
                            <span className="text-stone-700 text-right max-w-48">{reservation.notes}</span>
                        </div>
                    )}
                </div>

                {/* Доп. услуги */}
                {reservation.items.length > 0 && (
                    <div className="border-t border-stone-100 pt-3 flex flex-col gap-2">
                        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Дополнительные услуги</p>
                        {reservation.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-stone-600">{item.name} ×{item.quantity}</span>
                                <span className="text-stone-700">{Math.round(item.total)}₼</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="border-t border-stone-100 pt-3 flex flex-col gap-1">
                    {reservation.items.length > 0 && (
                        <div className="flex justify-between text-sm text-stone-500">
                            <span>Проживание</span>
                            <span>{Math.round(reservation.totalPrice - itemsTotal)}₼</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-stone-600 font-medium">Итого к оплате</span>
                        <span className="text-amber-700 font-bold text-2xl">{Math.round(reservation.totalPrice)}₼</span>
                    </div>
                </div>
            </div>

            {/* Оплата */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-4">
                <h2 className="font-georgia font-semibold text-stone-700 text-base">Способ оплаты</h2>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="text-sm text-stone-600 font-medium">Банковская карта (симуляция)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-stone-400">Номер карты</label>
                            <input type="text" readOnly defaultValue="4111 1111 1111 1111" className="border border-stone-200 bg-white rounded-lg px-3 py-1.5 text-sm text-stone-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-stone-400">CVV</label>
                            <input type="text" readOnly defaultValue="***" className="border border-stone-200 bg-white rounded-lg px-3 py-1.5 text-sm text-stone-400" />
                        </div>
                    </div>
                    <p className="text-xs text-stone-400">Это демо-оплата. Реальные данные карты не требуются.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => handlePay(true)}
                        disabled={isPending || holdExpired}
                        className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Обработка...
                            </>
                        ) : (
                            `Оплатить ${Math.round(reservation.totalPrice)}₼`
                        )}
                    </button>
                    <button
                        onClick={() => handlePay(false)}
                        disabled={isPending || holdExpired}
                        className="w-full border border-stone-300 hover:border-stone-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-600 rounded-xl py-2.5 text-sm transition-colors"
                    >
                        Симулировать ошибку оплаты
                    </button>
                </div>
            </div>
        </div>
    );
}