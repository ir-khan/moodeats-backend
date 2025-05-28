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

    const prompt = `You are an intelligent food assistant. A user is currently feeling "${mood}". ${description ? `They also said: "` + description + `". ` : ``}Your task is to deeply understand the user's emotional state and suggest a list of specific, food-related mood tags that match their current feelings. These tags should describe mood-based food experiences such as emotional needs, comfort levels, energy desires, or cravings. Respond ONLY with a plain JSON array of lowercase mood-related food tags. Do not include explanations or extra text. Avoid brand names or generic terms like "food" or "meal". Make sure the tags are specific enough to filter or categorize food content based on mood. Example response: ["comforting", "nostalgic" "energizing", "light-and-fresh", "indulgent", "warming"]`;

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
