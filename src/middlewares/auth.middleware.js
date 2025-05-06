import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";
import { ADMIN_ROLES } from "../constants/roles.js";

const verifyToken = asyncHandler(async (req, _, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "No token provided");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded._id) {
            throw new ApiError(400, "Invalid token payload");
        }
    } catch (err) {
        throw new ApiError(403, "Invalid or expired token");
    }

    const isAdmin = Object.values(ADMIN_ROLES).includes(decoded.role);
    const user = isAdmin
        ? await Admin.findById(decoded._id).select("-password -refreshToken")
        : await User.findById(decoded._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    req.user = user;
    req.userType = user.role;
    next();
});

const verifyUserRoles = (...allowedRoles) =>
    asyncHandler(async (req, _, next) => {
        if (!allowedRoles.includes(req.userType)) {
            throw new ApiError(403, "You are not authorized");
        }
        next();
    });

const verifyAdminRoles = (...allowedAdminRoles) =>
    asyncHandler(async (req, _, next) => {
        if (!Object.values(ADMIN_ROLES).includes(req.userType)) {
            throw new ApiError(403, "Admin access required");
        }

        if (!allowedAdminRoles.includes(req.userType)) {
            throw new ApiError(403, "Insufficient admin privileges");
        }

        next();
    });

export { verifyToken, verifyUserRoles, verifyAdminRoles };
