import { useState } from "react";
import { useAuth } from "../auth/useAuth.tsx";
import { useNavigate } from "react-router-dom";


export const useLoginForm = () => {
    const { handleLogin, handleRegister, handleLogout, user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [message, setMessage] = useState("");

    const onSubmit = async () => {
        try {
            if (isRegister) {
                await handleRegister(email, displayName, password);
                // setMessage("Register successful!");
                navigate("/");
            } else {
                await handleLogin(email, password);
                // setMessage("Login successful!");
                navigate("/");
            }
        } catch {
            setMessage("Error: Invalid credentials or user already exists");
        }
    };

    const onLogout = async () => {
        await handleLogout();
        setMessage("Logged out");
    };

    return {
        user,
        email, setEmail,
        password, setPassword,
        displayName, setDisplayName,
        isRegister, setIsRegister,
        message,
        onSubmit,
        onLogout,
    };
};