import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import {router} from "../router.tsx";

createRoot(document.getElementById('root')!).render(
    //Я избавился от App.tsx в пользу более гибкого RouterProvider
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
)
