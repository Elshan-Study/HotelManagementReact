import { useState, useRef, useCallback, useEffect } from "react";
import { useInfiniteRoomTypes } from "../../features/roomType/useRoomTypes.ts";
import { useInfiniteRooms, useDeleteRoom } from "../../features/room/useRoom.ts";
import { useInfiniteRoomsByTypeId } from "../../features/roomType/useRoomTypes.ts";
import RoomTypeDropdown from "../../components/ui/RoomTypeDropdown";
import RoomListItem from "../../components/ui/RoomListItem";
import RoomModal from "../../components/ui/RoomModal";
import RoomTypeModal from "../../components/ui/RoomTypeModal";
import TagsModal from "../../components/ui/TagsModal";
import type { RoomResponseDto } from "../../features/room/roomTypes.ts";
import type { RoomTypeResponseDto } from "../../features/roomType/roomTypeTypes.ts";

const RoomsAdmin = () => {
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [roomModalState, setRoomModalState] = useState<{
        isOpen: boolean;
        mode: "create" | "edit";
        data?: RoomResponseDto;
    }>({ isOpen: false, mode: "create" });

    const [roomTypeModalState, setRoomTypeModalState] = useState<{
        isOpen: boolean;
        mode: "create" | "edit";
        data?: RoomTypeResponseDto;
    }>({ isOpen: false, mode: "create" });

    const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);

    const { data: roomTypesData } = useInfiniteRoomTypes({
        pageSize: 5,
        search: "",
        sortBy: "Name:asc",
    });

    const allRoomsQuery = useInfiniteRooms({
        pageSize: 10,
        search: searchTerm,
        sortBy: "Number:asc",
    });

    const roomsByTypeQuery = useInfiniteRoomsByTypeId(
        selectedTypeId || 0,
        { pageSize: 20, search: searchTerm, sortBy: "Number:asc" }
    );

    const {
        data: roomsData,
        isLoading: isLoadingRooms,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = selectedTypeId === null ? allRoomsQuery : roomsByTypeQuery;

    const deleteMutation = useDeleteRoom();

    const allRoomTypes = roomTypesData?.pages.flatMap((page) => page.items).filter(Boolean) || [];
    const allRooms = roomsData?.pages.flatMap((page) => page.items).filter(Boolean) || [];

    const observerTarget = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries;
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage]
    );

    useEffect(() => {
        const element = observerTarget.current;
        if (!element) return;
        const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
        observer.observe(element);
        return () => observer.disconnect();
    }, [handleObserver]);

    const handleDeleteRoom = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this room?")) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch {
                alert("Failed to delete room");
            }
        }
    };

    const handleDeleteRoomType = (typeId: number) => {
        alert(`Delete room type ${typeId} - coming soon!`);
    };

    const handleEditRoom = (id: number) => {
        const room = allRooms.find((r) => r.id === id);
        if (room) setRoomModalState({ isOpen: true, mode: "edit", data: room });
    };

    const handleEditRoomType = (typeId: number) => {
        const roomType = allRoomTypes.find((t) => t.id === typeId);
        if (roomType) setRoomTypeModalState({ isOpen: true, mode: "edit", data: roomType });
    };

    return (
        <div className="h-full p-6 flex flex-col">
            {/* Toolbar */}
            <div className="flex gap-4 mb-6 shrink-0">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search rooms by number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-400"
                    />
                </div>

                {/* Tags Manager button */}


                {/* Add Room button */}
                <button
                    onClick={() => setRoomModalState({ isOpen: true, mode: "create" })}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Room</span>
                </button>

                <button
                    onClick={() => setIsTagsModalOpen(true)}
                    className="px-4 py-2 border border-stone-300 bg-white hover:border-stone-400 text-stone-600 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
                    </svg>
                    <span>Tags</span>
                </button>

                <RoomTypeDropdown
                    selectedTypeId={selectedTypeId}
                    onTypeSelect={setSelectedTypeId}
                    onAddRoomType={() => setRoomTypeModalState({ isOpen: true, mode: "create" })}
                    onEditRoomType={handleEditRoomType}
                    onDeleteRoomType={handleDeleteRoomType}
                />
            </div>

            {/* Rooms list */}
            <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-3">
                    {isLoadingRooms && (
                        <div className="text-center py-8 text-stone-500">Loading rooms...</div>
                    )}

                    {allRooms.map((room) => (
                        <RoomListItem
                            key={room.id}
                            room={room}
                            onEdit={handleEditRoom}
                            onDelete={handleDeleteRoom}
                            isDeleting={deleteMutation.isPending}
                        />
                    ))}

                    <div ref={observerTarget} className="py-4 text-center">
                        {isFetchingNextPage && (
                            <div className="text-stone-500">Loading more rooms...</div>
                        )}
                        {!hasNextPage && allRooms.length > 0 && (
                            <div className="text-stone-400">No more rooms to load</div>
                        )}
                    </div>

                    {!isLoadingRooms && allRooms.length === 0 && (
                        <div className="text-center py-12 text-stone-500">
                            <p>No rooms found</p>
                            <p className="text-sm mt-2">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <RoomModal
                isOpen={roomModalState.isOpen}
                mode={roomModalState.mode}
                initialData={roomModalState.data}
                onClose={() => setRoomModalState({ isOpen: false, mode: "create" })}
            />

            <RoomTypeModal
                key={roomTypeModalState.data?.id ?? "create"}
                isOpen={roomTypeModalState.isOpen}
                mode={roomTypeModalState.mode}
                initialData={roomTypeModalState.data}
                onClose={() => setRoomTypeModalState({ isOpen: false, mode: "create" })}
            />

            <TagsModal
                isOpen={isTagsModalOpen}
                onClose={() => setIsTagsModalOpen(false)}
            />
        </div>
    );
};

export default RoomsAdmin;