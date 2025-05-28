import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/user.model.js";
import { Restaurant } from "../../models/restaurant.model.js";
import { Food } from "../../models/food.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const getAdminDashboardMetrics = asyncHandler(async (req, res) => {
    const [totalUsers, totalRestaurants, totalFoods] = await Promise.all([
        User.countDocuments(),
        Restaurant.countDocuments(),
        // Total foods
        Food.countDocuments(),
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Dashboard metrics fetched successfully", {
            totalUsers,
            totalRestaurants,
            totalFoods,
        })
    );
});

export { getAdminDashboardMetrics };
