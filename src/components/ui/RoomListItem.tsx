// components/ui/RoomListItem.tsx

import { useRoomType } from "../../features/roomType/useRoomTypes.ts";
import type { RoomResponseDto } from "../../features/room/roomTypes.ts";

interface Props {
    room: RoomResponseDto;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    isDeleting: boolean;
}

export default function RoomListItem({ room, onEdit, onDelete, isDeleting }: Props) {
    const { data: roomType, isLoading: isLoadingType } = useRoomType(room.roomTypeId);

    return (
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            {/* Room Info */}
            <div className="flex-1">

                {/* Название + статус доступности */}
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">Room {room.number}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        room.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}>
                        {room.isAvailable ? "Available" : "Unavailable"}
                    </span>
                    {isLoadingType ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">
                            Loading...
                        </span>
                    ) : roomType ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                            {roomType.name}
                        </span>
                    ) : null}
                </div>

                 {/*Этаж*/}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>Floor {room.floor}</span>
                </div>

            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(room.id)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(room.id)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 text-sm"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
