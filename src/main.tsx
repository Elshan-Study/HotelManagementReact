import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import './index.css'
import { router } from "../router.tsx";
import { refresh } from './features/auth/authService.tsx';
import {setLoading, setUser} from './store/authSlice';

// Восстанавливаем сессию при старте
refresh()
    .then(result => store.dispatch(setUser(result)))
    .catch(() => store.dispatch(setLoading(false)));

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>,
)