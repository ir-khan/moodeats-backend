import express from "express";
import cors from "cors";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send(
        "   Welcome, \n      We are here to help you with your queries. \n                      From \n                      MOODEATS"
    );
});

// routes import
import authRoutes from "./routes/auth.route.js";
import optRoutes from "./routes/otp.route.js";
import profileRoutes from "./routes/profile.route.js";
import moodRoutes from "./routes/mood.route.js";
import categoryRoutes from "./routes/category.route.js";
import cuisineRoutes from "./routes/cuisine.route.js";
import foodRoutes from "./routes/food.route.js";
import adminRoutes from "./routes/admin.route.js";
import ownerRestaurantRoutes from "./routes/owner/restaurant.owner.route.js";
import ownerFoodRoutes from "./routes/owner/food.owner.route.js";

// routes declaration
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/otp", optRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/mood", moodRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cuisines", cuisineRoutes);
app.use("/api/v1/foods", foodRoutes);

// admin routes
app.use("/api/v1/admin", adminRoutes);

// owner routes
app.use("/api/v1/owner/restaurant", ownerRestaurantRoutes);
app.use("/api/v1/owner/restaurant", ownerFoodRoutes);

// http://localhost:port/api/v1/auth/register

// middleware import
import { errorHandler } from "./middlewares/error.middleware.js";

app.use(errorHandler);

export { app };
