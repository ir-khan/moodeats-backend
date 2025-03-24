import mongoose, { Schema } from "mongoose";
import otpGenerator from "otp-generator";

const otpSchema = new Schema(
    {
        phone: { type: String, required: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// Use TTL Index for auto-deletion of expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to generate OTP
otpSchema.statics.generateOTP = function (phone) {
    return new this({
        phone,
        otp: otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        }),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
};

// Method to verify OTP
otpSchema.statics.verifyOTP = async function (phone, otp) {
    const otpRecord = await this.findOne({
        phone,
        otp,
        expiresAt: { $gt: new Date() },
    });

    return otpRecord ? true : false;
};

const OTP = mongoose.model("OTP", otpSchema);
export { OTP };
