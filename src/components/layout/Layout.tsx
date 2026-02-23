import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../features/auth/useAuth";
import Footer from "./Footer.tsx";
import "../../index.css";

// Страницы где показывается BookingBar
const PAGES_WITH_BOOKING = ["/", "/rooms"];

function BookingBar() {
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);

    return (
        <div className="sticky top-4 z-50 mx-55 mt-4 rounded-2xl bg-stone-100 border border-stone-300 px-4 py-3">
            <div className="text-"></div>
            <div className="pl-5 container mx-auto flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-stone-500 font-medium">Заезд</label>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                           className="border border-stone-300 bg-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-stone-500 font-medium">Выезд</label>
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                           className="border border-stone-300 bg-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-stone-500 font-medium">Кол-во гостей</label>
                    <input type="number" min={1} max={10} value={guests}
                           onChange={(e) => setGuests(Number(e.target.value))}
                           className="border border-stone-300 bg-white rounded-lg px-2 py-1.5 text-sm w-20 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <Link to="/rooms" className="btn bg-amber-600 text-white rounded-lg px-5 py-2 text-sm font-medium">
                    Найти
                </Link>
            </div>
        </div>
    );
}

export default function Layout() {
    const { user, handleLogout } = useAuth();
    const location = useLocation();
    const showBooking = PAGES_WITH_BOOKING.includes(location.pathname);



    return (
        <div className="min-h-screen flex flex-col">


            <header
                className="top-0 z-50 bg-white shadow-sm"

            >
                {/* Верхняя строка — логотип + кнопки */}
                <div className="container mx-auto px-4 flex items-center justify-between py-3 border-b border-stone-100">
                    <Link to="/" className="font-georgia text-2xl font-bold tracking-tight text-stone-800" >
                        Grand<span className="text-amber-600">Hotel</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <button className="btn text-xs border border-stone-300 rounded-xl px-3 py-1 text-stone-600">
                            RU / EN
                        </button>

                        {user ? (
                            <div className="flex items-center gap-2">
                                {/*Как только на бек энде исправят дто надо будет поменять {user.email} что бы не емейл выводить а ник */}
                                <span className="text-xs text-stone-500 hidden sm:block">{user.email}</span>
                                <button onClick={handleLogout} className="btn text-xs bg-stone-800 text-white rounded-xl px-4 py-1.5">
                                    Выход
                                </button>
                            </div>
                        ) : (
                            <Link to="/auth/login" className="btn text-xs bg-amber-600 text-white rounded-xl px-4 py-1.5">
                                Вход
                            </Link>
                        )}

                        {user?.role === "Admin" && (
                            <Link to="/admin" className="btn text-xs bg-red-500 text-white rounded-full px-4 py-1.5">
                                Админ
                            </Link>
                        )}
                    </div>
                </div>

                {/* Навигация */}
                <nav className="container mx-auto px-4 flex gap-2 py-2">
                    <Link to="/" className="btn text-sm px-4 py-1.5 rounded-xl bg-amber-100 text-amber-800 font-medium">
                        Home
                    </Link>
                    <Link to="/rooms" className="btn text-sm px-4 py-1.5 rounded-xl bg-amber-100 text-amber-800 font-medium">
                        Rooms
                    </Link>
                </nav>
            </header>
            {showBooking && <BookingBar />}
            <main className="flex-1 container mx-auto p-4">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}