// Remove all specific AiProvider imports as getLLMProvider handles loading
// const { OpenAi } = require("../../../utils/AiProviders/openAi");
// const { AzureOpenAi } = require("../../../utils/AiProviders/azureOpenAi");
// const { Anthropic } = require("../../../utils/AiProviders/anthropic");
// const { GeminiLLM } = require("../../../utils/AiProviders/gemini");
// const { LMStudio } = require("../../../utils/AiProviders/lmStudio");
// const { LocalAi } = require("../../../utils/AiProviders/localAi");
// const { OllamaAILLM } = require("../../../utils/AiProviders/ollama");
// const { TogetherAi } = require("../../../utils/AiProviders/togetherAi");
// const { Mistral } = require("../../../utils/AiProviders/mistral");
// const { HuggingFaceLLM } = require("../../../utils/AiProviders/huggingface");
// const { PerplexityLLM } = require("../../../utils/AiProviders/perplexity");
// const { KoboldCPPLLM } = require("../../../utils/AiProviders/koboldCPP");
// const { TextGenWebUILLM } = require("../../../utils/AiProviders/textGenWebUI");
// const { LiteLLM } = require("../../../utils/AiProviders/liteLLM");
// const { GenericOpenAiLLM } = require("../../../utils/AiProviders/genericOpenAi");
// const { Groq } = require("../../../utils/AiProviders/groq");
// const { CohereLLM } = require("../../../utils/AiProviders/cohere");
// const { FireworksLLM } = require("../../../utils/AiProviders/fireworks");
// const { BedrockLLM } = require("../../../utils/AiProviders/bedrock");
// const { DeepSeekLLM } = require("../../../utils/AiProviders/deepseek");
// const { OpenRouterLLM } = require("../../../utils/AiProviders/openRouter");
// const { ApiPieLLM } = require("../../../utils/AiProviders/apipie");
// const { XAILLM } = require("../../../utils/AiProviders/xai");
// const { NvidiaNimLLM } = require("../../../utils/AiProviders/nvidia");
// const { Ppiollm } = require("../../../utils/AiProviders/ppio");

const { SystemSettings } = require("../../../models/systemSettings");
const { validatedRequest } = require("../../../utils/middleware/validatedRequest");
const {flexUserRoleValid,ROLES,} = require("../../../utils/middleware/multiUserProtected");
const { getLLMProvider } = require("../../../utils/helpers");

// Define the base system prompt for the enhancer LLM
const ENHANCER_SYSTEM_PROMPT = `You are an assistant that refines Text-to-Speech (TTS) instructions. Take the user's input and enhance it into a structured format like the examples provided below. Focus on elements like Accent/Affect, Tone, Pacing, Emotion, Pronunciation, and Personality Affect. Ensure the output strictly follows the structure of the examples and only contains the structured text.

Example 1:
Accent/Affect: slight French accent; sophisticated yet friendly, clearly understandable with a charming touch of French intonation.
Tone: Warm and a little snooty. Speak with pride and knowledge for the art being presented.
Pacing: Moderate, with deliberate pauses at key observations to allow listeners to appreciate details.
Emotion: Calm, knowledgeable enthusiasm; show genuine reverence and fascination for the artwork.
Pronunciation: Clearly articulate French words (e.g., "Mes amis," "incroyable") in French and artist names (e.g., "Leonardo da Vinci") with authentic French pronunciation.
Personality Affect: Cultured, engaging, and refined, guiding visitors with a blend of artistic passion and welcoming charm.

Example 2:
Tone: The voice should be refined, formal, and delightfully theatrical, reminiscent of a charming radio announcer from the early 20th century.
Pacing: The speech should flow smoothly at a steady cadence, neither rushed nor sluggish, allowing for clarity and a touch of grandeur.
Pronunciation: Words should be enunciated crisply and elegantly, with an emphasis on vintage expressions and a slight flourish on key phrases.
Emotion: The delivery should feel warm, enthusiastic, and welcoming, as if addressing a distinguished audience with utmost politeness.
Inflection: Gentle rises and falls in pitch should be used to maintain engagement, adding a playful yet dignified flair to each sentence.
Word Choice: The script should incorporate vintage expressions like splendid, marvelous, posthaste, and ta-ta for now, avoiding modern slang.

Example 3:
Voice: Deep and rugged, with a hearty, boisterous quality, like a seasoned sea captain who's seen many voyages.
Tone: Friendly and spirited, with a sense of adventure and enthusiasm, making every detail feel like part of a grand journey.
Dialect: Classic pirate speech with old-timey nautical phrases, dropped "g"s, and exaggerated "Arrrs" to stay in character.
Pronunciation: Rough and exaggerated, with drawn-out vowels, rolling "r"s, and a rhythm that mimics the rise and fall of ocean waves.
Features: Uses playful pirate slang, adds dramatic pauses for effect, and blends hospitality with seafaring charm to keep the experience fun and immersive.`;

function ttsEnhanceEndpoints(app) {
  if (!app) return;

  app.post(
    "/tts/enhance-instructions",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const { instructions } = request.body;
        if (!instructions || typeof instructions !== 'string') {
          return response.status(400).json({ message: "Invalid instructions provided." });
        }

        // Retrieve enhancer LLM settings from SystemSettings
        const sysSettings = await SystemSettings.currentSettings();
        const enhanceProvider = sysSettings.TtsEnhanceProvider || sysSettings.LLMProvider; // Fallback to main LLM
        const enhanceModel = sysSettings.TtsEnhanceModelPref || sysSettings.OpenAiModelPref; // Fallback to main model

        if (!enhanceProvider || !enhanceModel) {
            return response.status(400).json({ message: "TTS Enhancement LLM provider or model not configured." });
        }

        console.log(`Enhancing TTS instructions using ${enhanceProvider} - ${enhanceModel}`);

        // Get the LLM instance based on the configured provider
        // We pass null for workspace and user as this is a system-level function
        const LLM = getLLMProvider({ provider: enhanceProvider }, null, null, true); // Force system LLM settings

        // Add debugging logs
        console.log(`[Enhance Debug] Enhance Provider used: ${enhanceProvider}`);
        console.log(`[Enhance Debug] LLM object type: ${typeof LLM}`);
        console.log(`[Enhance Debug] LLM object keys: ${LLM ? Object.keys(LLM) : 'LLM is null/undefined'}`);
        console.log(`[Enhance Debug] Does LLM have chat method? ${LLM && typeof LLM.chat === 'function'}`);

        if (!LLM) {
          console.error(`[Enhance Error] Failed to initialize LLM provider: ${enhanceProvider}`);
          return response.status(500).json({ message: "Failed to initialize TTS Enhancement LLM." });
        }

        // Prepare the prompt for the LLM
        const messages = [
          { role: "system", content: ENHANCER_SYSTEM_PROMPT },
          { role: "user", content: instructions },
        ];

        // Call the LLM using the standardized getChatCompletion method
        // TODO: Refine options like temperature, max_tokens if needed
        // The getChatCompletion function expects { messages, ...options }
        const result = await LLM.getChatCompletion(messages, { 
          temperature: 0.7, 
          model: enhanceModel, 
          // Add max_tokens if needed, check provider specifics
          // max_tokens: 500 
        });

        if (!result || !result.textResponse) { // Check for textResponse property
            console.error("[Enhance Error] LLM failed to enhance instructions or returned empty response.", result);
            return response.status(500).json({ message: "LLM failed to enhance instructions." });
        }

        return response.status(200).json({ enhancedInstructions: result.textResponse }); // Use textResponse

      } catch (error) {
        console.error("Error enhancing TTS instructions:", error);
        return response.status(500).json({ message: `Failed to enhance instructions: ${error.message}` });
      }
    }
  );
}

module.exports = { ttsEnhanceEndpoints }; 