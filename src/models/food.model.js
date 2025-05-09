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
        images: [
            {
                type: String,
            },
        ],
        price: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        moodTags: [
            {
                type: String,
                trim: true,
            },
        ],
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

// Indexing for performance
foodSchema.index({ restaurant: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ isAvailable: 1 });
foodSchema.index({ moodTags: 1 });

const Food = mongoose.model("Food", foodSchema);
export { Food };
