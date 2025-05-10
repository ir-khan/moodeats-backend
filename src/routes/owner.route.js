import express from "express";
import {
    registerRestaurant,
    getMyRestaurant,
    updateRestaurantDetails,
} from "../controllers/owner/restaurant.owner.controller.js";
import {
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    getAllRestaurantFoods,
} from "../controllers/owner/food.owner.controller.js";
import upload from "../middlewares/multer.middleware.js";
import {
    verifyToken,
    verifyUserRoles,
    verifyOwner,
} from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants/roles.js";

const router = express.Router();

// Register restaurant
router
    .route("/register")
    .post(verifyToken, verifyUserRoles(USER_ROLES.OWNER), registerRestaurant);

// Get current user's restaurant details
router
    .route("/me")
    .get(verifyToken, verifyUserRoles(USER_ROLES.OWNER), getMyRestaurant);

// Update restaurant details
router.route("/update").patch(
    verifyToken,
    verifyUserRoles(USER_ROLES.OWNER),
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "images", maxCount: 5 },
    ]),
    updateRestaurantDetails
);

// Apply verifyOwner middleware to all routes related to managing the restaurant's food items
// Ensure the user owns the restaurant before accessing these routes
router.use(
    "/:restaurantId",
    verifyToken,
    verifyUserRoles(USER_ROLES.OWNER),
    verifyOwner
);

// Food management routes (with the restaurantId param)
router
    .route("/:restaurantId/foods")
    .get(getAllRestaurantFoods)
    .post(upload.fields([{ name: "images", maxCount: 5 }]), createFoodItem);

router
    .route("/:restaurantId/foods/:id")
    .patch(upload.fields([{ name: "images", maxCount: 5 }]), updateFoodItem)
    .delete(deleteFoodItem);

export default router;
