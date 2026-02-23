// features/home/hooks/useGallery.ts

import { useState } from "react";
import type { GallerySlide } from "../../pages/home.data.ts";

export function useGallery(slides: GallerySlide[]) {
    const [current, setCurrent] = useState(0);

    const prev = () =>
        setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));

    const next = () =>
        setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));

    return {
        current,
        setCurrent,
        prev,
        next,
    };
}