import mongoose, { Schema } from "mongoose";

const menuSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
        },
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        validFrom: Date,
        validTo: Date,
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
