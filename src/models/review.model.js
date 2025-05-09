import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
    {
        rating: { type: Number, required: true },
        review: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: true,
        },
    },
    { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export { Review };
