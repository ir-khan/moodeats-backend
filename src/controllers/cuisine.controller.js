import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Cuisine } from "../models/cuisine.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

// Get all cuisines (accessible to all users)
const getCuisines = asyncHandler(async (req, res) => {
    const cuisines = await Cuisine.find({ name: { $ne: "More" } });
    res.status(200).json(
        new ApiResponse(200, "Cuisines fetched successfully", { cuisines })
    );
});

// Get 5 random cuisines with a flag for more cuisines
const getRandomCuisines = asyncHandler(async (req, res) => {
    const moreCuisine = await Cuisine.findOne({ name: "More" });

    if (!moreCuisine) {
        return res
            .status(404)
            .json(new ApiError(404, "'More' cuisine not found"));
    }

    const otherCuisines = await Cuisine.aggregate([
        { $match: { _id: { $ne: moreCuisine._id } } },
        { $sample: { size: 5 } },
    ]);

    const cuisines = [...otherCuisines, moreCuisine];

    res.status(200).json(
        new ApiResponse(200, "Random cuisines fetched successfully", {
            cuisines,
        })
    );
});


// Create a new cuisine (only for super admin)
const createCuisine = asyncHandler(async (req, res) => {
    const { name, value } = req.body;
    const imageFile = req.file;

    if (!name || !value || !imageFile) {
        throw new ApiError(400, "Name, value, and image are required");
    }

    const uploadResult = await uploadOnCloudinary(imageFile.path);

    const existingCuisine = await Cuisine.findOne({ value });
    if (existingCuisine) {
        throw new ApiError(400, "Cuisine with this value already exists");
    }

    const newCuisine = await Cuisine.create({
        name,
        value,
        image: uploadResult.url,
    });

    res.status(201).json(
        new ApiResponse(201, "Cuisine created successfully", {
            cuisine: newCuisine,
        })
    );
});

// Update a cuisine (only for super admin)
const updateCuisine = asyncHandler(async (req, res) => {
    const cuisineId = req.params.id;
    const { name, value } = req.body;
    const imageFile = req.file;

    const cuisine = await Cuisine.findById(cuisineId);
    if (!cuisine) {
        throw new ApiError(404, "Cuisine not found");
    }

    if (imageFile) {
        await deleteFromCloudinary(cuisine.image);
        const uploadResult = await uploadOnCloudinary(imageFile.path);
        cuisine.image = uploadResult.url;
    }

    if (name) cuisine.name = name;
    if (value) cuisine.value = value;

    await cuisine.save();

    res.status(200).json(
        new ApiResponse(200, "Cuisine updated successfully", { cuisine })
    );
});

// Delete a cuisine (only for super admin)
const deleteCuisine = asyncHandler(async (req, res) => {
    const cuisineId = req.params.id;

    const cuisine = await Cuisine.findById(cuisineId);
    if (!cuisine) {
        throw new ApiError(404, "Cuisine not found");
    }

    await deleteFromCloudinary(cuisine.image);

    await cuisine.remove();

    res.status(200).json(new ApiResponse(200, "Cuisine deleted successfully"));
});

export {
    getCuisines,
    getRandomCuisines,
    createCuisine,
    updateCuisine,
    deleteCuisine,
};
