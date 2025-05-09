import express from "express";
import upload from "../middlewares/multer.middleware.js";
import {
    getCategories,
    getRandomCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.js";
import {
    verifyToken,
    verifyAdminRoles,
} from "../middlewares/auth.middleware.js";
import { ADMIN_ROLES } from "../constants/roles.js";

const router = express.Router();

// Get all categories (accessible to all users)
router.route("/").get(getCategories);

// Get 5 random categories with "hasMore" flag (accessible to all users)
router.route("/random").get(getRandomCategories);

// Create a category (only super admin can create)
router.route("/").post(
    verifyToken,
    verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
    upload.single("image"), // Use upload.single for handling a single image
    createCategory
);

// Update a category (only super admin can update)
router.route("/:id").put(
    verifyToken,
    verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
    upload.single("image"), // Use upload.single for handling a single image
    updateCategory
);

// Delete a category (only super admin can delete)
router
    .route("/:id")
    .delete(
        verifyToken,
        verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
        deleteCategory
    );

export default router;
