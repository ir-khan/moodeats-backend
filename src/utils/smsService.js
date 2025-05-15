import twilio from "twilio";
import { ApiError } from "./ApiError.js";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export const sendOtpViaSMS = async (phone, otp) => {
    try {
        const message = await client.messages.create({
            body: `Your OTP is: ${otp}.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });

        // console.log("OTP sent via Twilio:", message.sid);
        return message;
    } catch (error) {
        console.error("Failed to send OTP via Twilio:", error.message);
        throw new ApiError(500, "Failed to send OTP via Twilio");
    }
};

// "Hi [Customer Name], your order #[Order ID] has been confirmed! We will notify you when it is out for delivery. Thank you for choosing [App Name]!";

// "New delivery available: Order #[Order ID]. Please accept the request in your driver app.";
