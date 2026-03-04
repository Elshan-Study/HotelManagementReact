import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { store } from './store'
import './index.css'
import { router } from "../router.tsx";
import { refresh } from './features/auth/authService.tsx';
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
                {/*<ReactQueryDevtools initialIsOpen={false} />*/}
            </QueryClientProvider>
        </Provider>
    </StrictMode>,
)