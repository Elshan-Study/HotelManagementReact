import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createReservation,
    getReservationById,
    getReservations,
    updateReservation,
    cancelReservation,
    processMockPayment,
} from './reservationService';
import type {
    CreateReservationDto,
    UpdateReservationDto,
    MockPaymentDto,
    ReservationFilterRequest,
} from './reservationTypes';

export const useCreateReservation = () =>
    useMutation({ mutationFn: (dto: CreateReservationDto) => createReservation(dto) });

export const useReservationById = (id: string | null) =>
    useQuery({
        queryKey: ['reservation', id],
        queryFn: () => getReservationById(id!),
        enabled: !!id,
        retry: false,
    });

export const useReservations = (filter: ReservationFilterRequest) =>
    useQuery({
        queryKey: ['reservations', filter],
        queryFn: () => getReservations(filter),
        staleTime: 30_000,
    });

export const useUpdateReservation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateReservationDto }) =>
            updateReservation(id, dto),
        onSuccess: (_, { id }) => {
            void qc.invalidateQueries({ queryKey: ['reservations'] });
            void qc.invalidateQueries({ queryKey: ['reservation', id] });
        },
    });
};

export const useCancelReservation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => cancelReservation(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['reservations'] });
        },
    });
};

export const useMockPayment = () =>
    useMutation({ mutationFn: (dto: MockPaymentDto) => processMockPayment(dto) });