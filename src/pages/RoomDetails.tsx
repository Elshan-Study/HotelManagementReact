import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useRoomType } from "../features/roomType/useRoomTypes";
import { usePriceCalculation } from "../features/priceRule/usePriceRule";

const VISIBLE_PHOTOS = 5;

export default function RoomDetails() {
    const { id } = useParams<{ id: string }>();
    const roomTypeId = Number(id);

    const [showAllPhotos, setShowAllPhotos] = useState(false);

    const { data: roomType, isLoading } = useRoomType(roomTypeId);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = today.toISOString().split("T")[0];
    const endDate = tomorrow.toISOString().split("T")[0];

    const { data: priceData, isLoading: priceLoading } = usePriceCalculation(
        roomTypeId ? { roomTypeId, startDate, endDate } : null
    );

    const adultWord = (n: number): string => {
        if (n % 10 === 1 && n % 100 !== 11) return "взрослый";
        if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "взрослых";
        return "взрослых";
    };

    const childWord = (n: number): string => {
        if (n % 10 === 1 && n % 100 !== 11) return "ребёнок";
        if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "ребёнка";
        return "детей";
    };

    const breakLongWords = (text: string, maxLen = 15): string => {
        return text.split(" ").map((word) =>
            word.length > maxLen
                ? word.match(new RegExp(`.{1,${maxLen}}`, "g"))?.join("\u200B") ?? word
                : word
        ).join(" ");
    };
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
    const hiddenCount = roomType.photos.length - VISIBLE_PHOTOS;

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

            <div>
                <h1 className="font-georgia font-bold text-stone-800 text-3xl">{roomType.name}</h1>
                <p className="text-stone-500 text-sm mt-1">
                    {roomType.maxOccupancyAdults} {adultWord(roomType.maxOccupancyAdults)}
                    {roomType.maxOccupancyChildren > 0 && ` · ${roomType.maxOccupancyChildren} ${childWord(roomType.maxOccupancyChildren)}`}
                </p>
            </div>

            {/* Галерея фото */}
            {roomType.photos.length > 0 && (
                <div className={`grid gap-2 h-80 ${roomType.photos.length === 1 ? "grid-cols-1" : "grid-cols-4 grid-rows-2"}`}>
                    {/* Большое фото слева */}
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
                                <img
                                    src={photo.url}
                                    alt={photo.altText ?? roomType.name}
                                    className="w-full h-full object-cover"
                                />
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

            {/* Модальное окно со всеми фото */}
            {showAllPhotos && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowAllPhotos(false)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-georgia font-bold text-stone-800 text-lg">
                                Все фото — {roomType.name}
                            </h3>
                            <button
                                onClick={() => setShowAllPhotos(false)}
                                className="text-stone-400 hover:text-stone-600 text-xl"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {roomType.photos.map((photo) => (
                                <div key={photo.id} className="rounded-xl overflow-hidden aspect-video bg-stone-100">
                                    <img
                                        src={photo.url}
                                        alt={photo.altText ?? roomType.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Основная информация */}
            <div className="flex gap-8 items-start">
                <div className="flex-1 flex flex-col gap-4">

                    {roomType.tags.length > 0 && (
                        <div>
                            <h2 className="font-georgia font-semibold text-stone-700 text-lg mb-2">Услуги</h2>
                            <div className="flex flex-wrap gap-2">
                                {roomType.tags.map((tag) => (
                                    <span key={tag.id}
                                          className="text-sm bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="font-georgia font-semibold text-stone-700 text-lg mb-2">Описание</h2>
                        <p className="text-stone-600 leading-relaxed break-words">
                            {breakLongWords(roomType.description)}
                        </p>
                    </div>
                </div>

                {/* Блок цены и бронирования */}
                <div className="w-72 shrink-0 bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-4 sticky top-4">
                    <div>
                        {priceLoading ? (
                            <div className="w-32 h-8 bg-stone-100 animate-pulse rounded-lg" />
                        ) : priceData ? (
                            <>
                                <div className="text-amber-700 font-bold text-2xl">
                                    {Math.round(priceData.finalTotalPrice)}₼
                                    <span className="text-sm font-normal text-stone-400"> / ночь</span>
                                </div>
                                <p className="text-xs text-stone-400 mt-0.5">
                                    Цена на сегодняшний день
                                </p>
                            </>
                        ) : (
                            <p className="text-stone-400 text-sm">Цена недоступна</p>
                        )}
                    </div>

                        {/*кнопка бронирования — заглушка.*/}
                        {/*Будет реализована после того как будет готов*/}
                        {/*модуль резервирования на беке. */}
                    <button
                        disabled
                        className="w-full bg-amber-600 text-white rounded-xl py-3 font-medium opacity-50 cursor-not-allowed"
                    >
                        Забронировать
                    </button>
                    <p className="text-xs text-stone-400 text-center">
                        Бронирование временно недоступно
                    </p>
                </div>
            </div>
        </div>
    );
}