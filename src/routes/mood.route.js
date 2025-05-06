import { Router } from "express";
import { getRecommendations } from "../controllers/mood.controller.js";

const router = Router();

router.route("/recommend").post(getRecommendations);

export default router;
