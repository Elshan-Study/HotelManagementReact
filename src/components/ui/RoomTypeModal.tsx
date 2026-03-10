import {useState, useCallback, useRef, useEffect} from "react";
import { useCreateRoomType, useUpdateRoomType, useAddPhotos, useDeletePhoto } from "../../features/roomType/useRoomTypes";
import { useInfiniteTags, useCreateTag } from "../../features/tag/useTag";
import type { RoomTypeResponseDto } from "../../features/roomType/roomTypeTypes";

interface Props {
    isOpen: boolean;
    mode: "create" | "edit";
    initialData?: RoomTypeResponseDto;
    onClose: () => void;
}

export default function RoomTypeModal({ isOpen, mode, initialData, onClose }: Props) {
    const [code, setCode] = useState(initialData?.code ?? "");
    const [name, setName] = useState(initialData?.name ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [capacity, setCapacity] = useState(initialData ? String(initialData.capacity) : "");
    const [basePrice, setBasePrice] = useState(initialData ? String(initialData.basePrice) : "");
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initialData?.tags.map((t) => t.id) ?? []);
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [photosToDelete, setPhotosToDelete] = useState<number[]>([]);
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    const [tagSearch, setTagSearch] = useState("");
    const [debouncedTagSearch, setDebouncedTagSearch] = useState("");


    const createMutation = useCreateRoomType();
    const updateMutation = useUpdateRoomType();
    const addPhotosMutation = useAddPhotos();
    const deletePhotoMutation = useDeletePhoto();
    const createTagMutation = useCreateTag();

    const { data: tagsData, isLoading: isLoadingTags, fetchNextPage, hasNextPage, isFetchingNextPage: isFetchingNextTagPage } =
        useInfiniteTags({
            pageSize: 10,
            sortBy: "Name:asc",
            search: debouncedTagSearch
        });

    const tagDropdownRef = useRef<HTMLDivElement>(null);
    const tagObserverRef = useRef<IntersectionObserver | null>(null);
    const overlayMouseDown = useRef(false);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
                setIsTagDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    useEffect(() => {
        const timer = setTimeout(() => setDebouncedTagSearch(tagSearch), 300);
        return () => clearTimeout(timer);
    }, [tagSearch]);



    const allTags = tagsData?.pages.flatMap((p) => p.items).filter(Boolean) ?? [];

    const tagDropdownTriggerRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (tagObserverRef.current) tagObserverRef.current.disconnect();
            if (!node) return;
            tagObserverRef.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasNextPage && !isFetchingNextTagPage) void fetchNextPage();
                },
                { threshold: 0.1, root: node.closest(".tag-dropdown-scroll") }
            );
            tagObserverRef.current.observe(node);
        },
        [fetchNextPage, hasNextPage, isFetchingNextTagPage]
    );


    const toggleTag = (tagId: number) =>
        setSelectedTagIds((prev) => prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]);

    const handleAddPhotos = (files: FileList | null) => {
        if (files) setNewPhotos((prev) => [...prev, ...Array.from(files)]);
    };

    const handleCreateTag = async () => {
        const trimmed = newTagName.trim();
        if (!trimmed) return;
        const slug = trimmed.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        setIsCreatingTag(true);
        try {
            const newTagId = await createTagMutation.mutateAsync({ name: trimmed, slug });
            setSelectedTagIds((prev) => [...prev, newTagId]);
            setNewTagName("");
        } finally {
            setIsCreatingTag(false);
        }
    };
    const handleClose = () => {
        setIsTagDropdownOpen(false);
        setTagSearch("");
        onClose();
    };

    const handleSubmit = async () => {
        if (mode === "create") {
            await createMutation.mutateAsync({
                code, name, description,
                capacity: Number(capacity), basePrice: Number(basePrice),
                isActive, tagIds: selectedTagIds,
                photos: newPhotos.length > 0 ? newPhotos : undefined,
            });
        } else if (initialData) {
            await updateMutation.mutateAsync({
                id: initialData.id,
                data: { id: initialData.id, code, name, description, capacity: Number(capacity), basePrice: Number(basePrice), isActive, tagIds: selectedTagIds },
            });
            await Promise.all(photosToDelete.map((id) => deletePhotoMutation.mutateAsync(id)));
            if (newPhotos.length > 0) await addPhotosMutation.mutateAsync({ id: initialData.id, data: { photos: newPhotos } });
        }
        handleClose();
    };

    const isPending = createMutation.isPending || updateMutation.isPending || addPhotosMutation.isPending || deletePhotoMutation.isPending;
    const isValid = code.trim() !== "" && name.trim() !== "" && description.trim() !== "" && capacity !== "" && basePrice !== "";
    const visibleExistingPhotos = initialData?.photos.filter((p) => !photosToDelete.includes(p.id)) ?? [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
             onMouseDown={(e) => {
                 overlayMouseDown.current = e.target === e.currentTarget;
             }}
             onMouseUp={(e) => {
                 if (overlayMouseDown.current && e.target === e.currentTarget) {
                     handleClose();
                 }
                 overlayMouseDown.current = false;
             }}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[100vh]" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
                    <h2 className="text-xl font-semibold">{mode === "create" ? "Add Room Type" : "Edit Room Type"}</h2>
                    <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="hide-scrollbar overflow-y-auto p-6 flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Code</label>
                            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. DELUXE"
                                   className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Deluxe Room"
                                   className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                                  placeholder="Describe the room type..." rows={3}
                                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Capacity</label>
                            <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 2"
                                   className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Base Price</label>
                            <input type="number" min={0} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="e.g. 150"
                                   className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Status</label>
                            <button onClick={() => setIsActive((v) => !v)}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isActive ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700"}`}>
                                {isActive ? "Active" : "Inactive"}
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Tags</label>
                        {selectedTagIds.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {selectedTagIds.map((id) => {
                                    const tag = allTags.find((t) => t.id === id);
                                    return tag ? (
                                        <span key={id} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                            {tag.name}
                                            <button onClick={() => toggleTag(id)} className="hover:text-blue-900">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}
                        <div className="relative">
                            <input
                                type="text"
                                value={tagSearch}
                                onChange={(e) => {
                                    setTagSearch(e.target.value);
                                    setIsTagDropdownOpen(true);
                                }}
                                onFocus={() => setIsTagDropdownOpen(true)}

                                placeholder="Search tags..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none "
                            />
                            <button
                                onClick={() => setIsTagDropdownOpen((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                            >
                                <svg className={`w-4 h-4 transition-transform ${isTagDropdownOpen ? "rotate-180" : ""}`}
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isTagDropdownOpen && (
                                <div className="tag-dropdown-scroll hide-scrollbar absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                    <div className="flex items-center gap-2 p-2 border-b border-gray-200">
                                        <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)}
                                               onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleCreateTag(); } }}
                                               placeholder="New tag name..."
                                               className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        <button onClick={() => void handleCreateTag()} disabled={!newTagName.trim() || isCreatingTag}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                                            {isCreatingTag
                                                ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            }
                                            <span>Add</span>
                                        </button>
                                    </div>
                                    <div className="hide-scrollbar overflow-y-auto max-h-44">
                                        {isLoadingTags && <div className="px-4 py-2 text-sm text-gray-500">Loading tags...</div>}
                                        {allTags.map((tag) => (
                                            <button key={tag.id} onClick={() => toggleTag(tag.id)}
                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${selectedTagIds.includes(tag.id) ? "bg-blue-50 text-blue-600" : ""}`}>
                                                <span>{tag.name}</span>
                                                {selectedTagIds.includes(tag.id) && (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                        <div ref={tagDropdownTriggerRef} className="py-1 text-center">
                                            {isFetchingNextTagPage && <div className="text-xs text-gray-400 py-1">Loading more...</div>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {isTagDropdownOpen && <div className="h-48" />}

                    {/* Photos */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Photos</label>
                        {visibleExistingPhotos.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {visibleExistingPhotos.map((photo) => (
                                    <div key={photo.id} className="relative group">
                                        <img src={photo.url} alt={photo.altText ?? ""} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                                        <button onClick={() => setPhotosToDelete((prev) => [...prev, photo.id])}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {newPhotos.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {newPhotos.map((file, index) => (
                                    <div key={index} className="relative group">
                                        <img src={URL.createObjectURL(file)} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-blue-300" />
                                        <button onClick={() => setNewPhotos((prev) => prev.filter((_, i) => i !== index))}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                        <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-blue-500 text-white rounded-b-lg">new</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors w-fit">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            <span className="text-sm text-gray-500">Add photos</span>
                            <input type="file" multiple accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => handleAddPhotos(e.target.files)} />
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200 shrink-0">
                    <button onClick={handleClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => void handleSubmit()} disabled={!isValid || isPending}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isPending ? (mode === "create" ? "Creating..." : "Saving...") : (mode === "create" ? "Create Room Type" : "Save Changes")}
                    </button>
                </div>
            </div>
        </div>
    );
}