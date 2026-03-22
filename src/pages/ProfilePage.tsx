import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { RootState } from "../store";
import { useUser } from "../features/user/useUser.ts";
import { useAuth } from "../features/auth/useAuth.ts";
import { useMyReservations } from "../features/reservation/useReservation.ts";
import type { UserResponse } from "../features/user/userTypes.ts";
import type { ReservationResponseDto, ReservationStatus } from "../features/reservation/reservationTypes.ts";
import ReservationModal from "../components/ui/ReservationModal.tsx";

const STATUS_META: Record<ReservationStatus, { bg: string; text: string; border: string; label: string }> = {
    Confirmed: { bg: "bg-green-100",  text: "text-green-700", border: "border-green-200",  label: "Подтверждена" },
    Pending:   { bg: "bg-amber-100",  text: "text-amber-700", border: "border-amber-200",  label: "Ожидает"      },
    Cancelled: { bg: "bg-red-100",    text: "text-red-600",   border: "border-red-200",    label: "Отменена"     },
    Completed: { bg: "bg-stone-100",  text: "text-stone-600", border: "border-stone-200",  label: "Завершена"    },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

type Tab = "profile" | "password" | "reservations";

export default function ProfilePage() {
    const authUser = useSelector((state: RootState) => state.auth.user);
    const navigate = useNavigate();
    const { loading, error, success, clearMessages, fetchProfile, handleUpdateProfile, handleChangePassword } = useUser();
    const { handleLogout } = useAuth();

    const [profile, setProfile] = useState<UserResponse | null>(null);
    const [tab, setTab] = useState<Tab>("profile");
    const [selectedRes, setSelectedRes] = useState<ReservationResponseDto | null>(null);

    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const { data: reservationsData, isLoading: resLoading } = useMyReservations(1, 50);
    const reservations = reservationsData?.items ?? [];

    const isLoading = useSelector((state: RootState) => state.auth.isLoading);

    useEffect(() => {
        if (isLoading) return; // ждём пока refresh отработает
        if (!authUser) { navigate("/auth/login"); return; }
        fetchProfile().then((data) => {
            if (!data) return;
            setProfile(data);
            setEmail(data.email);
            setDisplayName(data.displayName);
            setPhoneNumber(data.phoneNumber ?? "");
        });
    }, [isLoading, authUser]); // добавляем isLoading в deps
    const onTabChange = (t: Tab) => {
        setTab(t);
        clearMessages();
        setPasswordError(null);
    };

    const onSubmitProfile = async () => {
        const result = await handleUpdateProfile({ email, displayName, phoneNumber });  // ← добавить
        if (result) setProfile(result);
    };

    const onSubmitPassword = async () => {
        setPasswordError(null);
        if (newPassword !== confirmPassword) {
            setPasswordError("Пароли не совпадают.");
            return;
        }
        const ok = await handleChangePassword({ currentPassword, newPassword });
        if (ok) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    const onLogout = async () => {
        await handleLogout();
        navigate("/auth/login");
    };

    if (!profile) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <span className="text-stone-400 text-sm">Загрузка...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <header className="bg-white shadow-sm border-b border-stone-100">
                <div className="container mx-auto px-4 flex items-center justify-between py-3">
                    <Link to="/" className="font-georgia text-2xl font-bold tracking-tight text-stone-800">
                        Grand<span className="text-amber-600">Hotel</span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex items-start justify-center py-12 px-4">
                <div className="w-full max-w-md">

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl font-bold text-amber-600">
                                {profile.displayName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <h1 className="text-xl font-bold text-stone-800">{profile.displayName}</h1>
                        <p className="text-sm text-stone-400 mt-0.5">
                            {profile.role} · с {new Date(profile.createdAt).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                        <div className="flex border-b border-stone-100">
                            {([
                                { id: "profile" as Tab, label: "Профиль" },
                                { id: "password" as Tab, label: "Пароль" },
                                { id: "reservations" as Tab, label: "Брони" },
                            ]).map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => onTabChange(id)}
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                        tab === id
                                            ? "text-amber-600 border-b-2 border-amber-600 bg-amber-50/50"
                                            : "text-stone-500 hover:text-stone-700"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {(error || success || passwordError) && tab !== "reservations" && (
                                <div className={`mb-5 p-3 rounded-xl text-sm border ${
                                    success
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-red-50 text-red-700 border-red-200"
                                }`}>
                                    {success ?? passwordError ?? error}
                                </div>
                            )}

                            {tab === "profile" && (
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Имя</label>
                                        <input
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-amber-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-amber-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Телефон</label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="+994 50 000 00 00"
                                            className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-amber-500 transition-colors"
                                        />
                                    </div>
                                    <button
                                        onClick={onSubmitProfile}
                                        disabled={loading}
                                        className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors mt-1"
                                    >
                                        {loading ? "Сохранение..." : "Сохранить изменения"}
                                    </button>
                                </div>
                            )}

                            {tab === "password" && (
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Текущий пароль</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-amber-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Новый пароль</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-amber-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Подтвердите пароль</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-amber-500 transition-colors"
                                        />
                                    </div>
                                    <button
                                        onClick={onSubmitPassword}
                                        disabled={loading}
                                        className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors mt-1"
                                    >
                                        {loading ? "Смена пароля..." : "Сменить пароль"}
                                    </button>
                                </div>
                            )}

                            {tab === "reservations" && (
                                <div className="flex flex-col gap-3">
                                    {resLoading && (
                                        [...Array(3)].map((_, i) => (
                                            <div key={i} className="h-20 rounded-xl bg-stone-100 animate-pulse" />
                                        ))
                                    )}

                                    {!resLoading && reservations.length === 0 && (
                                        <div className="text-center py-8 text-stone-400 text-sm">
                                            У вас пока нет бронирований
                                        </div>
                                    )}

                                    {reservations.map((res) => {
                                        const meta = STATUS_META[res.status];
                                        return (
                                            <button
                                                key={res.id}
                                                onClick={() => setSelectedRes(res)}
                                                className="w-full text-left bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 rounded-xl px-4 py-3 transition-colors"
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <p className="text-sm font-medium text-stone-800">
                                                        {res.roomTypeName} · №{res.roomNumber}
                                                    </p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${meta.bg} ${meta.text} ${meta.border}`}>
                                                        {meta.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-stone-400">
                                                        {formatDate(res.startDate)} — {formatDate(res.endDate)} · {res.nightsCount} ночей
                                                    </p>
                                                    <p className="text-xs font-medium text-amber-700">{res.totalPrice} ₼</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Link
                            to="/"
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center text-stone-500 hover:text-amber-600 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 transition-colors"
                        >
                            На сайт
                        </Link>
                        <button
                            onClick={onLogout}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 border border-stone-200 hover:border-red-200 transition-colors"
                        >
                            Выйти из аккаунта
                        </button>
                    </div>
                </div>
            </main>

            {selectedRes && (
                <ReservationModal
                    key={selectedRes.id}
                    res={selectedRes}
                    onClose={() => setSelectedRes(null)}
                />
            )}
        </div>
    );
}