import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
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

const Category = mongoose.model("Category", categorySchema);
export { Category };
