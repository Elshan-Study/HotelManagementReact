import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useRoomType } from "../features/roomType/useRoomTypes";
import { usePriceCalculation } from "../features/priceRule/usePriceRule";
import { getTodayAndTomorrow, nightsBetween, nextDay, pluralNights } from "../utils/dateUtils";

const VISIBLE_PHOTOS = 5;

export default function RoomDetails() {
    const { id } = useParams<{ id: string }>();
    const roomTypeId = Number(id);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { today, tomorrow } = getTodayAndTomorrow();

    const [checkIn,  setCheckIn]  = useState(searchParams.get("checkIn")  || today);
    const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || tomorrow);
    const [showAllPhotos,    setShowAllPhotos]    = useState(false);
    const [showBreakdown,    setShowBreakdown]    = useState(false);

    const { data: roomType, isLoading } = useRoomType(roomTypeId);

    const nights = nightsBetween(checkIn, checkOut);

    const { data: priceData, isLoading: priceLoading } = usePriceCalculation(
        roomTypeId && checkIn && checkOut && nights > 0
            ? { roomTypeId, startDate: checkIn, endDate: checkOut }
            : null
    );

    const handleCheckInChange = (value: string) => {
        setCheckIn(value);
        if (value && checkOut && value >= checkOut) {
            setCheckOut(nextDay(value));
        }
    };

    const handleBook = () => {
        navigate(`/booking/new?roomTypeId=${roomTypeId}&checkIn=${checkIn}&checkOut=${checkOut}`);
    };

    const adultWord = (n: number) => {
        if (n % 10 === 1 && n % 100 !== 11) return "взрослый";
        return "взрослых";
    };
    const childWord = (n: number) => {
        if (n % 10 === 1 && n % 100 !== 11) return "ребёнок";
        if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "ребёнка";
        return "детей";
    };
    const breakLongWords = (text: string, maxLen = 15): string =>
        text.split(" ").map((word) =>
            word.length > maxLen
                ? word.match(new RegExp(`.{1,${maxLen}}`, "g"))?.join("\u200B") ?? word
                : word
        ).join(" ");

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 py-4">
                <div className="h-96 rounded-2xl bg-stone-100 animate-pulse" />
                <div className="h-8 w-48 rounded-xl bg-stone-100 animate-pulse" />
                <div className="h-24 rounded-xl bg-stone-100 animate-pulse" />
            </div>
        );
    }

    if (!roomType) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <p className="font-georgia text-stone-600 text-lg">Номер не найден</p>
                <Link to="/rooms" className="mt-4 text-sm text-amber-600 hover:underline">
                    Вернуться к списку
                </Link>
            </div>
        );
    }

    const visiblePhotos = roomType.photos.slice(0, VISIBLE_PHOTOS);
    const hiddenCount   = roomType.photos.length - VISIBLE_PHOTOS;

    const avgPrice   = priceData && nights > 0 ? Math.round(priceData.finalTotalPrice / nights) : null;
    const totalPrice = priceData ? Math.round(priceData.finalTotalPrice) : null;

    return (
        <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto">

            {/* Назад */}
            <Link
                to="/rooms"
                className="flex items-center gap-2 text-sm text-stone-500 hover:text-amber-600 transition-colors w-fit"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Все номера
            </Link>

            {/* Заголовок */}
            <div>
                <h1 className="font-georgia font-bold text-stone-800 text-3xl">{roomType.name}</h1>
                <p className="text-stone-500 text-sm mt-1">
                    до {roomType.maxOccupancyAdults} {adultWord(roomType.maxOccupancyAdults)}
                    {roomType.maxOccupancyChildren > 0 && ` · до ${roomType.maxOccupancyChildren} ${childWord(roomType.maxOccupancyChildren)}`}
                </p>
            </div>

            {/* Галерея */}
            {roomType.photos.length > 0 && (
                <div className={`grid gap-2 h-80 ${roomType.photos.length === 1 ? "grid-cols-1" : "grid-cols-4 grid-rows-2"}`}>
                    <div className={`${roomType.photos.length === 1 ? "" : "col-span-2 row-span-2"} rounded-2xl overflow-hidden bg-stone-100`}>
                        <img
                            src={roomType.photos[0].url}
                            alt={roomType.photos[0].altText ?? roomType.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {roomType.photos.length > 1 && visiblePhotos.slice(1).map((photo, index) => {
                        const isLast = index === visiblePhotos.slice(1).length - 1 && hiddenCount > 0;
                        return (
                            <div
                                key={photo.id}
                                className="relative rounded-xl overflow-hidden bg-stone-100 cursor-pointer"
                                onClick={() => isLast && setShowAllPhotos(true)}
                            >
                                <img src={photo.url} alt={photo.altText ?? roomType.name} className="w-full h-full object-cover" />
                                {isLast && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-semibold text-lg">+{hiddenCount}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Модалка всех фото */}
            {showAllPhotos && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowAllPhotos(false)}>
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-georgia font-bold text-stone-800 text-lg">Все фото — {roomType.name}</h3>
                            <button onClick={() => setShowAllPhotos(false)} className="text-stone-400 hover:text-stone-600 text-xl">✕</button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {roomType.photos.map((photo) => (
                                <div key={photo.id} className="rounded-xl overflow-hidden aspect-video bg-stone-100">
                                    <img src={photo.url} alt={photo.altText ?? roomType.name} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Контент */}
            <div className="flex gap-8 items-start">
                {/* Левая часть */}
                <div className="flex-1 flex flex-col gap-6">
                    {roomType.tags.length > 0 && (
                        <div>
                            <h2 className="font-georgia font-semibold text-stone-700 text-lg mb-2">Услуги и удобства</h2>
                            <div className="flex flex-wrap gap-2">
                                {roomType.tags.map((tag) => (
                                    <span key={tag.id} className="text-sm bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full">
                                        {tag.translations["en"] ?? tag.slug}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="font-georgia font-semibold text-stone-700 text-lg mb-2">Описание</h2>
                        <p className="text-stone-600 leading-relaxed break-words">{breakLongWords(roomType.description)}</p>
                    </div>

                    {/* Breakdown цены по дням */}
                    {priceData && priceData.dailyBreakdown.length > 0 && nights > 0 && (
                        <div>
                            <button
                                onClick={() => setShowBreakdown((v) => !v)}
                                className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                            >
                                <svg className={`w-4 h-4 transition-transform ${showBreakdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                {showBreakdown ? "Скрыть" : "Показать"} расчёт по дням
                            </button>

                            {showBreakdown && (
                                <div className="mt-3 bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                        <tr className="border-b border-stone-200 bg-stone-100">
                                            <th className="text-left px-4 py-2 text-stone-600 font-medium">Дата</th>
                                            <th className="text-right px-4 py-2 text-stone-600 font-medium">Базовая</th>
                                            <th className="text-right px-4 py-2 text-stone-600 font-medium">Итого</th>
                                            <th className="text-left px-4 py-2 text-stone-500 font-normal">Правила</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {priceData.dailyBreakdown.map((day, i) => (
                                            <tr key={i} className="border-b border-stone-100 last:border-0">
                                                <td className="px-4 py-2 text-stone-600">
                                                    {new Date(day.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", weekday: "short" })}
                                                </td>
                                                <td className="px-4 py-2 text-right text-stone-400">{Math.round(day.basePrice)}₼</td>
                                                <td className={`px-4 py-2 text-right font-medium ${day.finalPrice < day.basePrice ? "text-green-600" : day.finalPrice > day.basePrice ? "text-red-500" : "text-stone-700"}`}>
                                                    {Math.round(day.finalPrice)}₼
                                                </td>
                                                <td className="px-4 py-2 text-stone-400 text-xs">
                                                    {day.appliedRules.length > 0
                                                        ? day.appliedRules.map((r) =>
                                                            `${r.ruleName} (${r.priceDelta > 0 ? "+" : ""}${Math.round(r.priceDelta)}₼)`
                                                        ).join(", ")
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                        <tfoot>
                                        <tr className="bg-stone-100">
                                            <td colSpan={2} className="px-4 py-2 text-stone-600 font-medium">Итого за {pluralNights(nights)}</td>
                                            <td className="px-4 py-2 text-right text-amber-700 font-bold">{totalPrice}₼</td>
                                            <td />
                                        </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Правая панель — цена и бронирование */}
                <div className="w-72 shrink-0 bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-4 sticky top-4">

                    {/* Выбор дат */}
                    <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-stone-400">Заезд</label>
                                <input
                                    type="date"
                                    value={checkIn}
                                    min={today}
                                    onChange={(e) => handleCheckInChange(e.target.value)}
                                    className="border border-stone-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500 bg-white"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-stone-400">Выезд</label>
                                <input
                                    type="date"
                                    value={checkOut}
                                    min={checkIn || today}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    className="border border-stone-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500 bg-white"
                                />
                            </div>
                        </div>
                        {nights > 0 && (
                            <p className="text-xs text-stone-400 text-center">{pluralNights(nights)}</p>
                        )}
                    </div>

                    {/* Цена */}
                    <div>
                        {priceLoading ? (
                            <div className="w-32 h-8 bg-stone-100 animate-pulse rounded-lg" />
                        ) : avgPrice !== null && nights > 0 ? (
                            <>
                                <div className="text-amber-700 font-bold text-2xl">
                                    {avgPrice}₼
                                    <span className="text-sm font-normal text-stone-400"> / ночь</span>
                                </div>
                                <p className="text-xs text-stone-400 mt-0.5">
                                    Итого {totalPrice}₼ за {pluralNights(nights)}
                                </p>
                                {priceData && priceData.finalTotalPrice !== priceData.baseTotalPrice && (
                                    <p className="text-xs text-stone-400 line-through mt-0.5">
                                        без скидки {Math.round(priceData.baseTotalPrice)}₼
                                    </p>
                                )}
                            </>
                        ) : priceData ? (
                            <div className="text-amber-700 font-bold text-2xl">
                                {Math.round(priceData.finalTotalPrice)}₼
                                <span className="text-sm font-normal text-stone-400"> / ночь</span>
                            </div>
                        ) : (
                            <p className="text-stone-400 text-sm">Выберите даты для расчёта цены</p>
                        )}
                    </div>

                    <button
                        onClick={handleBook}
                        disabled={nights <= 0}
                        className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 font-medium transition-colors"
                    >
                        Забронировать
                    </button>

                    {nights <= 0 && (
                        <p className="text-xs text-stone-400 text-center">Выберите даты для бронирования</p>
                    )}
                </div>
            </div>
        </div>
    );
}