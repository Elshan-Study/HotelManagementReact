import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast';
import { store } from './store'
import './index.css'
import { router } from "../router.tsx";
import { refresh } from './features/auth/authService.ts';
import { setLoading, setUser } from './store/authSlice';

// Создаём QueryClient
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 минут
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

// Восстанавливаем сессию при старте
refresh()
    .then(result => store.dispatch(setUser(result)))
    .catch(() => store.dispatch(setLoading(false)));

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            borderRadius: '8px',
                            fontSize: '14px',
                        },
                        success: {
                            style: {
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                color: '#15803d',
                            },
                        },
                        error: {
                            style: {
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                            },
                        },
                    }}
                />
            </QueryClientProvider>
        </Provider>
    </StrictMode>,
);