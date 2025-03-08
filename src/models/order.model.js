import mongoose, { Schema } from "mongoose";

const ORDER_STATUS = {
    PENDING: "PENDING", // Order placed, awaiting confirmation
    CONFIRMED: "CONFIRMED", // Order confirmed by restaurant
    PREPARING: "PREPARING", // Restaurant is preparing the order
    READY: "READY", // Order is ready for pickup/delivery
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY", // Order is on its way to the customer
    DELIVERED: "DELIVERED", // Order delivered to the customer
    CANCELLED: "CANCELLED", // Order cancelled
    FAILED: "FAILED", // Order failed (e.g., payment or system error)
};

const orderItemSchema = new Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

const orderSchema = new Schema(
    {
        orderPrice: {
            type: Number,
            required: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        orderItems: [orderItemSchema],
        orderStatus: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PENDING,
        },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export { Order, ORDER_STATUS };
