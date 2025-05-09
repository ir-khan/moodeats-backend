import axios from "axios";
import { ApiError } from "./ApiError.js";

/**
 * Calls the AI model to generate a response based on a prompt.
 * @param {string} prompt - The prompt string to send to the AI model.
 * @returns {Promise<string>} - The plain text content returned by the AI.
 */
const getAIResponse = async (prompt) => {
    try {
        const response = await axios.post(
            process.env.OPENROUTER_API_URL,
            {
                model: process.env.OPENROUTER_MODEL,
                messages: [{ role: "user", content: prompt }],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("AI API Error:", error?.response?.data || error);
        throw new ApiError(500, "Failed to communicate with AI service.");
    }
};

export { getAIResponse };
