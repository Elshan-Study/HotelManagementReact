// features/home/Home.tsx
import Gallery from "../components/ui/Gallery.tsx";
import RoomScroller from "../components/ui/RoomScroller.tsx";
import type { RoomScrollerItem } from "../components/ui/RoomScroller.tsx";
import { services } from "./home.data";
import { useRoomTypes } from "../features/roomType/useRoomTypes.tsx";
import { useDiscountedRoomTypes } from "../features/priceRule/usePriceRule.ts";

export default function Home() {
    const { data: roomTypesData, isLoading: loadingGallery } = useRoomTypes({
        page: 1,
        pageSize: 10,
        isActive: true,
    });

    const { data: discountedData, isLoading: loadingDiscounted } = useDiscountedRoomTypes(1, 10);

    const gallerySlides = (roomTypesData?.items ?? []).map((rt) => ({
        id: rt.id,
        label: rt.name,
        imageUrl: rt.photos[0]?.url,
    }));

    const specialRooms: RoomScrollerItem[] = (discountedData?.items ?? []).map((rt) => ({
        id: rt.id,
        label: rt.name,
        price: `${rt.basePrice}₼/ночь`,
        imageUrl: rt.photos[0]?.url,
        desc: rt.description,
    }));

    return (
        <div className="flex flex-col gap-8 py-4">
            <section>
                {loadingGallery ? (
                    <div className="h-96 rounded-2xl bg-stone-100 animate-pulse" />
                ) : (
                    <Gallery slides={gallerySlides} />
                )}
            </section>

            <section>
                <h2 className="font-georgia text-2xl font-bold text-stone-800 mb-2">О нас</h2>
                <p className="text-stone-600 leading-relaxed">
                    GrandHotel — это место, где каждая деталь продумана для вашего комфорта. Расположенный в самом сердце города, отель сочетает в себе элегантную архитектуру и современные удобства, создавая атмосферу изысканного уюта.
                </p>
                <p className="text-stone-600 leading-relaxed">
                    К услугам гостей просторные номера с панорамными видами, ресторан с авторской кухней, спа-центр с бассейном и фитнес-зал с новейшим оборудованием. Наша команда работает круглосуточно, чтобы каждый гость чувствовал себя желанным.
                </p>
                <p className="text-stone-600 leading-relaxed">
                    Мы предлагаем номера на любой вкус — от уютных стандартных до роскошных апартаментов с террасой. Каждый номер оснащён высокоскоростным Wi-Fi, климат-контролем и премиальными постельными принадлежностями.
                </p>
                <p className="text-stone-600 leading-relaxed">
                    GrandHotel — идеальный выбор как для деловых поездок, так и для романтического отдыха. Забронируйте номер сегодня и откройте для себя новый стандарт гостеприимства.
                </p>
            </section>

            <section>
                <h2 className="font-georgia text-2xl font-bold text-stone-800 mb-1">Спецпредложения</h2>
                {loadingDiscounted ? (
                    <div className="h-48 rounded-2xl bg-stone-100 animate-pulse" />
                ) : (
                    <RoomScroller items={specialRooms} />
                )}
            </section>

            <section>
                <h2 className="font-georgia text-2xl font-bold text-stone-800 mb-4">Услуги</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    {services.map((s) => (
                        <div
                            key={s.label}
                            className="btn rounded-2xl bg-stone border border-stone-200 flex flex-col items-center justify-center gap-3 p-6 cursor-default"
                            style={{ height: "180px" }}
                        >
                            <span className="text-6xl">{s.icon}</span>
                            <span className="font-georgia font-semibold text-stone-700 text-lg text-center">{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}