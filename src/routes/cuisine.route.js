import express from "express";
import upload from "../middlewares/multer.middleware.js";
import {
    getCuisines,
    getRandomCuisines,
    createCuisine,
    updateCuisine,
    deleteCuisine,
} from "../controllers/cuisine.controller.js";
import {
    verifyToken,
    verifyAdminRoles,
} from "../middlewares/auth.middleware.js";
import { ADMIN_ROLES } from "../constants/roles.js";

const router = express.Router();

router.route("/").get(getCuisines);

router.route("/random").get(getRandomCuisines);

// Create a cuisine (only super admin can create)
router.route("/").post(
    verifyToken,
    verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
    upload.single("image"),
    createCuisine
);

// Update a cuisine (only super admin can update)
router.route("/:id").patch(
    verifyToken,
    verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
    upload.single("image"),
    updateCuisine
);

// Delete a cuisine (only super admin can delete)
router
    .route("/:id")
    .delete(
        verifyToken,
        verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
        deleteCuisine
    );

export default router;
