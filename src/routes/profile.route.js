import { Router } from "express";
import {
    getProfile,
    updateProfile,
    updateAvatar,
} from "../controllers/profile.controller.js";
import upload from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

// Secured Routes
router.route("/").get(verifyJWT, getProfile);
router.route("/").put(verifyJWT, updateProfile);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);

export default router;
