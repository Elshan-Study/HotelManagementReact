import { Outlet } from "react-router-dom";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1 container mx-auto p-4">
                <Outlet /> {/* <- сюда React Router подставит дочерние маршруты */}
            </main>
            <Footer/>
        </div>
    );
}