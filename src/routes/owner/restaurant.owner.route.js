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

router.route("/register").post(
    verifyToken,
    verifyUserRoles(USER_ROLES.OWNER),
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "images", maxCount: 5 },
    ]),
    registerRestaurant
);

router
    .route("/me")
    .get(verifyToken, verifyUserRoles(USER_ROLES.OWNER), getMyRestaurant);

router.route("/:id").patch(
    verifyToken,
    verifyUserRoles(USER_ROLES.OWNER),
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "images", maxCount: 5 },
    ]),
    updateRestaurantDetails
);

export default router;
