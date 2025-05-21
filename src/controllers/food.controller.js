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

    let paginatedIds = [];

    if (total > 0) {
        const allIds = await Food.aggregate([
            { $match: query },
            { $sample: { size: Math.min(total, 1000) } },
            { $project: { _id: 1 } },
        ]);

        paginatedIds = allIds
            .slice((page - 1) * limit, page * limit)
            .map((doc) => doc._id);
    }

    const idOrder = new Map(paginatedIds.map((id, i) => [id.toString(), i]));

    let foods = [];

    if (paginatedIds.length > 0) {
        foods = await Food.find({ _id: { $in: paginatedIds } })
            .populate({ path: "category", select: "name" })
            .populate({ path: "cuisine", select: "name" })
            .populate({
                path: "restaurant",
                populate: { path: "addresses" },
            });

        foods.sort(
            (a, b) =>
                idOrder.get(a._id.toString()) - idOrder.get(b._id.toString())
        );
    }

    res.status(200).json(
        new ApiResponse(200, "Random food items fetched successfully", {
            total,
            limit,
            page,
            totalPages,
            foods,
        })
    );

});

export { getAllFoods };
