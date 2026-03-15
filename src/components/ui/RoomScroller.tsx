import { useRef } from "react";
import { Link } from "react-router-dom";
import { usePriceCalculation } from "../../features/priceRule/usePriceRule.ts";

export interface RoomScrollerItem {
    id: number;
    label: string;
    imageUrl?: string;
    desc: string;
}

interface Props {
    items: RoomScrollerItem[];
}

function RoomScrollerCard({ item }: { item: RoomScrollerItem }) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = today.toISOString().split("T")[0];
    const endDate = tomorrow.toISOString().split("T")[0];

    const { data: priceData } = usePriceCalculation({
        roomTypeId: item.id,
        startDate,
        endDate,
    });

    const price = priceData ? `${Math.round(priceData.finalTotalPrice)}₼/ночь` : "—";

    return (
        <Link
            to={`/rooms/${item.id}`}
            className="room-card btn shrink-0 snap-start rounded-2xl overflow-hidden relative border border-stone-200"
            style={{ width: "280px", height: "320px", "--cols": "5", "--gap": "20px" } as React.CSSProperties}
        >
            {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.label} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
                <div className="absolute inset-0 bg-amber-50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1">
                <span className="font-georgia font-bold text-white text-xl">{item.label}</span>
                <span className="text-sm text-white/80 line-clamp-2">{item.desc}</span>
                <span className="text-sm text-amber-300 font-semibold mt-1">{price}</span>
            </div>
        </Link>
    );
}

export default function RoomScroller({ items }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollTo = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const card = scrollRef.current.firstElementChild as HTMLElement;
        if (!card) return;
        const cardWidth = card.offsetWidth + 20;
        scrollRef.current.scrollBy({
            left: direction === "right" ? cardWidth : -cardWidth,
            behavior: "smooth",
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                    <button onClick={() => scrollTo("left")} className="btn w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow">←</button>
                    <button onClick={() => scrollTo("right")} className="btn w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow">→</button>
                </div>
            </div>
            <div ref={scrollRef} className="flex gap-5 py-2 overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
                {items.map((item) => (
                    <RoomScrollerCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}