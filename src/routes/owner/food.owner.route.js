import express from "express";
import {
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    getRestaurantFoods,
    getRestaurantFoodById,
} from "../../controllers/owner/food.owner.controller.js";
import upload from "../../middlewares/multer.middleware.js";
import {
    verifyToken,
    verifyUserRoles,
    verifyOwner,
} from "../../middlewares/auth.middleware.js";
import { USER_ROLES } from "../../constants/roles.js";

const router = express.Router();

router.use(
    "/:restaurantId/food",
    verifyToken,
    verifyUserRoles(USER_ROLES.OWNER),
    verifyOwner
);

router
    .route("/:restaurantId/food")
    .get(getRestaurantFoods)
    .post(upload.fields([{ name: "images", maxCount: 5 }]), createFoodItem);

router
    .route("/:restaurantId/food/:id")
    .get(getRestaurantFoodById)
    .patch(upload.fields([{ name: "images", maxCount: 5 }]), updateFoodItem)
    .delete(deleteFoodItem);

export default router;
