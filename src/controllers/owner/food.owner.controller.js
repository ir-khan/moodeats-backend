import { asyncHandler } from "../../utils/asyncHandler.js";
import { Food } from "../../models/food.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../../utils/cloudinary.js";
import { getAIResponse } from "../../utils/AiClient.js";

const createFoodItem = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        discount,
        category,
        cuisine,
        tags = [],
    } = req.body;

    if (!name || !description || !category || !cuisine) {
        throw new ApiError(400, "Required fields are missing");
    }

    const restaurant = req.restaurant;

    const images = req.files?.images
        ? await Promise.all(
              req.files.images.map((file) =>
                  uploadOnCloudinary(file.path).then((res) => res?.url)
              )
          )
        : [];

    const prompt = `You are an AI assistant specialized in food analysis. A new food item is being added with the following details:
- Name: ${name}
- Description: ${description}
- Tags: ${tags.join(", ") || "None"}
- Category: ${category}
- Cuisine: ${cuisine}

Your job is to analyze the emotional and sensory aspects of this dish and suggest a JSON array of mood-related keywords (like "comforting", "energizing", "refreshing", etc.) that this food may trigger in users.

Rules:
- Only return a plain JSON array of lowercase strings.
- No extra text, explanations, or abstract words.
- Keywords should be applicable to food search and recommendations.

Example output: ["comforting", "indulgent", "nostalgic"]
`;

    let moodTags = [];
    try {
        const aiResult = await getAIResponse(prompt);
        const parsed = JSON.parse(aiResult);
        if (Array.isArray(parsed)) moodTags = parsed;
    } catch {
        console.warn("Invalid moodTags from AI. Skipping.");
    }

    const newFood = await Food.create({
        name,
        description,
        images,
        price,
        discount,
        tags,
        moodTags,
        category,
        cuisine,
        restaurant: restaurant._id,
    });

    res.status(201).json(
        new ApiResponse(201, "Food item created successfully", {
            food: newFood,
        })
    );
});

const updateFoodItem = asyncHandler(async (req, res) => {
    const foodId = req.params.id;
    const restaurant = req.restaurant;

    const food = await Food.findOne({
        _id: foodId,
        restaurant: restaurant._id,
    });
    if (!food) throw new ApiError(404, "Food item not found");

    const {
        name,
        description,
        price,
        discount,
        category,
        cuisine,
        tags,
        isAvailable,
    } = req.body;

    const oldImageUrls = [...food.images];

    if (name) food.name = name;
    if (description) food.description = description;
    if (typeof price !== "undefined") food.price = price;
    if (typeof discount !== "undefined") food.discount = discount;
    if (typeof isAvailable !== "undefined") food.isAvailable = isAvailable;
    if (category) food.category = category;
    if (cuisine) food.cuisine = cuisine;
    if (tags) food.tags = tags;

    if (req.files?.images) {
        const imageUrls = await Promise.all(
            req.files.images.map((file) =>
                uploadOnCloudinary(file.path).then((res) => res?.url)
            )
        );
        food.images = imageUrls.filter(Boolean);

        await Promise.all(oldImageUrls.map((url) => deleteFromCloudinary(url)));
    }

    if (name || description) {
        const prompt = `You are an AI assistant specialized in food analysis. A food item is being updated with the following details:
- Name: ${food.name}
- Description: ${food.description}
- Tags: ${food.tags.join(", ") || "None"}
- Category: ${food.category}
- Cuisine: ${food.cuisine}

Your job is to analyze the emotional and sensory aspects of this dish and suggest a JSON array of mood-related keywords (like "comforting", "energizing", "refreshing", etc.) that this food may trigger in users.

Rules:
- Only return a plain JSON array of lowercase strings.
- No extra text, explanations, or abstract words.
- Keywords should be applicable to food search and recommendations.

Example output: ["comforting", "indulgent", "nostalgic"]
`;
        try {
            const aiResult = await getAIResponse(prompt);
            const parsed = JSON.parse(aiResult);
            if (Array.isArray(parsed)) food.moodTags = parsed;
        } catch {
            console.warn("AI failed to update moodTags.");
        }
    }

    await food.save();

    res.status(200).json(new ApiResponse(200, "Food item updated", { food }));
});

const deleteFoodItem = asyncHandler(async (req, res) => {
    const foodId = req.params.id;
    const restaurant = req.restaurant;

    const food = await Food.findOne({
        _id: foodId,
        restaurant: restaurant._id,
    });
    if (!food) throw new ApiError(404, "Food item not found");

    if (food.images?.length) {
        await Promise.all(food.images.map((url) => deleteFromCloudinary(url)));
    }

    await food.deleteOne();

    res.status(200).json(
        new ApiResponse(200, "Food item deleted successfully")
    );
});

export { createFoodItem, updateFoodItem, deleteFoodItem };
