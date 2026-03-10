// src/api/errorHandler.ts
import type { AxiosError } from 'axios';

interface ProblemDetails {
    title?: string;
    detail?: string;
    errors?: Record<string, string[]>;
    status?: number;
}

export const getErrorMessage = (error: unknown): string => {
    const axiosError = error as AxiosError<ProblemDetails>;

    if (!axiosError.response) {
        return 'Сервер недоступен. Проверьте подключение.';
    }

    const { status, data } = axiosError.response;

    // Сообщения из FluentValidation
    if (data?.errors) {
        const messages = Object.values(data.errors).flat();
        if (messages.length > 0) return messages.join('\n');
    }

    if (data?.detail) return data.detail;
    if (data?.title) return data.title;

    switch (status) {
        case 400: return 'Некорректные данные запроса.';
        case 401: return 'Необходима авторизация.';
        case 403: return 'Недостаточно прав.';
        case 404: return 'Ресурс не найден.';
        case 409: return 'Конфликт данных.';
        case 422: return 'Ошибка валидации.';
        case 500: return 'Внутренняя ошибка сервера.';
        default:  return `Ошибка ${status}.`;
    }
};