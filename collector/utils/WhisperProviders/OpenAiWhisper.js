const fs = require("fs");

class OpenAiWhisper {
  constructor({ options }) {
    const { OpenAI: OpenAIApi } = require("openai");
    if (!options.openAiKey) throw new Error("No OpenAI API key was set.");

    this.openai = new OpenAIApi({
      apiKey: options.openAiKey,
    });
    
    // Set the model with fallback to whisper-1
    this.model = options.WhisperModelPref || "whisper-1";
    this.temperature = 0;
    this.#log(`Initialized with model: ${this.model}`);
  }

  #log(text, ...args) {
    console.log(`\x1b[32m[OpenAiWhisper]\x1b[0m ${text}`, ...args);
  }

  async processFile(fullFilePath) {
    this.#log(`Processing file with model: ${this.model}`);
    
    return await this.openai.audio.transcriptions
      .create({
        file: fs.createReadStream(fullFilePath),
        model: this.model,
        temperature: this.temperature,
      })
      .then((response) => {
        if (!response) {
          return {
            content: "",
            error: "No content was able to be transcribed.",
          };
        }

        return { content: response.text, error: null };
      })
      .catch((error) => {
        this.#log(
          `Could not get any response from OpenAI: ${error.message}`
        );
        return { content: "", error: error.message };
      });
  }
}

module.exports = {
  OpenAiWhisper,
};
