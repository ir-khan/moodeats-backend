// require("dotenv").config();
// import dotenv from 'dotenv'; // this is not required because we are using in command
import connectDB from "./db/db.js";
import { app } from "./app.js";

// Connect to MongoDB
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed", err);
    });

export default app;