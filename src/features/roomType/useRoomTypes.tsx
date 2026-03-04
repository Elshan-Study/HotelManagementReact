import {
    useQuery,
    useInfiniteQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query';
import type {
    RoomTypeFilterRequest,
    CreateRoomTypeWithPhotosDto,
    UpdateRoomTypeDto,
    AddPhotosDto,
} from './roomTypeTypes.tsx';
import {
    getRoomsByTypeId,
    getRoomTypes,
    getRoomTypeById,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    addPhotos,
    deletePhoto,
} from './roomTypeService.tsx';

import type { PagedRequest } from '../room/roomTypes.tsx'

// QUERIES (чтение данных)




export const useRoomsByTypeId = (
    roomTypeId: number,
    params: PagedRequest
) => {
    return useQuery({
        queryKey: ['rooms-by-type', roomTypeId, params],
        queryFn: () => getRoomsByTypeId(roomTypeId, params),
        placeholderData: keepPreviousData,
        enabled: !!roomTypeId, // Запрос только если roomTypeId существует
    });
};
//Получить список типов комнат (обычная пагинация)

export const useRoomTypes = (params: RoomTypeFilterRequest) => {
    return useQuery({
        queryKey: ['room-types', params],
        queryFn: () => getRoomTypes(params),
        placeholderData: keepPreviousData,
    });
};


 ///Получить список типов комнат (infinite scroll)

export const useInfiniteRoomTypes = (
    params: Omit<RoomTypeFilterRequest, 'page'>
) => {
    return useInfiniteQuery({
        queryKey: ['room-types-infinite', params],
        queryFn: ({ pageParam = 1 }) =>
            getRoomTypes({ ...params, page: pageParam }),

        getNextPageParam: (lastPage) => {
            const { page, pageSize, totalCount } = lastPage;
            const totalPages = Math.ceil(totalCount / pageSize);
            return page < totalPages ? page + 1 : undefined;
        },

        initialPageParam: 1,
    });
};


export const useInfiniteRoomsByTypeId = (
    roomTypeId: number,
    params: Omit<PagedRequest, 'page'>
) => {
    return useInfiniteQuery({
        queryKey: ['rooms-by-type-infinite', roomTypeId, params],
        queryFn: ({ pageParam = 1 }) =>
            getRoomsByTypeId(roomTypeId, { ...params, page: pageParam }),

        getNextPageParam: (lastPage) => {
            const { page, pageSize, totalCount } = lastPage;
            const totalPages = Math.ceil(totalCount / pageSize);
            return page < totalPages ? page + 1 : undefined;
        },

        initialPageParam: 1,
        enabled: !!roomTypeId,
    });
};


// Получить один тип комнаты по ID

export const useRoomType = (id: number) => {
    return useQuery({
        queryKey: ['room-type', id],
        queryFn: () => getRoomTypeById(id),
        enabled: !!id,
    });
};

// MUTATIONS (изменение данных)

/**
 * Создать тип комнаты (с фото)
 */
export const useCreateRoomType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateRoomTypeWithPhotosDto) => createRoomType(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['room-types'] });
            void queryClient.invalidateQueries({ queryKey: ['room-types-infinite'] });
        },
    });
};


//Обновить тип комнаты (без фото)

export const useUpdateRoomType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateRoomTypeDto }) =>
            updateRoomType(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['room-types'] });
            void queryClient.invalidateQueries({ queryKey: ['room-types-infinite'] });
            void queryClient.invalidateQueries({ queryKey: ['room-type'] });
        },
    });
};


//Удалить тип комнаты

export const useDeleteRoomType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteRoomType,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['room-types'] });
            void queryClient.invalidateQueries({ queryKey: ['room-types-infinite'] });
        },
    });
};


// PHOTO MUTATIONS



// Добавить фото к существующему типу комнаты

export const useAddPhotos = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AddPhotosDto }) =>
            addPhotos(id, data),
        onSuccess: (_, variables) => {
            void queryClient.invalidateQueries({ queryKey: ['room-types'] });
            void queryClient.invalidateQueries({ queryKey: ['room-types-infinite'] });
            void queryClient.invalidateQueries({
                queryKey: ['room-type', variables.id],
            });
        },
    });
};


// Удалить фото

export const useDeletePhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePhoto,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['room-types'] });
            void queryClient.invalidateQueries({ queryKey: ['room-types-infinite'] });
            void queryClient.invalidateQueries({ queryKey: ['room-type'] });
        },
    });
};