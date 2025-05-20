import { asyncHandler } from "../utils/asyncHandler.js";
import { Food } from "../models/food.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllFoods = asyncHandler(async (req, res) => {
    let {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search = "",
        category,
        cuisine,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) {
        throw new ApiError(400, "Page must be a positive number");
    }
    if (isNaN(limit) || limit < 1) {
        throw new ApiError(400, "Limit must be a positive number");
    }

    const allowedSortFields = ["createdAt", "name", "price"];
    if (!allowedSortFields.includes(sortBy)) {
        throw new ApiError(
            400,
            `Invalid sortBy field. Allowed: ${allowedSortFields.join(", ")}`
        );
    }

    const query = {};

    if (category) {
        query.category = category;
    }

    if (cuisine) {
        query.cuisine = cuisine;
    }

    if (Array.isArray(req.query.moodTags)) {
        query.moodTags = { $in: req.query.moodTags };
    } else if (req.query.moodTags) {
        query.moodTags = { $in: [req.query.moodTags] };
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    const total = await Food.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const foods = await Food.find(query)
        .populate("category cuisine restaurant")
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    res.status(200).json(
        new ApiResponse(200, "Food items fetched successfully", {
            total,
            page,
            limit,
            totalPages,
            foods,
        })
    );
});

export { getAllFoods };
