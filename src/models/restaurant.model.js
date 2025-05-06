import mongoose, { Schema } from "mongoose";
import { RESTAURANT_STATUS } from "../constants/status.js";

const restaurantSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        addresses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Address",
            },
        ],
        phone: { type: String, required: true, trim: true },
        cuisine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cuisine",
            required: true,
            index: true,
        },
        menu: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Menu",
                default: [],
            },
        ],
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
        orders: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
            },
        ],
        logo: {
            type: String,
            default: "",
        },
        images: [
            {
                type: String,
            },
        ],
        status: {
            type: String,
            enum: Object.values(RESTAURANT_STATUS),
            default: RESTAURANT_STATUS.PENDING,
            index: true,
        },
    },
    { timestamps: true }
);

restaurantSchema.index({ name: "text" });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export { Restaurant };
