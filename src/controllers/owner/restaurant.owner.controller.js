import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Restaurant } from "../../models/restaurant.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../../utils/cloudinary.js";

const registerRestaurant = asyncHandler(async (req, res) => {
    const { name, phone, cuisine } = req.body;

    if (!name || !phone || !cuisine) {
        throw new ApiError(400, "All fields are required");
    }

    const existing = await Restaurant.findOne({
        name: name.trim(),
        owner: req.user._id,
    });

    if (existing) {
        throw new ApiError(409, "Restaurant already registered");
    }

    const restaurant = await Restaurant.create({
        name,
        phone,
        cuisine,
        owner: req.user._id,
    });

    res.status(201).json(
        new ApiResponse(201, "Restaurant registered successfully", {
            restaurant,
        })
    );
});

const getMyRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findOne({ owner: req.user._id })
        .populate("cuisine")
        .populate("addresses");

    if (!restaurant) {
        throw new ApiError(404, "No restaurant found");
    }

    res.status(200).json(
        new ApiResponse(200, "Restaurant fetched successfully", { restaurant })
    );
});

const updateRestaurantDetails = asyncHandler(async (req, res) => {
    const restaurantId = req.params.id;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new ApiError(404, "Restaurant not found");

    if (restaurant.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this restaurant");
    }

    const { name, phone, cuisine, isOpen } = req.body;

    if (name) restaurant.name = name;
    if (phone) restaurant.phone = phone;
    if (cuisine) restaurant.cuisine = cuisine;
    if (typeof isOpen !== "undefined") restaurant.isOpen = isOpen;

    if (req.files?.logo) {
        const logoUpload = await uploadOnCloudinary(req.files.logo[0].path);
        if (logoUpload?.url) {
            await deleteFromCloudinary(restaurant.logo);
            restaurant.logo = logoUpload.url;
        }
    }

    if (req.files?.images) {
        const imageUrls = await Promise.all(
            req.files.images.map((file) =>
                uploadOnCloudinary(file.path).then((res) => res.url)
            )
        );
        restaurant.images = imageUrls;
    }

    await restaurant.save();

    res.status(200).json(
        new ApiResponse(200, "Restaurant updated", { restaurant })
    );
});

export { registerRestaurant, getMyRestaurant, updateRestaurantDetails };
