import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/user.model.js";
import { Restaurant } from "../../models/restaurant.model.js";
import { Food } from "../../models/food.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const getAdminDashboardMetrics = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalRestaurants,
        restaurantStatusCounts,
        totalFoods,
        categoryStatsAgg,
        cuisineStatsAgg,
        moodTagStatsAgg,
    ] = await Promise.all([
        User.countDocuments(),
        Restaurant.countDocuments(),

        // Count restaurants by status
        Restaurant.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    status: "$_id",
                    count: 1,
                    _id: 0,
                },
            },
        ]),

        // Total foods
        Food.countDocuments(),

        // Category-wise food count
        Food.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryInfo",
                },
            },
            { $unwind: "$categoryInfo" },
            {
                $project: {
                    _id: 0,
                    name: "$categoryInfo.name",
                    count: 1,
                },
            },
        ]),

        // Cuisine-wise food count
        Food.aggregate([
            {
                $group: {
                    _id: "$cuisine",
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "cuisines",
                    localField: "_id",
                    foreignField: "_id",
                    as: "cuisineInfo",
                },
            },
            { $unwind: "$cuisineInfo" },
            {
                $project: {
                    _id: 0,
                    name: "$cuisineInfo.name",
                    count: 1,
                },
            },
        ]),

        // Mood tag usage stats
        Food.aggregate([
            { $unwind: "$moodTags" },
            {
                $group: {
                    _id: "$moodTags",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    name: "$_id",
                    count: 1,
                    _id: 0,
                },
            },
        ]),
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Dashboard metrics fetched successfully", {
            totalUsers,
            totalRestaurants,
            restaurantStatusCounts,
            totalFoods,
            categoryStats: categoryStatsAgg,
            cuisineStats: cuisineStatsAgg,
            moodTagTrends: moodTagStatsAgg,
        })
    );
});

export { getAdminDashboardMetrics };
