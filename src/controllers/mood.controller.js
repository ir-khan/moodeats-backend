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

    const prompt = `You are an intelligent food assistant. A user is currently feeling "${mood}". ${description ? `They also said: "${description}". ` : ``}Your task is to deeply understand the user's emotional and sensory state, and suggest a list of up to 5 specific, food-related mood tags that reflect their emotional needs, cravings, or comfort desires.

    The output should align with this style of tags: ["comforting", "indulgent", "satisfying", "craveable", "energizing", "crunchy", "savory", "cheesy", "aromatic", "spicy"]. You may generate new tags, but keep them in a similar tone and structure — emotional, sensory, and food-related.
    
    Rules:
    - Only return a plain JSON array (3 - 5 items).
    - No explanation or extra text.
    - Tags must be lowercase, single words or hyphenated phrases suitable for food filtering and search.
    
    Example: ["comforting", "craveable", "cheesy"]`;

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
