import mongoose, { Schema } from "mongoose";
import { ADDRESS_LABELS } from "../constants/status.js";

const addressSchema = new Schema(
    {
        label: {
            type: String,
            enum: Object.values(ADDRESS_LABELS),
            default: ADDRESS_LABELS.HOME,
        },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String, required: true },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Add 2dsphere index for geo queries
addressSchema.index({ location: "2dsphere" });

const Address = mongoose.model("Address", addressSchema);

export { Address };
