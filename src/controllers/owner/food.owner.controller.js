import { asyncHandler } from "../../utils/asyncHandler.js";
import { Food } from "../../models/food.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../../utils/cloudinary.js";
import { getAIResponse } from "../../utils/AiClient.js";

// Helper to generate mood tags using AI
const generateMoodTags = async ({
    name,
    description,
    tags,
    category,
    cuisine,
}) => {
    const prompt = `You are an AI assistant specialized in food analysis. A food item is being processed with the following details:
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

Example output: ["comforting", "indulgent", "nostalgic"]`;

    try {
        const aiResult = await getAIResponse(prompt);
        const parsed = JSON.parse(aiResult);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        console.warn("AI failed to generate moodTags.");
        return [];
    }
};

// Create Food Item
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
    const restaurant = req.restaurant;

    if (!name || !description || !category || !cuisine) {
        throw new ApiError(400, "Required fields are missing");
    }

    const images = req.files?.images
        ? await Promise.all(
              req.files.images.map((file) =>
                  uploadOnCloudinary(file.path).then((res) => res?.url)
              )
          )
        : [];

    const moodTags = await generateMoodTags({
        name,
        description,
        tags,
        category,
        cuisine,
    });

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

// Update Food Item
const updateFoodItem = asyncHandler(async (req, res) => {
    const { id: foodId } = req.params;
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

    // Handle image replacement
    if (req.files?.images) {
        const newImages = await Promise.all(
            req.files.images.map((file) =>
                uploadOnCloudinary(file.path).then((res) => res?.url)
            )
        );
        food.images = newImages.filter(Boolean);
        await Promise.all(oldImageUrls.map((url) => deleteFromCloudinary(url)));
    }

    // Update mood tags only if relevant fields changed
    if (name || description || tags || category || cuisine) {
        food.moodTags = await generateMoodTags({
            name: food.name,
            description: food.description,
            tags: food.tags,
            category: food.category,
            cuisine: food.cuisine,
        });
    }

    await food.save();

    res.status(200).json(
        new ApiResponse(200, "Food item updated successfully", { food })
    );
});

// Delete Food Item
const deleteFoodItem = asyncHandler(async (req, res) => {
    const { id: foodId } = req.params;
    const restaurant = req.restaurant;

    const food = await Food.findOne({
        _id: foodId,
        restaurant: restaurant._id,
    });
    if (!food) throw new ApiError(404, "Food item not found");

    // Delete Cloudinary images
    if (food.images?.length) {
        await Promise.all(food.images.map((url) => deleteFromCloudinary(url)));
    }

    await food.deleteOne();

    res.status(200).json(
        new ApiResponse(200, "Food item deleted successfully")
    );
});

// Get All Food Items (with optional filtering & pagination)
const getRestaurantFoods = asyncHandler(async (req, res) => {
    const restaurant = req.restaurant;
    const {
        page = 1,
        limit = 10,
        search = "",
        category,
        cuisine,
        isAvailable,
        moodTags,
    } = req.query;

    const filters = { restaurant: restaurant._id };

    if (category) filters.category = category;
    if (cuisine) filters.cuisine = cuisine;
    if (typeof isAvailable !== "undefined")
        filters.isAvailable = isAvailable === "true";

    if (search) {
        filters.name = { $regex: search, $options: "i" };
    }

    if (moodTags) {
        const tagsArray = moodTags.split(',').map(tag => tag.trim());
        filters.moodTags = { $in: tagsArray };
    }

    const [foods, total] = await Promise.all([
        Food.find(filters)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 }),
        Food.countDocuments(filters),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Food items fetched successfully", {
            foods,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        })
    );
});


// Get Single Food Item
const getRestaurantFoodById = asyncHandler(async (req, res) => {
    const { id: foodId } = req.params;
    const restaurant = req.restaurant;

    const food = await Food.findOne({
        _id: foodId,
        restaurant: restaurant._id,
    });
    if (!food) throw new ApiError(404, "Food item not found");

    res.status(200).json(
        new ApiResponse(200, "Food item fetched successfully", { food })
    );
});

export {
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    getRestaurantFoods,
    getRestaurantFoodById,
};
