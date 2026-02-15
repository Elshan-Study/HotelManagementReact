import { Outlet } from "react-router-dom";

export default function  AdminLayout() {
    return (
        <div className="flex">
            <aside className="w-64 border-r p-4">Admin Menu</aside>
            <Outlet />
        </div>
    );
}