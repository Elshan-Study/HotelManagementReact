export interface TagResponseDto {
    id: number;
    name: string;
    slug: string;
}

export interface CreateTagDto {
    name: string;
    slug: string;
}

export interface TagPagedRequest {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
}