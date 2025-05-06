import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/user.model.js";
import { Restaurant } from "../../models/restaurant.model.js";
import { Order } from "../../models/order.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const getAdminDashboardMetrics = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalRestaurants,
        pendingRestaurants,
        totalOrders,
        totalSalesAgg,
    ] = await Promise.all([
        User.countDocuments(),
        Restaurant.countDocuments(),
        Restaurant.countDocuments({ isApproved: false }),
        Order.countDocuments(),
        Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$orderPrice" },
                },
            },
        ]),
    ]);

    const totalSales = totalSalesAgg[0]?.totalSales || 0;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalUsers,
                totalRestaurants,
                pendingRestaurants,
                totalOrders,
                totalSales: parseFloat(totalSales.toFixed(2)),
            },
            "Dashboard metrics fetched successfully"
        )
    );
});

export { getAdminDashboardMetrics };
