const { OpenAiTTS } = require("../../../utils/TextToSpeech/openAi");
const { ElevenLabsTTS } = require("../../../utils/TextToSpeech/elevenLabs");
const { GenericOpenAiTTS } = require("../../../utils/TextToSpeech/openAiGeneric");
const { validatedRequest } = require("../../../utils/middleware/validatedRequest");
const {
  ROLES,
  flexUserRoleValid,
} = require("../../../utils/middleware/multiUserProtected");

function ttsEndpoints(app) {
  if (!app) return;

  /**
   * Test TTS voice with custom settings
   * Requires user authentication
   * @param {string} provider - TTS provider name (openai, elevenlabs, generic-openai)
   * @param {Object} params - Provider-specific parameters
   * @returns {buffer} - Audio buffer
   */
  app.post(
    "/tts/test-tts",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async function (request, response) {
      try {
        console.log("Test TTS request received:", request.body);
        const { provider, text, ...params } = request.body;
        
        if (!provider || !text) {
          console.error("Missing required parameters:", { provider, text });
          return response.status(400).json({
            message: "Missing required parameters",
          });
        }

        let ttsProvider;
        
        // Create the appropriate TTS provider based on the request
        switch (provider) {
          case "openai":
            const { key, voice, model, instructions } = params;
            console.log("Creating OpenAI TTS provider with settings:", {
              key: key ? "***" : "not provided",
              voice,
              model,
              instructions: instructions ? "provided" : "not provided"
            });
            const customSettings = {
              ttsOpenAiKey: key,
              ttsOpenAiVoiceModel: voice || "alloy",
              ttsOpenAiModel: model || "tts-1",
              ttsOpenAiInstructions: instructions
            };
            ttsProvider = new OpenAiTTS(customSettings);
            break;
            
          case "elevenlabs":
            const { elevenLabsKey, elevenLabsVoiceModel } = params;
            const elevenLabsSettings = {
              ttsElevenLabsKey: elevenLabsKey,
              ttsElevenLabsVoiceModel: elevenLabsVoiceModel
            };
            ttsProvider = new ElevenLabsTTS(elevenLabsSettings);
            break;
            
          case "generic-openai":
            const { endpoint, genericKey, genericVoice } = params;
            const genericSettings = {
              ttsOpenAiCompatibleEndpoint: endpoint,
              ttsOpenAiCompatibleKey: genericKey,
              ttsOpenAiCompatibleVoiceModel: genericVoice || "alloy" 
            };
            ttsProvider = new GenericOpenAiTTS(genericSettings);
            break;
            
          default:
            return response.status(400).json({
              message: "Unsupported TTS provider",
            });
        }

        try {
          console.log("Requesting TTS buffer...");
          const buffer = await ttsProvider.ttsBuffer(text);
          
          if (!buffer || buffer.length === 0) {
            console.error("TTS provider returned empty buffer");
            return response.status(500).json({
              message: "Failed to generate audio - empty buffer received",
            });
          }
          
          console.log(`TTS buffer generated successfully: ${buffer.length} bytes`);
          
          // Send as audio file with proper MIME type
          response.setHeader("Content-Type", "audio/mpeg");
          response.setHeader("Content-Length", buffer.length);
          response.setHeader("Cache-Control", "no-cache");
          
          // Send the buffer
          return response.status(200).send(buffer);
          
        } catch (providerError) {
          console.error("TTS provider error:", providerError);
          return response.status(500).json({
            message: `TTS provider error: ${providerError.message}`,
          });
        }
      } catch (error) {
        console.error("Error testing TTS:", error);
        response.status(500).json({
          message: error.message || "Failed to test TTS",
        });
      }
    }
  );
}

module.exports = { ttsEndpoints }; 