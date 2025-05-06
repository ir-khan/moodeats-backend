import { Router } from "express";
import {
    getProfile,
    updateProfile,
    updateAvatar,
} from "../controllers/profile.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyToken, verifyUserRoles } from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants/roles.js";

const router = Router();

// Secured Routes
router
    .route("/")
    .get(
        verifyToken,
        verifyUserRoles(
            USER_ROLES.CLIENT,
            USER_ROLES.DRIVER,
            USER_ROLES.VENDOR
        ),
        getProfile
    );
router
    .route("/")
    .put(
        verifyToken,
        verifyUserRoles(
            USER_ROLES.CLIENT,
            USER_ROLES.DRIVER,
            USER_ROLES.VENDOR
        ),
        updateProfile
    );
router
    .route("/avatar")
    .patch(
        verifyToken,
        verifyUserRoles(
            USER_ROLES.CLIENT,
            USER_ROLES.DRIVER,
            USER_ROLES.VENDOR
        ),
        upload.single("avatar"),
        updateAvatar
    );

export default router;
