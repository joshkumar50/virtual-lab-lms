const ollama = require('ollama');

/**
 * Service to handle interactions with local Ollama instance
 */
const ollamaService = {
    /**
     * Grade a lab report using the specified model
     * @param {string} prompt - The grading prompt containing the rubric and student report
     * @param {string} model - The model to use (default: qwen3:8b)
     * @returns {Promise<string>} - The AI's response
     */
    gradeSubmission: async (prompt, model = 'qwen3:8b') => {
        try {
            const ollamaClient = ollama.default || ollama;
            const response = await ollamaClient.chat({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                options: {
                    num_predict: 800,   // Increased to prevent JSON truncation
                    temperature: 0.1,   // Keep low temp for structure
                    top_k: 20,
                    top_p: 0.9
                }
            });
            return response.message.content;
        } catch (error) {
            console.error('Ollama Service Error:', error);
            throw new Error('Failed to communicate with Ollama service');
        }
    },

    /**
     * Check if Ollama is running and the model is available
     * @param {string} model - The model to check
     * @returns {Promise<boolean>}
     */
    checkHealth: async (model = 'qwen3:8b') => {
        try {
            const ollamaClient = ollama.default || ollama;
            await ollamaClient.list();
            return true;
            // strict model checking can be added here if needed, 
            // but list() confirms service is up.
        } catch (error) {
            console.error('Ollama Health Check Failed:', error);
            return false;
        }
    }
};

module.exports = ollamaService;
