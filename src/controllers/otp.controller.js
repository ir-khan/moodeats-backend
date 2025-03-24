import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";

const requestOTP = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone) throw new ApiError(400, "Phone number is required");

    await OTP.deleteMany({ phone });

    const otpInstance = OTP.generateOTP(phone);
    await otpInstance.save();

    // TODO: Send OTP via SMS or Email (implement SMS sending logic)
    console.log(`OTP sent to ${phone}: ${otpInstance.otp}`);

    res.status(200).json(new ApiResponse(200, "OTP sent successfully"));
});

const verifyOTP = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp)
        throw new ApiError(400, "Phone number and OTP are required");

    const isValid = await OTP.verifyOTP(phone, otp);
    if (!isValid) throw new ApiError(400, "Invalid or expired OTP");

    const user = await User.findOneAndUpdate(
        { phone },
        { isPhoneVerified: true },
        { new: true }
    );

    if (!user) throw new ApiError(404, "User not found");

    await OTP.deleteMany({ phone });

    res.status(200).json(new ApiResponse(200, "OTP verified successfully"));
});

export { requestOTP, verifyOTP };
