import { useSearchParams, Link } from "react-router-dom";
import { useRef, useCallback, useEffect, useState } from "react";
import { useInfiniteRoomTypes } from "../features/roomType/useRoomTypes";
import { usePriceCalculation } from "../features/priceRule/usePriceRule";
import { useInfiniteTags } from "../features/tag/useTag";
import type { RoomTypeResponseDto } from "../features/roomType/roomTypeTypes";

const SORT_OPTIONS = [
    { value: "basePrice:asc",  label: "Цена (сначала самая низкая)" },
    { value: "basePrice:desc", label: "Цена (сначала самая высокая)" },
    { value: "name:asc",       label: "Название (в алфавитном порядке)" },
    { value: "name:desc",      label: "Название (в обратном алфавитном порядке)" },
];

function getTagLabel(tag: { slug: string; translations: Record<string, string> }) {
    return tag.translations["en"] ?? tag.slug;
}

function RoomTypeCard({
                          roomType, checkIn, checkOut, nights,
                      }: {
    roomType: RoomTypeResponseDto;
    checkIn: string;
    checkOut: string;
    nights: number;
}) {
    const hasDates = checkIn !== "" && checkOut !== "";

    const { data: priceData, isLoading: priceLoading } = usePriceCalculation(
        hasDates ? { roomTypeId: roomType.id, startDate: checkIn, endDate: checkOut } : null
    );

    const photo = roomType.photos[0]?.url;
    const avgPrice   = priceData && nights > 0 ? Math.round(priceData.finalTotalPrice / nights) : null;
    const totalPrice = priceData ? Math.round(priceData.finalTotalPrice) : null;

    return (
        <Link
            to={`/rooms/${roomType.id}${hasDates ? `?checkIn=${checkIn}&checkOut=${checkOut}` : ""}`}
            className="flex gap-4 bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
        >
            <div className="w-48 h-36 shrink-0 bg-stone-100">
                {photo ? (
                    <img src={photo} alt={roomType.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-stone-200" />
                )}
            </div>

            <div className="flex flex-1 items-center gap-4 py-4 pr-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-georgia font-bold text-stone-800 text-lg">{roomType.name}</h3>
                    <p className="text-stone-500 text-sm mt-1 line-clamp-1">
                        {roomType.description.slice(0, 80)}
                    </p>
                    {roomType.tags.length > 0 && (() => {
                        const visibleTags: typeof roomType.tags = [];
                        let totalChars = 0;
                        for (const tag of roomType.tags) {
                            if (visibleTags.length >= 4) break;
                            const label = getTagLabel(tag);
                            if (totalChars + label.length > 50) break;
                            visibleTags.push(tag);
                            totalChars += label.length;
                        }
                        const hiddenCount = roomType.tags.length - visibleTags.length;
                        return (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {visibleTags.map((tag) => (
                                    <span key={tag.id} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                                        {getTagLabel(tag)}
                                    </span>
                                ))}
                                {hiddenCount > 0 && (
                                    <span className="text-xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full">
                                        +{hiddenCount}
                                    </span>
                                )}
                            </div>
                        );
                    })()}
                </div>

                <div className="shrink-0 text-right min-w-32">
                    {!hasDates ? (
                        <p className="text-stone-400 text-sm">Выберите даты<br />для расчёта цены</p>
                    ) : priceLoading ? (
                        <div className="w-28 h-10 bg-stone-100 animate-pulse rounded-lg" />
                    ) : avgPrice !== null ? (
                        <>
                            <div className="text-amber-700 font-bold text-xl">
                                {avgPrice}₼
                                <span className="text-sm font-normal text-stone-400"> / ночь</span>
                            </div>
                            <div className="text-stone-400 text-xs mt-0.5">
                                итого {totalPrice}₼ за {nights} {nights === 1 ? "ночь" : nights < 5 ? "ночи" : "ночей"}
                            </div>
                        </>
                    ) : (
                        <p className="text-stone-400 text-sm">Цена недоступна</p>
                    )}
                </div>
            </div>
        </Link>
    );
}

function FiltersPanel({
                          selectedTagIds, onTagToggle, adults, children, onAdultsChange, onChildrenChange,
                      }: {
    selectedTagIds: number[];
    onTagToggle: (id: number) => void;
    adults: string;
    children: string;
    onAdultsChange: (v: string) => void;
    onChildrenChange: (v: string) => void;
}) {
    const { data: tagsData, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteTags({
        pageSize: 50,
        sortBy: "Slug:asc",
    });

    const allTags = tagsData?.pages.flatMap((p) => p.items).filter(Boolean) ?? [];
    const observerTarget = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries;
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage]
    );

    useEffect(() => {
        const element = observerTarget.current;
        if (!element) return;
        const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
        observer.observe(element);
        return () => observer.disconnect();
    }, [handleObserver]);

    return (
        <div className="w-56 shrink-0 flex flex-col gap-5">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="font-georgia font-semibold text-stone-700 text-sm">Вместимость</h3>
                <div className="flex flex-col gap-2">
                    {([
                        { label: "Взрослые", value: adults,   min: 1, setter: onAdultsChange },
                        { label: "Дети",     value: children, min: 0, setter: onChildrenChange },
                    ] as const).map(({ label, value, min, setter }) => (
                        <div key={label} className="flex flex-col gap-1">
                            <label className="text-xs text-stone-400">{label}</label>
                            <input
                                type="number"
                                min={min}
                                value={value}
                                onChange={(e) => setter(e.target.value)}
                                placeholder={String(min)}
                                className="border border-stone-300 bg-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500 w-full"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="font-georgia font-semibold text-stone-700 text-sm">Удобства</h3>
                <div className="flex flex-col gap-2">
                    {allTags.map((tag) => (
                        <label key={tag.id} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedTagIds.includes(tag.id)}
                                onChange={() => onTagToggle(tag.id)}
                                className="w-4 h-4 rounded border-stone-300 accent-amber-600 cursor-pointer"
                            />
                            <span className="text-sm text-stone-600 group-hover:text-stone-800 transition-colors">
                                {getTagLabel(tag)}
                            </span>
                        </label>
                    ))}
                    <div ref={observerTarget}>
                        {isFetchingNextPage && (
                            <p className="text-xs text-stone-400 py-1">Загрузка...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Rooms() {
    const [searchParams] = useSearchParams();
    const [sortBy, setSortBy] = useState("basePrice:asc");
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [adults, setAdults] = useState("");
    const [children, setChildren] = useState("");

    const checkIn  = searchParams.get("checkIn")  ?? "";
    const checkOut = searchParams.get("checkOut") ?? "";
    const guests   = Number(searchParams.get("guests") ?? 1);

    const nights =
        checkIn && checkOut
            ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000)
            : 0;

    const effectiveCapacity    = adults || children ? (Number(adults) || 0) + (Number(children) || 0) : guests;
    const effectiveMinAdults   = adults   ? Number(adults)   : undefined;
    const effectiveMinChildren = children ? Number(children) : undefined;

    const handleTagToggle = (id: number) => {
        setSelectedTagIds((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteRoomTypes({
            pageSize: 10,
            isActive: true,
            minCapacity:   effectiveCapacity,
            minAdults:     effectiveMinAdults,
            minChildren:   effectiveMinChildren,
            tagIds:        selectedTagIds.length > 0 ? selectedTagIds : undefined,
            sortBy,
            checkIn:  checkIn  || undefined,
            checkOut: checkOut || undefined,
        });

    const allRoomTypes = data?.pages.flatMap((p) => p.items).filter(Boolean) ?? [];
    const observerTarget = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries;
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage]
    );

    useEffect(() => {
        const element = observerTarget.current;
        if (!element) return;
        const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
        observer.observe(element);
        return () => observer.disconnect();
    }, [handleObserver]);

    return (
        <div className="flex gap-6 py-4">
            <FiltersPanel
                selectedTagIds={selectedTagIds}
                onTagToggle={handleTagToggle}
                adults={adults}
                children={children}
                onAdultsChange={setAdults}
                onChildrenChange={setChildren}
            />

            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-stone-500 text-sm">
                        {isLoading
                            ? "Загрузка..."
                            : `Найдено: ${data?.pages[0]?.totalCount ?? 0}${checkIn && checkOut ? " (с учётом доступности)" : ""}`}
                    </p>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-stone-300 bg-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-3">
                    {isLoading && [...Array(4)].map((_, i) => (
                        <div key={i} className="h-36 rounded-2xl bg-stone-100 animate-pulse" />
                    ))}

                    {allRoomTypes.map((roomType) => (
                        <RoomTypeCard
                            key={roomType.id}
                            roomType={roomType}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            nights={nights}
                        />
                    ))}

                    <div ref={observerTarget} className="py-4 text-center">
                        {isFetchingNextPage && (
                            <p className="text-stone-400 text-sm">Загружаем ещё...</p>
                        )}
                        {!hasNextPage && allRoomTypes.length > 0 && (
                            <p className="text-stone-300 text-xs">Все номера загружены</p>
                        )}
                    </div>

                    {!isLoading && allRoomTypes.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <p className="font-georgia text-stone-600 text-lg">Номера не найдены</p>
                            <p className="text-sm mt-1 text-stone-400">
                                {checkIn && checkOut
                                    ? "На выбранные даты свободных номеров нет"
                                    : "Попробуйте изменить параметры поиска"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}