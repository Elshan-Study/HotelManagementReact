// features/home/Home.tsx

import Gallery from "../components/ui/Gallery.tsx";
import RoomScroller from "../components/ui/RoomScroller.tsx";
import { gallerySlides, specialRooms, services } from "./home.data";

export default function Home() {
    return (
        <div className="flex flex-col gap-8 py-4">
            <section>
                <Gallery slides={gallerySlides} />
            </section>

            <section>
                <h2 className="font-georgia text-2xl font-bold text-stone-800 mb-2">
                    О нас
                </h2>
                <p className="text-stone-600 leading-relaxed">
                    GrandHotel — это место где роскошь встречается с уютом...
                </p>
            </section>

            <section>
                <h2 className="font-georgia text-2xl font-bold text-stone-800 mb-1">
                    Спецпредложения
                </h2>
                <RoomScroller items={specialRooms} />
            </section>

            <section>
                <h2 className="font-georgia text-2xl font-bold text-stone-800 mb-4">
                    Услуги
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    {services.map((s) => (
                        <div
                            key={s.label}
                            className="btn rounded-2xl bg-stone border border-stone-200 flex flex-col items-center justify-center gap-3 p-6 cursor-default"
                            style={{ height: "180px" }}
                        >
                            <span className="text-6xl">{s.icon}</span>
                            <span className="font-georgia font-semibold text-stone-700 text-lg text-center">
                {s.label}
              </span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}