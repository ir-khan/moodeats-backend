import express from "express";
import {
    registerRestaurant,
    getMyRestaurant,
    updateRestaurantDetails,
} from "../../controllers/owner/restaurant.owner.controller.js";
import upload from "../../middlewares/multer.middleware.js";
import {
    verifyToken,
    verifyUserRoles,
} from "../../middlewares/auth.middleware.js";
import { USER_ROLES } from "../../constants/roles.js";

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

export default router;
