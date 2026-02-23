import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthResponse } from "../features/auth/authTypes";

interface AuthState {
    user: AuthResponse | null;
    // Параметр isLoading нужен потому что у нас в main.tsx есть такая функция как "refresh(){ .then .... " которая при каждом обновлении страницы просит у сервера RefreshToken
    // но и за того что сервер долго отвечает а реакт его не ждёт программа ведет себя не правильно
    // и мы при помощи этой переменной не даем реакту обробатывать действие пока мы не получим ответ от сервера
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    isLoading: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<AuthResponse | null>) {
            state.user = action.payload;
            state.isLoading = false;
        },
        logout(state) {
            state.user = null;
            state.isLoading = false;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        }
    },
});

export const { setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;