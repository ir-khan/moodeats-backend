import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ADMIN_ROLES } from "../constants/roles.js";

const adminSchema = new Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true },
        avatar: {
            type: String,
            default:
                "https://res.cloudinary.com/izn-cloudinary/image/upload/v1741510874/s2ivd2jgkd5jzx0gvtkd.png",
        },
        refreshToken: { type: String },
        role: {
            type: String,
            enum: Object.values(ADMIN_ROLES),
            default: ADMIN_ROLES.SUPER_ADMIN,
        },
    },
    { timestamps: true }
);

// Hash the password before saving it
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Check if the entered password is correct
adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate an access token for admin
adminSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, role: this.role },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// Generate a refresh token for admin
adminSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id, role: this.role },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

const Admin = mongoose.model("Admin", adminSchema);
export { Admin };
