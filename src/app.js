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

// routes import
import authRoutes from "./routes/auth.route.js";

// routes declaration
app.use("/api/v1/auth", authRoutes);

// http://localhost:port/api/v1/auth/register

export { app };
