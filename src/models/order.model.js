import mongoose, { Schema } from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from "../constants/status.js";

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
    unitPrice: {
        type: Number,
        required: true,
    },
});

const orderSchema = new Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        deliveryAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            required: true,
        },
        orderItems: [orderItemSchema],
        orderPrice: {
            type: Number,
            required: true,
        },
        orderStatus: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PENDING,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING,
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PAYMENT_METHOD),
            required: true,
        },
        transactionId: {
            type: String,
        },
        notes: {
            type: String,
            default: "",
        },
        statusTimestamps: {
            placedAt: { type: Date, default: Date.now },
            acceptedAt: Date,
            dispatchedAt: Date,
            deliveredAt: Date,
            cancelledAt: Date,
        },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export { Order };
