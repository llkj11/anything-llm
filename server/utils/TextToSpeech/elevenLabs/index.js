const { ElevenLabsClient, stream } = require("elevenlabs");

class ElevenLabsTTS {
  constructor(workspace = null) {
    // Use workspace-specific settings if available, otherwise use global settings
    const apiKey = workspace?.ttsElevenLabsKey || process.env.TTS_ELEVEN_LABS_KEY;
    if (!apiKey) throw new Error("No ElevenLabs API key was set.");
    
    this.elevenLabs = new ElevenLabsClient({
      apiKey: apiKey,
    });

    // Rachel as default voice if not specified
    // https://api.elevenlabs.io/v1/voices
    this.voiceId = workspace?.ttsElevenLabsVoiceModel || 
                  process.env.TTS_ELEVEN_LABS_VOICE_MODEL || 
                  "21m00Tcm4TlvDq8ikWAM";
    this.modelId = process.env.TTS_ELEVEN_LABS_MODEL || "eleven_multilingual_v2";
  }

  static async voices(apiKey = null) {
    try {
      const client = new ElevenLabsClient({
        apiKey: apiKey ?? process.env.TTS_ELEVEN_LABS_KEY ?? null,
      });
      return (await client.voices.getAll())?.voices ?? [];
    } catch {}
    return [];
  }

  #stream2buffer(stream) {
    return new Promise((resolve, reject) => {
      const _buf = [];
      stream.on("data", (chunk) => _buf.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(_buf)));
      stream.on("error", (err) => reject(err));
    });
  }

  async ttsBuffer(textInput) {
    try {
      const audio = await this.elevenLabs.generate({
        voice: this.voiceId,
        text: textInput,
        model_id: this.modelId,
      });
      return Buffer.from(await this.#stream2buffer(audio));
    } catch (e) {
      console.error(e);
    }
    return null;
  }
}

module.exports = {
  ElevenLabsTTS,
};
