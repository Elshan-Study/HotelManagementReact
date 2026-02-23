import { useLoginForm } from "../features/ hooks/useLoginForm.ts";



export default function Login() {
    const {
        email, setEmail, password, setPassword,
        displayName, setDisplayName, isRegister, setIsRegister,
        message, onSubmit,
    } = useLoginForm();

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-5">


                {/* Логотип */}
                <div className="text-center">
                    <span className="font-georgia text-3xl font-bold text-stone-800">
                        Grand<span className="text-amber-600">Hotel</span>
                    </span>
                    <p className="text-stone-400 text-sm mt-1">
                        {isRegister ? "Создайте аккаунт" : "Войдите в аккаунт"}
                    </p>
                </div>

                {/* Поля */}
                <div className="flex flex-col gap-3">
                    <input
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition"
                    />

                    {isRegister && (
                        <input
                            placeholder="Имя"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition"
                        />
                    )}

                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition"
                    />
                </div>

                {/* Сообщение об ошибке / успехе */}
                {message && (
                    <p className={`text-sm text-center ${message.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
                        {message}
                    </p>
                )}

                {/* Кнопки */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onSubmit}
                        className="btn bg-amber-600 text-white rounded-xl py-2.5 text-sm font-medium"
                    >
                        {isRegister ? "Зарегистрироваться" : "Войти"}
                    </button>

                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="btn border border-stone-300 text-stone-600 rounded-xl py-2.5 text-sm"
                    >
                        {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Регистрация"}
                    </button>
                </div>

            </div>
        </div>
    );
}