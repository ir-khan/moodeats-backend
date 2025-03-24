import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export const sendOtpViaSMS = async (phone, otp) => {
    try {
        await client.messages.create({
            body: `${otp} is your verification code from MoodEats`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });
    } catch (error) {
        console.error("Error sending OTP via SMS:", error);
        throw new Error("Failed to send OTP");
    }
};
