import { asyncHandler } from "../../utils/asyncHandler.js";
import { Order } from "../../models/order.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const sendResponse = (res, statusCode, message, data = {}) => {
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode, message, data));
};

const getAllOrders = asyncHandler(async (req, res) => {
    const { status, date } = req.query;
    const query = {};

    if (status) {
        query.orderStatus = status;
    }

    if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(query)
        .populate("customer", "name email")
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });

    sendResponse(res, 200, "Orders fetched successfully", { orders });
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("customer", "name email phone")
        .populate("restaurant", "name")
        .populate("deliveryAddress");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    sendResponse(res, 200, "Order details fetched", { order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    order.orderStatus = status;

    const timestampField = {
        PENDING: "placedAt",
        ACCEPTED: "acceptedAt",
        DISPATCHED: "dispatchedAt",
        DELIVERED: "deliveredAt",
        CANCELLED: "cancelledAt",
    }[status];

    if (timestampField) {
        order.statusTimestamps[timestampField] = new Date();
    }

    await order.save();

    sendResponse(res, 200, "Order status updated", { order });
});

export { getAllOrders, getOrderById, updateOrderStatus };
