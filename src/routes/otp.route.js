import { Router } from "express";
import { requestOTP, verifyOTP } from "../controllers/otp.controller.js";

const router = Router();

router.route("/request-otp").post(requestOTP);
router.route("/verify-otp").post(verifyOTP);

export default router;
