import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
} from "../controllers/auth.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyToken, verifyUserRoles } from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants/roles.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);

// secured routes
router
    .route("/logout")
    .post(
        verifyToken,
        verifyUserRoles(
            USER_ROLES.CLIENT,
            USER_ROLES.DRIVER,
            USER_ROLES.VENDOR
        ),
        logoutUser
    );
router.route("/refresh-token").post(refreshAccessToken);
router
    .route("/change-password")
    .post(
        verifyToken,
        verifyUserRoles(
            USER_ROLES.CLIENT,
            USER_ROLES.DRIVER,
            USER_ROLES.VENDOR
        ),
        changeCurrentPassword
    );

export default router;
