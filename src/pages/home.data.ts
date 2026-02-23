// features/home/home.data.ts

export interface GallerySlide {
    id: number;
    label: string;
    bg: string;
}

export interface Room {
    id: number;
    label: string;
    price: string;
    bg: string;
    emoji: string;
    desc: string;
}

export interface Service {
    icon: string;
    label: string;
}

export const gallerySlides: GallerySlide[] = [
    { id: 1, label: "Люкс номер", bg: "bg-amber-100" },
    { id: 2, label: "Президентский люкс", bg: "bg-stone-200" },
    { id: 3, label: "Стандарт с видом", bg: "bg-blue-100" },
];

export const specialRooms: Room[] = [
    { id: 1, label: "Одноместный", price: "80$/ночь", bg: "bg-amber-50", emoji: "🛏️", desc: "Уютный номер для одного гостя" },
    { id: 2, label: "Двухместный", price: "120$/ночь", bg: "bg-stone-100", emoji: "🛏️🛏️", desc: "Просторный номер для двоих" },
    { id: 3, label: "Люкс", price: "250$/ночь", bg: "bg-amber-100", emoji: "👑", desc: "Премиум номер с панорамным видом" },
    { id: 4, label: "Апартаменты", price: "350$/ночь", bg: "bg-blue-50", emoji: "🏠", desc: "Полноценные апартаменты с кухней" },
    { id: 5, label: "Пентхаус", price: "600$/ночь", bg: "bg-rose-50", emoji: "🌆", desc: "Эксклюзивный пентхаус на верхнем этаже" },
    { id: 6, label: "TTTTTTT", price: "600$/ночь", bg: "bg-rose-50", emoji: "🌆", desc: "tttttttt ttttttttttttt ttttttttttt tttttt" },
    { id: 7, label: "BBBBBBBB", price: "600$/ночь", bg: "bg-rose-50", emoji: "🌆", desc: "bbbbbbb bbbbbbbbbbbbbb bbbbbbbbbb bbbbbb" },
    { id: 8, label: "CCCCCCCC", price: "600$/ночь", bg: "bg-rose-50", emoji: "🌆", desc: "cccccc ccccccccccc cccccccccccc cccccccc" },
    { id: 9, label: "UUUUUUUUU", price: "600$/ночь", bg: "bg-rose-50", emoji: "🌆", desc: "uuuuu uuuuuuuuuu uuuuuuuuuuu uuuuuuuuu" },
];

export const services: Service[] = [
    { icon: "🍽️", label: "Ресторан" },
    { icon: "💆", label: "СПА" },
    { icon: "🏊", label: "Бассейн" },
    { icon: "🅿️", label: "Парковка" },
    { icon: "🏋️", label: "Фитнес" },
    { icon: "🚗", label: "Трансфер" },
];

export const CARD_WIDTH = 280;