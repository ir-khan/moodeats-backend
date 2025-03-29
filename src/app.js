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

// routes declaration
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/otp", optRoutes);
app.use("/api/v1/profile", profileRoutes);

// http://localhost:port/api/v1/auth/register

export { app };
