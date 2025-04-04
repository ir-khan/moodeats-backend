import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const sendResponse = (res, statusCode, message, data = {}) => {
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode, message, data));
};

const getProfile = asyncHandler(async (req, res) => {
    sendResponse(res, 200, "User data fetched successfully", {
        user: req.user,
    });
});

const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;

    if (!name || !phone) {
        throw new ApiError(400, "Name and phone are required");
    }

    const user = await User.findById(req.user._id).select(
        "-password -refreshToken"
    );
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        throw new ApiError(409, "Phone number already in use");
    }

    const isPhoneChanged = user.phone !== phone;

    user.name = name;
    user.phone = phone;

    if (isPhoneChanged) {
        user.isPhoneVerified = false;
    }

    await user.save();

    sendResponse(res, 200, "Account details updated successfully", { user });
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Profile picture is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(500, "Failed to upload profile picture");
    }

    const user = await User.findById(req.user?._id).select(
        "-password -refreshToken"
    );
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const oldAvatar = user.avatar;
    user.avatar = avatar.url;
    await user.save({ validateBeforeSave: false });
    await deleteFromCloudinary(oldAvatar);

    sendResponse(res, 200, "Profile picture updated successfully", { user });
});

export { getProfile, updateProfile, updateAvatar };
