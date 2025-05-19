import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAIResponse } from "../utils/AiClient.js";

const sendResponse = (res, statusCode, message, data = {}) => {
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode, message, data));
};

const getRecommendations = asyncHandler(async (req, res) => {
    const { mood, description } = req.body;

    if (!mood) {
        throw new ApiError(400, "Mood is required");
    }

    const prompt = `You are an intelligent food assistant. A user is currently feeling "${mood}". ${description ? `They also said: "` + description + `". ` : ``}Your task is to deeply understand the user's emotional state and suggest a list of food-related tags that best match their mood. These tags should represent general food categories, cuisines, dietary types, or cooking styles that are comforting, healthy, and commonly associated with that mood.

    Respond ONLY with a plain JSON array of lowercase tag strings.
    
    Do not include any explanations or extra text.
    Avoid brand names, vague emotions, or abstract concepts.
    Make sure the tags can be directly used to query a food database or filter content.
    
    Example response: ["comfort", "high protein", "vegetarian", "soups", "mediterranean"]
    `;

    const content = await getAIResponse(prompt);

    let keywords;
    try {
        keywords = JSON.parse(content);
        if (!Array.isArray(keywords)) throw new Error();
    } catch {
        throw new ApiError(500, "Invalid AI response format.");
    }

    return sendResponse(res, 200, "Recommended dishes based on your mood", {
        recommendationData: {
            recommendations: keywords,
        },
    });
});

export { getRecommendations };
