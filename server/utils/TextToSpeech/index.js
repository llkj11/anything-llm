function getTTSProvider(workspace = null) {
  // If workspace has TTS settings, use those instead of global settings
  const provider = workspace?.ttsProvider || process.env.TTS_PROVIDER || "openai";
  
  switch (provider) {
    case "openai":
      const { OpenAiTTS } = require("./openAi");
      return new OpenAiTTS(workspace);
    case "elevenlabs":
      const { ElevenLabsTTS } = require("./elevenLabs");
      return new ElevenLabsTTS(workspace);
    case "generic-openai":
      const { GenericOpenAiTTS } = require("./openAiGeneric");
      return new GenericOpenAiTTS(workspace);
    case "piper_local":
      // Piper TTS is client-side only, but we need to handle it in case it's selected
      return { 
        ttsBuffer: () => null 
      };
    case "native":
      // Native TTS is client-side only, but we need to handle it in case it's selected
      return { 
        ttsBuffer: () => null 
      };
    default:
      throw new Error("ENV: No TTS_PROVIDER value found in environment!");
  }
}

module.exports = { getTTSProvider };
