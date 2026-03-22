import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { updateUserProfile } from "../../store/authSlice";
import { getProfile, updateProfile, changePassword } from "./userService.ts";
import type { UpdateProfileRequest, ChangePasswordRequest, UserResponse } from "./userTypes.ts";

export const useUser = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const fetchProfile = async (): Promise<UserResponse | null> => {
        try {
            return await getProfile();
        } catch {
            setError("Failed to load profile.");
            return null;
        }
    };

    const handleUpdateProfile = async (data: UpdateProfileRequest): Promise<UserResponse | null> => {
        setLoading(true);
        clearMessages();
        try {
            const result = await updateProfile(data);
            dispatch(updateUserProfile({ email: result.email, displayName: result.displayName }));
            setSuccess("Profile updated successfully!");
            return result;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Failed to update profile.";
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (data: ChangePasswordRequest): Promise<boolean> => {
        setLoading(true);
        clearMessages();
        try {
            await changePassword(data);
            setSuccess("Password changed successfully!");
            return true;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Failed to change password.";
            setError(msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        success,
        clearMessages,
        fetchProfile,
        handleUpdateProfile,
        handleChangePassword,
    };
};