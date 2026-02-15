import { Link } from "react-router-dom";

export default function Header() {
    return(
            <nav className="border-b p-4 flex gap-6">
                <Link to="/">Home</Link>
                <Link to="/rooms">Rooms</Link>
                <Link to="/admin">Admin</Link>
            </nav>
    )
}