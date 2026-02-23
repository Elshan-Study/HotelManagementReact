// features/home/hooks/useRoomScroller.ts

import { useRef } from "react";

export function useRoomScroller() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollTo = (direction: "left" | "right") => {
        if (!scrollRef.current) return;

        const card = scrollRef.current.firstElementChild as HTMLElement;
        if (!card) return;

        const cardWidth = card.offsetWidth + 20; // 20px = gap-5

        scrollRef.current.scrollBy({
            left: direction === "right" ? cardWidth : -cardWidth,
            behavior: "smooth",
        });
    };

    return {
        scrollRef,
        scrollTo,
    };
}