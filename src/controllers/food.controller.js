import { asyncHandler } from "../../utils/asyncHandler.js";
import { Food } from "../../models/food.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const getAllRestaurantFoods = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search = "",
        category,
        moodTag,
    } = req.query;

    const restaurant = req.params.restaurantId || req.user?.restaurant;

    if (!restaurant) throw new ApiError(400, "Restaurant ID is required");

    const query = { restaurant };

    if (category) query.category = category;
    if (moodTag) query.moodTags = moodTag;

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    const total = await Food.countDocuments(query);

    const foods = await Food.find(query)
        .populate("category cuisine")
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    res.status(200).json(
        new ApiResponse(200, "Food items fetched", {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            foods,
        })
    );
});

export { getAllRestaurantFoods };
