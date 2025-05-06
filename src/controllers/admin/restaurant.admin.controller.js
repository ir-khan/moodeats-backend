import { Restaurant } from "../../models/restaurant.model.js";
import { RESTAURANT_STATUS } from "../../constants/status.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const sendResponse = (res, statusCode, message, data = {}) => {
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode, message, data));
};

const getAllRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find()
        .populate("owner", "name email")
        .populate("cuisine", "name")
        .populate("reviews")
        .populate("orders");

    sendResponse(res, 200, "All restaurants fetched", { restaurants });
});

const getPendingRestaurants = asyncHandler(async (req, res) => {
    const pendingRestaurants = await Restaurant.find({
        status: RESTAURANT_STATUS.PENDING,
    })
        .populate("owner", "name email")
        .populate("cuisine", "name");

    sendResponse(res, 200, "Pending restaurants fetched", {
        pendingRestaurants,
    });
});

const approveRestaurant = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const restaurant = await Restaurant.findByIdAndUpdate(
        id,
        { status: RESTAURANT_STATUS.ACTIVE },
        { new: true }
    );

    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    sendResponse(res, 200, "Restaurant approved", { restaurant });
});

const rejectRestaurant = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    restaurant.status = RESTAURANT_STATUS.SUSPENDED;
    await restaurant.save();

    sendResponse(res, 200, "Restaurant rejected", { restaurant });
});

const deleteRestaurant = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    sendResponse(res, 200, "Restaurant deleted successfully");
});

export {
    getAllRestaurants,
    getPendingRestaurants,
    approveRestaurant,
    rejectRestaurant,
    deleteRestaurant,
};
