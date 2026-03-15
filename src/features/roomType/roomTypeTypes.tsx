export interface RoomTypeResponseDto {
    id: number;
    code: string;
    name: string;
    description: string;
    capacity: number;
    maxOccupancyAdults: number;
    maxOccupancyChildren: number;
    basePrice: number;
    isActive: boolean;
    photos: RoomPhotoResponseDto[];
    tags: TagResponseDto[];
}


export interface RoomPhotoResponseDto {
    id: number;
    url: string;
    sortOrder: number;
    altText: string | null;
}

export interface TagResponseDto {
    id: number;
    name: string;
    slug: string;
}

// ============================================
// REQUEST DTOs (что отправляем на API)
// ============================================

interface CreateRoomTypeDto {
    code: string;
    name: string;
    description: string;
    capacity: number;
    maxOccupancyAdults: number;
    maxOccupancyChildren: number;
    basePrice: number;
    isActive: boolean;
    tagIds?: number[];
}

export interface UpdateRoomTypeDto extends CreateRoomTypeDto {
    id: number;
}

// ============================================
// FILTER & PAGINATION
// ============================================

export interface RoomTypeFilterRequest {
    page: number;
    pageSize: number;
    sortBy?: string;
    search?: string;

    // Фильтры
    code?: string;
    isActive?: boolean;

    minCapacity?: number;
    maxCapacity?: number;

    minAdults?: number;
    maxAdults?: number;

    minChildren?: number;
    maxChildren?: number;

    minPrice?: number;
    maxPrice?: number;

    tagIds?: number[];
}

export interface PagedResult<T> {
    items: readonly T[];
    totalCount: number;
    page: number;
    pageSize: number;
}

// ============================================
// FORM DATA для создания с фото
// ============================================

export interface CreateRoomTypeWithPhotosDto extends CreateRoomTypeDto {
    photos?: File[];
}

export interface AddPhotosDto {
    photos: File[];
}