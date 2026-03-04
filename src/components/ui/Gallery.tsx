import { useState } from "react";
import type { GallerySlide } from "../../pages/home.data.ts";

interface Props {
    slides: GallerySlide[];
}

export default function Gallery({ slides }: Props) {
    const [current, setCurrent] = useState(0);

    const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
    const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));

    return (
        <div className="relative rounded-2xl overflow-hidden h-96 flex items-center justify-center bg-stone-100 shadow-inner">
            <div className={`absolute inset-0 ${slides[current].bg} transition-all duration-500`} />
            <span className="font-georgia relative z-10 text-stone-600 font-medium text-lg">
                <div className=""></div>
                {slides[current].label}
            </span>
            <button onClick={prev} className="btn absolute left-3 z-10 bg-white/80 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center text-xl">←</button>
            <button onClick={next} className="btn absolute right-3 z-10 bg-white/80 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center text-xl">→</button>
            <div className="absolute bottom-3 flex gap-1.5 z-10">
                {slides.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)}
                            className={`w-2 h-2 rounded-full transition ${i === current ? "bg-amber-600" : "bg-stone-300"}`}
                    />
                ))}
            </div>
        </div>
    );
}