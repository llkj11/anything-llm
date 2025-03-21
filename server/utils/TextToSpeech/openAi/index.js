class OpenAiTTS {
  constructor() {
    if (!process.env.TTS_OPEN_AI_KEY)
      throw new Error("No OpenAI API key was set.");
    const { OpenAI: OpenAIApi } = require("openai");
    this.openai = new OpenAIApi({
      apiKey: process.env.TTS_OPEN_AI_KEY,
    });
    this.voice = process.env.TTS_OPEN_AI_VOICE_MODEL ?? "alloy";
    this.model = process.env.TTS_OPEN_AI_MODEL ?? "tts-1";
    this.instructions = process.env.TTS_OPEN_AI_INSTRUCTIONS || "";
  }

  async ttsBuffer(textInput) {
    try {
      const options = {
        model: this.model,
        voice: this.voice,
        input: textInput,
      };

      // Add instructions for GPT-4o mini TTS model if provided
      if (this.model === "gpt-4o-mini-tts" && this.instructions && this.instructions.trim().length > 0) {
        options.instructions = this.instructions;
        console.log(`[OpenAiTTS] Using voice instructions: ${this.instructions.substring(0, 50)}${this.instructions.length > 50 ? '...' : ''}`);
      }

      console.log(`[OpenAiTTS] Generating speech with model ${this.model}, voice ${this.voice}`);
      const result = await this.openai.audio.speech.create(options);
      return Buffer.from(await result.arrayBuffer());
    } catch (e) {
      console.error("[OpenAiTTS] Error generating speech:", e);
      console.error(e.message);
    }
    return null;
  }
}

module.exports = {
  OpenAiTTS,
};
