import express from "express";
import { getAllRestaurantFoods } from "../controllers/food.controller.js";

const router = express.Router();

router.route("/:restaurantId").get(getAllRestaurantFoods);

export default router;
