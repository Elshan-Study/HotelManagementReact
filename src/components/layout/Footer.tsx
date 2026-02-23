export default function Footer() {
    return (
        <footer className="bg-stone-800 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <h3 className="font-georgia font-bold text-amber-400 mb-2 " >GrandHotel</h3>
                        <p className="text-sm text-stone-400">Ваш комфорт — наш приоритет</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Контакты</h4>
                        <p className="text-sm text-stone-400">+994 12 345 67 89</p>
                        <p className="text-sm text-stone-400">info@grandhotel.az</p>
                        <p className="text-sm text-stone-400">Баку, Азербайджан</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Информация</h4>
                        <p className="text-sm text-stone-400">Политика конфиденциальности</p>
                        <p className="text-sm text-stone-400">Правила отеля</p>
                    </div>
                </div>
                <div className="border-t border-stone-700 mt-6 pt-4 text-center text-xs text-stone-500">
                    © {new Date().getFullYear()} GrandHotel — Elshan Isayev & Amil Mammadov project
                </div>
            </div>
        </footer>
    );
}