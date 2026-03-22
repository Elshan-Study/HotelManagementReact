import { useState } from "react";
import { useAuth } from "../features/auth/useAuth.ts";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { handleLogin, handleRegister } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [message, setMessage] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const onSubmit = async () => {
        try {
            if (isRegister) {
                await await handleRegister(email, displayName, password, phoneNumber || undefined);
            } else {
                await handleLogin(email, password);
            }
            navigate("/");
        } catch {
            setMessage("Error: Invalid credentials or user already exists");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center px-4 relative">

            <button
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 border border-white/40 text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-white/10 transition"
            >
                На главную
            </button>

            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-5">
                <div className="text-center">
                    <span className="font-georgia text-3xl font-bold text-stone-800">Grand<span className="text-amber-600">Hotel</span></span>
                    <p className="text-stone-400 text-sm mt-1">{isRegister ? "Создайте аккаунт" : "Войдите в аккаунт"}</p>
                </div>
                <div className="flex flex-col gap-3">
                    <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                           className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition" />
                    {isRegister && (
                        <input placeholder="Имя" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                               className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition" />
                    )}
                    {isRegister && (
                        <input
                            placeholder="Телефон (необязательно)"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition"
                        />
                    )}
                    <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)}
                           className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition" />
                </div>
                {message && (
                    <p className={`text-sm text-center ${message.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>{message}</p>
                )}
                <div className="flex flex-col gap-2">
                    <button onClick={() => void onSubmit()} className="btn bg-amber-600 text-white rounded-xl py-2.5 text-sm font-medium">
                        {isRegister ? "Зарегистрироваться" : "Войти"}
                    </button>
                    <button onClick={() => setIsRegister(!isRegister)} className="btn border border-stone-300 text-stone-600 rounded-xl py-2.5 text-sm">
                        {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Регистрация"}
                    </button>
                </div>
            </div>
        </div>
    );
}