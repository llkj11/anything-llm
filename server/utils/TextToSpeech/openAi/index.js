const { OpenAI } = require("openai");

class OpenAiTTS {
  constructor(workspace = null) {
    // Use workspace-specific settings if available, otherwise use global settings
    const apiKey = workspace?.ttsOpenAiKey || process.env.TTS_OPEN_AI_KEY;
    if (!apiKey) throw new Error("No OpenAI API key was set.");
    
    this.openai = new OpenAI({
      apiKey,
    });
    
    // Use workspace-specific settings if available, otherwise use global settings
    this.voice = workspace?.ttsOpenAiVoiceModel || process.env.TTS_OPEN_AI_VOICE_MODEL || "alloy";
    this.model = workspace?.ttsOpenAiModel || process.env.TTS_OPEN_AI_MODEL || "tts-1";
    this.instructions = workspace?.ttsOpenAiInstructions || process.env.TTS_OPEN_AI_INSTRUCTIONS || null;
  }

  /**
   * Generates a buffer from the given text input using OpenAI TTS.
   * @param {string} textInput - The text to be converted to audio.
   * @returns {Promise<Buffer>} A buffer containing the audio data.
   */
  async ttsBuffer(textInput) {
    try {
      const options = {
        model: this.model,
        voice: this.voice,
        input: textInput,
      };

      // Only add instructions for the GPT-4o mini TTS model
      if (this.model === "gpt-4o-mini-tts" && this.instructions) {
        options.instructions = this.instructions;
      }

      const mp3 = await this.openai.audio.speech.create(options);
      return Buffer.from(await mp3.arrayBuffer());
    } catch (e) {
      console.error(e);
    }
    return null;
  }
}

module.exports = {
  OpenAiTTS,
};
