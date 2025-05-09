import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

// Get all categories (accessible to all users)
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ name: { $ne: "More" } });
    res.status(200).json(
        new ApiResponse(200, "Categories fetched successfully", { categories })
    );
});

// Get 5 random categories with a flag for more categories
const getRandomCategories = asyncHandler(async (req, res) => {
    const moreCategory = await Category.findOne({ name: "More" });

    if (!moreCategory) {
        return res
            .status(404)
            .json(new ApiError(404, "'More' category not found"));
    }

    const otherCategories = await Category.aggregate([
        { $match: { _id: { $ne: moreCategory._id } } },
        { $sample: { size: 5 } },
    ]);

    const categories = [...otherCategories, moreCategory];

    res.status(200).json(
        new ApiResponse(200, "Random categories fetched successfully", {
            categories,
        })
    );
});

// Create a new category (only for super admin)
const createCategory = asyncHandler(async (req, res) => {
    const { name, value } = req.body;
    const imageFile = req.file;

    if (!name || !value || !imageFile) {
        throw new ApiError(400, "Name, value, and image are required");
    }

    const uploadResult = await uploadOnCloudinary(imageFile.path);

    const existingCategory = await Category.findOne({ value });
    if (existingCategory) {
        throw new ApiError(400, "Category with this value already exists");
    }

    const newCategory = await Category.create({
        name,
        value,
        image: uploadResult.url,
    });

    res.status(201).json(
        new ApiResponse(201, "Category created successfully", {
            category: newCategory,
        })
    );
});

// Update a category (only for super admin)
const updateCategory = asyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    const { name, value } = req.body;
    const imageFile = req.file;

    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    if (imageFile) {
        await deleteFromCloudinary(category.image);
        const uploadResult = await uploadOnCloudinary(imageFile.path);
        category.image = uploadResult.url;
    }

    if (name) category.name = name;
    if (value) category.value = value;

    await category.save();

    res.status(200).json(
        new ApiResponse(200, "Category updated successfully", { category })
    );
});

// Delete a category (only for super admin)
const deleteCategory = asyncHandler(async (req, res) => {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    await deleteFromCloudinary(category.image);

    await category.remove();

    res.status(200).json(new ApiResponse(200, "Category deleted successfully"));
});

export {
    getCategories,
    getRandomCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
