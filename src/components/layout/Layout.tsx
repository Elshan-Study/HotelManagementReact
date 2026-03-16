import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../features/auth/useAuth.ts";
import Footer from "./Footer.tsx";
import "../../index.css";

const PAGES_WITH_BOOKING = ["/", "/rooms"];

function BookingBar() {
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);
    const navigate = useNavigate();

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);
        params.set("guests", String(guests));
        navigate(`/rooms?${params.toString()}`);
    };

    return (
        <div className="sticky top-4 z-50 mx-55 mt-4 rounded-2xl bg-stone-100 border border-stone-300 px-4 py-3">
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
                    <label className="text-xs text-stone-500 font-medium">Гостей</label>
                    <input type="number" min={1} max={10} value={guests}
                           onChange={(e) => setGuests(Number(e.target.value))}
                           className="border border-stone-300 bg-white rounded-lg px-2 py-1.5 text-sm w-20 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="btn bg-amber-600 text-white rounded-lg px-5 py-2 text-sm font-medium"
                >
                    Найти
                </button>
            </div>
        </div>
    );
}

export default function Layout() {
    const { user, handleLogout } = useAuth();
    const location = useLocation();
    const showBooking = PAGES_WITH_BOOKING.includes(location.pathname);
    const pendingId = localStorage.getItem("pendingReservationId");
    const showPendingBanner = !!pendingId && !location.pathname.startsWith("/booking");

    return (
        <div className="min-h-screen flex flex-col">
            <header className="top-0 z-50 bg-white shadow-sm">
                <div className="container mx-auto px-4 flex items-center justify-between py-3 border-b border-stone-100">
                    <Link to="/" className="font-georgia text-2xl font-bold tracking-tight text-stone-800">
                        Grand<span className="text-amber-600">Hotel</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button className="btn text-xs border border-stone-300 rounded-xl px-3 py-1 text-stone-600">
                            RU / EN
                        </button>
                        {user ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-stone-500 hidden sm:block">{user.displayName}</span>
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
                            <Link to="/admin" className="btn text-xs bg-red-500 text-white rounded-xl px-4 py-1.5">
                                Админ
                            </Link>
                        )}
                    </div>
                </div>
                <nav className="container mx-auto px-4 flex gap-2 py-2">
                    <Link to="/" className="btn text-sm px-4 py-1.5 rounded-xl bg-amber-100 text-amber-800 font-medium">Home</Link>
                    <Link to="/rooms" className="btn text-sm px-4 py-1.5 rounded-xl bg-amber-100 text-amber-800 font-medium">Rooms</Link>
                </nav>
            </header>
            {showPendingBanner && (
                <div className="mx-10 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-amber-700">У вас есть незавершённое бронирование</span>
                    </div>
                    <Link
                        to={`/booking/${pendingId}`}
                        className="text-sm font-medium text-amber-700 hover:text-amber-800 underline shrink-0"
                    >
                        Перейти к оплате
                    </Link>
                </div>
            )}
            {showBooking && <BookingBar />}
            <main className="flex-1 container mx-auto p-4">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}