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
    const { page = 1, limit = 10, status, cuisine, owner, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (cuisine) filter.cuisine = cuisine;
    if (owner) filter.owner = owner;
    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    const total = await Restaurant.countDocuments(filter);
    const restaurants = await Restaurant.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("owner", "name email")
        .populate("cuisine", "name")
        // .populate("reviews")

    sendResponse(res, 200, "Restaurants fetched", {
        total,
        page: Number(page),
        limit: Number(limit),
        restaurants,
    });
});

const getRestaurantById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id)
        .populate("owner", "name email")
        .populate("cuisine", "name")
        // .populate("reviews")

    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    sendResponse(res, 200, "Restaurant fetched", { restaurant });
});

const updateRestaurantByAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(id, updates, {
        new: true,
    })
        .populate("owner", "name email")
        .populate("cuisine", "name");

    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    sendResponse(res, 200, "Restaurant updated", { restaurant });
});

const getPendingRestaurants = asyncHandler(async (req, res) => {
    const pendingRestaurants = await Restaurant.find({
        status: RESTAURANT_STATUS.PENDING,
    })
        .populate("owner", "name email")
        .populate("cuisine", "name");

    sendResponse(res, 200, "Pending restaurants fetched", {
        restaurants: pendingRestaurants,
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
    getRestaurantById,
    updateRestaurantByAdmin,
    approveRestaurant,
    rejectRestaurant,
    deleteRestaurant,
};
