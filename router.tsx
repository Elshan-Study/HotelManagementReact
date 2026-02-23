import { createBrowserRouter } from "react-router-dom"
import Layout from "./src/components/layout/Layout.tsx";
import AdminLayout from "./src/components/layout/AdminLayout.tsx";
import Home from "./src/pages/Home.tsx";
import Rooms from "./src/pages/Rooms.tsx";
import RoomDetails from "./src/pages/RoomDetails.tsx";
import Booking from "./src/pages/Booking.tsx";
import Login from "./src/pages/Login.tsx";
import RoomsAdmin from "./src/pages/admin/RoomsAdmin.tsx";
import PriceCalendar from "./src/pages/admin/PriceCalendar.tsx";
import Users from "./src/pages/admin/Users.tsx";
import ProtectedRoute from "./src/routes/ProtectedRoute.tsx";
import NotFound from "./src/pages/NotFound.tsx";

//Метод позволят установить router и его конфигурации
export const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/rooms",
                element: <Rooms />
            },
            {
                path: "/rooms/:id",
                element: <RoomDetails />
            },
            {
                path: "/booking/:reservationId",
                element: <Booking />
            },

        ]
    },
    {
        path: "/auth/login",
        element: <Login />
    },
    {
        path: "/admin",
        element: <ProtectedRoute allowedRole="Admin" />,
        children: [
            {

                path: "/admin",
                element: <AdminLayout />,
                children: [
                    {
                        path: "rooms",
                        element: <RoomsAdmin />
                    },
                    {
                        path: "price-calendar",
                        element: <PriceCalendar />
                    },
                    {
                        path: "users",
                        element: <Users />
                    }
                ]

            }
            ]

    },
    {
        path: "*",
        element: <NotFound />
    }
])
