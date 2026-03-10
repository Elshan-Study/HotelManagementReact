import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

interface Props {
    allowedRole?: string;
}

export default function ProtectedRoute({ allowedRole }: Props) {
    const { user } = useAuth();
    const isLoading = useSelector((state: RootState) => state.auth.isLoading);

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (!user) {
        return <Navigate to="/404" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to="/404" replace />;
    }

    return <Outlet />;
}