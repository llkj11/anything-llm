const { OpenAI } = require("openai");

class OpenAiTTS {
  constructor(workspace = null) {
    // Use workspace-specific settings if available, otherwise use global settings
    const apiKey = workspace?.ttsOpenAiKey || process.env.TTS_OPEN_AI_KEY;
    // Added logging for constructor initialization
    console.log('OpenAiTTS Constructor - Initializing with workspace:', workspace ? Object.keys(workspace).filter(k => k.startsWith('tts') || k === 'id' || k === 'name') : 'null');
    console.log(`OpenAiTTS Constructor - Resolved API Key: ${apiKey ? '***' : 'Not Found'}`);
    if (!apiKey) throw new Error("No OpenAI API key was set.");
    
    this.openai = new OpenAI({
      apiKey,
    });
    
    // Use workspace-specific settings if available, otherwise use global settings
    this.voice = workspace?.ttsOpenAiVoiceModel || process.env.TTS_OPEN_AI_VOICE_MODEL || "alloy";
    this.model = workspace?.ttsOpenAiModel || process.env.TTS_OPEN_AI_MODEL || "tts-1";
    this.instructions = workspace?.ttsOpenAiInstructions || process.env.TTS_OPEN_AI_INSTRUCTIONS || null;
    // Added logging for final values
    console.log(`OpenAiTTS Constructor - Final settings: model=${this.model}, voice=${this.voice}, instructions?=${!!this.instructions}`);
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
        response_format: "mp3", // Explicitly set the format
      };

      // Only add instructions for the GPT-4o mini TTS model
      if (this.model === "gpt-4o-mini-tts" && this.instructions) {
        options.instructions = this.instructions;
      }

      console.log(`Generating OpenAI TTS with model ${this.model}, voice ${this.voice}`);
      console.log("OpenAI TTS request options:", JSON.stringify({
        ...options,
        input: options.input.length > 20 ? options.input.substring(0, 20) + "..." : options.input
      }));
      
      const response = await this.openai.audio.speech.create(options);
      
      if (!response) {
        console.error("OpenAI returned null response");
        return null;
      }
      
      console.log("OpenAI TTS response received successfully");
      
      try {
        // Convert to buffer safely
        const arrayBuffer = await response.arrayBuffer();
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          console.error("OpenAI returned empty array buffer");
          return null;
        }
        
        console.log(`Received array buffer of size: ${arrayBuffer.byteLength} bytes`);
        const buffer = Buffer.from(arrayBuffer);
        console.log(`Converted to Node.js Buffer of size: ${buffer.length} bytes`);
        
        // Validate that we have actual audio data (check for mp3 header magic bytes)
        if (buffer.length > 4) {
          const magicBytes = buffer.slice(0, 4).toString('hex');
          console.log(`First 4 bytes of audio data: ${magicBytes}`);
          // MP3 files typically start with ID3 or with sync word 0xFFF
          const validMP3Start = magicBytes.startsWith('4944') || magicBytes.startsWith('fff'); 
          if (!validMP3Start) {
            console.warn("Warning: Buffer doesn't appear to be valid MP3 data");
          }
        }
        
        return buffer;
      } catch (bufferError) {
        console.error("Error processing OpenAI audio response:", bufferError);
        return null;
      }
    } catch (e) {
      console.error("OpenAI TTS Error:", e);
      console.error(e.message);
      if (e.response) {
        console.error("OpenAI error response:", e.response.status, e.response.data);
      }
      return null;
    }
  }
}

module.exports = {
  OpenAiTTS,
};
