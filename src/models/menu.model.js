import mongoose, { Schema } from "mongoose";

const menuSchema = new Schema({}, { timestamps: true });

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
