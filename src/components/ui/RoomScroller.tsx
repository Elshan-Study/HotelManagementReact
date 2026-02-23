// features/home/components/RoomScroller.tsx

import { Link } from "react-router-dom";
import { useRoomScroller } from "../../features/ hooks/useRoomScroller.ts";
import type { Room } from "../../pages/home.data.ts";
import "../../../src/index.css";

interface Props {
    items: Room[];
}

export default function RoomScroller({ items }: Props) {
    const { scrollRef, scrollTo,} = useRoomScroller();

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => scrollTo("left")}
                        className="btn w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        ←
                    </button>

                    <button
                        onClick={() => scrollTo("right")}
                        className="btn w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        →
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-5 py-2 overflow-x-auto snap-x snap-mandatory"
                style={{ scrollbarWidth: "none" }}
            >
                {items.map((item) => (
                    <Link
                        to="/rooms"
                        key={item.id}
                        className={`room-card btn shrink-0 snap-start rounded-2xl ${item.bg} flex flex-col items-center justify-center gap-3 border border-stone-200 p-6`}
                        style={{
                            scrollbarWidth: "none",
                            "--cols": "5",
                            "--gap": "20px",
                        } as React.CSSProperties}
                    >
                        <span className="text-6xl">{item.emoji}</span>
                        <span className="font-georgia font-bold text-stone-700 text-xl text-center">
              {item.label}
            </span>
                        <span className="text-sm text-stone-500 text-center px-2">
              {item.desc}
            </span>
                        <span className="text-sm text-amber-700 font-semibold bg-amber-100 px-4 py-1.5 rounded-full mt-1">
              {item.price}
            </span>
                    </Link>
                ))}
            </div>

        </div>
    );
}