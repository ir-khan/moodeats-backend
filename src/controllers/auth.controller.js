import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const sendResponse = (res, statusCode, message, data = {}) => {
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode, message, data));
};

const generateAccessAndRefreshToken = async (UserId) => {
    try {
        const user = await User.findById(UserId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating referesh and access token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    if (
        [name, email, password, phone, role].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with email already exists");
    }

    let avatar;

    if (req.file?.path) {
        const uploadedAvatar = await uploadOnCloudinary(req.file.path);
        if (!uploadedAvatar) {
            throw new ApiError(500, "Failed to upload profile picture");
        }
        avatar = uploadedAvatar.url;
    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
        role,
        avatar,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Error registering user");
    }

    sendResponse(res, 201, "User created successfully", { user: createdUser });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([email, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User with the email does not exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    sendResponse(res, 200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
    });
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 },
        },
        {
            new: true,
        }
    );

    sendResponse(res, 200, "User logged out successfully");
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user || incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        const tokens = await generateAccessAndRefreshToken(user._id);
        sendResponse(res, 200, "Access token refreshed successfully", tokens);
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    sendResponse(res, 200, "Password changed successfully");
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
};
