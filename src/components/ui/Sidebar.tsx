
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();

    const linkClasses = ({ isActive }: { isActive: boolean }) =>
        `block px-4 py-2 rounded-md font-medium transition 
     ${
            isActive
                ? "bg-red-700 text-white"
                : "bg-red-400 text-white hover:bg-red-600"
        }`;

    return (
        <aside className="w-[220px] bg-red-600 flex flex-col justify-between p-4">
            <div>
                {/* Top Admin block */}
                <div className="bg-red-400 text-center py-3 rounded-md mb-6 font-semibold text-white">
                    Admin
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-3">
                    <NavLink to="/admin/users" className={linkClasses}>
                        Users
                    </NavLink>

                    <NavLink to="/admin/rooms" className={linkClasses}>
                        Rooms
                    </NavLink>

                    <NavLink to="/admin/price-calendar" className={linkClasses}>
                        PriceCalendar
                    </NavLink>
                </nav>
            </div>

            {/* Return button */}
            <button
                onClick={() => navigate("/")}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-md transition"
            >
                RETURN
            </button>
        </aside>
    );
};

export default Sidebar;