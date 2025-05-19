import { Router } from "express";
import {
    createAdmin,
    loginAdmin,
    logoutAdmin,
    refreshAdminAccessToken,
    changeAdminPassword,
} from "../controllers/admin/auth.admin.controller.js";
import {
    getAllRestaurants,
    getPendingRestaurants,
    getRestaurantById,
    updateRestaurantByAdmin,
    approveRestaurant,
    rejectRestaurant,
    deleteRestaurant,
} from "../controllers/admin/restaurant.admin.controller.js";
import {
    getAllUsers,
    blockUser,
    unblockUser,
    deleteUser,
} from "../controllers/admin/user.admin.controller.js";
import {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
} from "../controllers/admin/order.admin.controller.js";
import { getAdminDashboardMetrics } from "../controllers/admin/dashboard.admin.controller.js";
import upload from "../middlewares/multer.middleware.js";
import {
    verifyToken,
    verifyAdminRoles,
} from "../middlewares/auth.middleware.js";
import { ADMIN_ROLES } from "../constants/roles.js";

const router = Router();

// -------- AUTH ROUTES --------
router
    .route("/register")
    .post(
        verifyToken,
        verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
        upload.single("avatar"),
        createAdmin
    );

router.route("/login").post(
    // verifyToken,
    // verifyAdminRoles(
    //     ADMIN_ROLES.SUPER_ADMIN,
    //     ADMIN_ROLES.ADMIN,
    //     ADMIN_ROLES.MODERATOR,
    //     ADMIN_ROLES.SUPPORT
    // ),
    loginAdmin
);

router
    .route("/refresh-token")
    .post(
        verifyToken,
        verifyAdminRoles(
            ADMIN_ROLES.SUPER_ADMIN,
            ADMIN_ROLES.ADMIN,
            ADMIN_ROLES.MODERATOR,
            ADMIN_ROLES.SUPPORT
        ),
        refreshAdminAccessToken
    );

router
    .route("/logout")
    .post(
        verifyToken,
        verifyAdminRoles(
            ADMIN_ROLES.SUPER_ADMIN,
            ADMIN_ROLES.ADMIN,
            ADMIN_ROLES.MODERATOR,
            ADMIN_ROLES.SUPPORT
        ),
        logoutAdmin
    );

router
    .route("/change-password")
    .post(
        verifyToken,
        verifyAdminRoles(
            ADMIN_ROLES.SUPER_ADMIN,
            ADMIN_ROLES.ADMIN,
            ADMIN_ROLES.MODERATOR,
            ADMIN_ROLES.SUPPORT
        ),
        changeAdminPassword
    );

// -------- RESTAURANT MANAGEMENT ROUTES --------
router
    .route("/restaurants")
    .get(
        verifyToken,
        verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
        getAllRestaurants
    );

router
    .route("/restaurants/pending")
    .get(
        verifyToken,
        verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
        getPendingRestaurants
    );

router
    .route("/restaurants/:id/approve")
    .patch(
        verifyToken,
        verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
        approveRestaurant
    );

router
    .route("/restaurants/:id/reject")
    .patch(
        verifyToken,
        verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
        rejectRestaurant
    );

router
    .route("/restaurants/:id")
    .delete(
        verifyToken,
        verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
        deleteRestaurant
    );

router
    .route("/restaurants/:id")
    .get(
        verifyToken,
        verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
        getRestaurantById
    )
    .patch(
        verifyToken,
        verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
        updateRestaurantByAdmin
    );

// -------- USER MANAGEMENT ROUTES --------
router
    .route("/users")
    .get(verifyToken, verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN), getAllUsers);

router
    .route("/users/:id/block")
    .patch(verifyToken, verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN), blockUser);

router
    .route("/users/:id/unblock")
    .patch(verifyToken, verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN), unblockUser);

router
    .route("/users/:id")
    .delete(verifyToken, verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN), deleteUser);

// -------- ORDER MANAGEMENT ROUTES --------
router
    .route("/orders")
    .get(verifyToken, verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN), getAllOrders);

router
    .route("/orders/:id")
    .get(verifyToken, verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN), getOrderById);

router
    .route("/orders/:id/status")
    .patch(
        verifyToken,
        verifyAdminRoles(ADMIN_ROLES.SUPER_ADMIN),
        updateOrderStatus
    );

// -------- DASHBOARD METRICS ROUTE --------
router.get(
    "/metrics",
    verifyToken,
    verifyAdminRoles(
        ADMIN_ROLES.SUPER_ADMIN,
        ADMIN_ROLES.ADMIN,
        ADMIN_ROLES.MODERATOR
    ),
    getAdminDashboardMetrics
);

export default router;
