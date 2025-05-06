import mongoose, { Schema } from "mongoose";

const cuisineSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        value: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        image: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Cuisine = mongoose.model("Cuisine", cuisineSchema);
export default Cuisine;
