import express from "express";
import { getAllFoods } from "../controllers/food.controller.js";

const router = express.Router();

router.route("/").get(getAllFoods);

export default router;
