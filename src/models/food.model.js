import mongoose, { Schema } from "mongoose";

const foodSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        foodPictures: [
            {
                type: String,
            },
        ],
        price: {
            type: Number,
            default: 0,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        cuisine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cuisine",
            required: true,
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
        },
        menu: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
        },
        rating: {
            type: Number,
            default: 0,
        },
        reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
    },
    { timestamps: true }
);

const Food = mongoose.model("Food", foodSchema);
