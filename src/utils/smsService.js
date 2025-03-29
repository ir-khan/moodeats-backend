import axios from "axios";
import { ApiError } from "./ApiError.js";

export const sendOtpViaSMS = async (phone, otp) => {
    try {
        const response = await axios.post(
            process.env.BREVO_SMS_URL,
            {
                sender: process.env.SENDER_NAME,
                recipient: phone,
                content: `${otp} is your verification code from MoodEats. Do not share this code with anyone.`,
                type: "transactional",
            },
            {
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                },
            }
        );
        console.log("OTP Sent Successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error(
            "Failed to send OTP:",
            error.response ? error.response.data : error.message
        );
        throw new ApiError(500, "Failed to send OTP");
    }
};

// "Hi [Customer Name], your order #[Order ID] has been confirmed! We will notify you when it is out for delivery. Thank you for choosing [App Name]!";

// "New delivery available: Order #[Order ID]. Please accept the request in your driver app.";
