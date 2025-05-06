import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "../constants/roles.js";

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        isPhoneVerified: { type: Boolean, default: false },
        avatar: {
            type: String,
            default:
                "https://res.cloudinary.com/izn-cloudinary/image/upload/v1741510874/s2ivd2jgkd5jzx0gvtkd.png",
        },
        addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
        role: {
            type: String,
            required: true,
            enum: Object.values(USER_ROLES),
            default: USER_ROLES.CUSTOMER,
        },
        refreshToken: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    const payload = {
        _id: this._id,
    };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};
userSchema.methods.generateRefreshToken = function () {
    const payload = {
        _id: this._id,
    };
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
};

const User = mongoose.model("User", userSchema);
export { User };
