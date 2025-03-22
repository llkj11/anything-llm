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
    "/test-tts",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async function (request, response) {
      try {
        const { provider, text, ...params } = request.body;
        
        if (!provider || !text) {
          return response.status(400).json({
            message: "Missing required parameters",
          });
        }

        let ttsProvider;
        
        // Create the appropriate TTS provider based on the request
        switch (provider) {
          case "openai":
            const { key, voice, model, instructions } = params;
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

        const buffer = await ttsProvider.ttsBuffer(text);
        
        if (!buffer) {
          return response.status(500).json({
            message: "Failed to generate audio",
          });
        }

        response.writeHead(200, {
          "Content-Type": "audio/mpeg",
        });
        response.end(buffer);
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