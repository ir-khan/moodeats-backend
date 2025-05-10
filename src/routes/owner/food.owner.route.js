import express from "express";
import {
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
} from "../../controllers/owner/food.owner.controller.js";
import upload from "../../middlewares/multer.middleware.js";
import {
    verifyToken,
    verifyUserRoles,
    verifyOwner,
} from "../../middlewares/auth.middleware.js";
import { USER_ROLES } from "../../constants/roles.js";

const router = express.Router();

// Apply middlewares for all food routes
router.use(
    "/:restaurantId/food",
    verifyToken,
    verifyUserRoles(USER_ROLES.OWNER),
    verifyOwner
);

// Create food item
router.post(
    "/:restaurantId/food",
    upload.fields([{ name: "images", maxCount: 5 }]),
    createFoodItem
);

// Update food item
router.patch(
    "/:restaurantId/food/:id",
    upload.fields([{ name: "images", maxCount: 5 }]),
    updateFoodItem
);

// Delete food item
router.delete("/:restaurantId/food/:id", deleteFoodItem);

export default router;
