import mongoose, { Schema } from "mongoose";

const RESTAURANT_STATUS = {
    ACTIVE: "ACTIVE", // Restaurant is open and operating normally.
    INACTIVE: "INACTIVE", // Restaurant is offline or not accepting orders.
    TEMPORARILY_CLOSED: "TEMPORARILY_CLOSED", // Temporarily closed due to special circumstances.
    UNDER_MAINTENANCE: "UNDER_MAINTENANCE", // Undergoing maintenance or updates.
    SUSPENDED: "SUSPENDED", // Suspended due to policy or regulatory issues.
};

const restaurantSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        address: {
            // You could further break down the address into street, city, etc.
            type: Object,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        menu: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Menu",
            },
        ],
        rating: {
            type: Number,
            required: true,
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
        status: {
            type: String,
            enum: Object.values(RESTAURANT_STATUS),
            default: RESTAURANT_STATUS.ACTIVE,
            required: true,
        },
    },
    { timestamps: true }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export { Restaurant, RESTAURANT_STATUS };
