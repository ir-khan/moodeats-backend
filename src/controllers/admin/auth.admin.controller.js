import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Admin } from "../../models/admin.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const sendResponse = (res, statusCode, message, data = {}) => {
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode, message, data));
};

const generateAdminAccessAndRefreshToken = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId);
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token for admin"
        );
    }
};

const createAdmin = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    if (
        [username, email, password, role].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingAdmin = await Admin.findOne({
        $or: [{ email }, { username }],
    });

    if (existingAdmin) {
        throw new ApiError(
            409,
            "Admin with the provided email or username already exists"
        );
    }

    const newAdmin = await Admin.create({
        username,
        email,
        password,
        role,
    });

    const createdAdmin = await Admin.findById(newAdmin._id).select(
        "-password -refreshToken"
    );

    sendResponse(res, 201, "Admin created successfully", {
        admin: createdAdmin,
    });
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([email, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
        throw new ApiError(404, "Admin with the email does not exist");
    }

    const isPasswordCorrect = await admin.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid admin credentials");
    }

    const { accessToken, refreshToken } =
        await generateAdminAccessAndRefreshToken(admin._id);

    const loggedInAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    );

    sendResponse(res, 200, "Admin logged in successfully", {
        admin: loggedInAdmin,
        accessToken,
        refreshToken,
    });
});

const logoutAdmin = asyncHandler(async (req, res) => {
    await Admin.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 },
        },
        {
            new: true,
        }
    );

    sendResponse(res, 200, "Admin logged out successfully");
});

const refreshAdminAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const admin = await Admin.findById(decodedToken?._id);

        if (!admin || incomingRefreshToken !== admin.refreshToken) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        const tokens = await generateAdminAccessAndRefreshToken(admin._id);
        sendResponse(
            res,
            200,
            "Admin access token refreshed successfully",
            tokens
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
});

const changeAdminPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.user?._id);
    const isPasswordCorrect = await admin.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    admin.password = newPassword;
    await admin.save({ validateBeforeSave: false });

    sendResponse(res, 200, "Admin password changed successfully");
});

export {
    createAdmin,
    loginAdmin,
    logoutAdmin,
    refreshAdminAccessToken,
    changeAdminPassword,
};
