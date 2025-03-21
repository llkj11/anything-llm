import { useState } from "react";

function toProperCase(string) {
  return string.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export default function OpenAiTextToSpeechOptions({ settings }) {
  const apiKey = settings?.TTSOpenAIKey;
  const [selectedModel, setSelectedModel] = useState(settings?.TTSOpenAIModel ?? "tts-1");
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);
  const showInstructions = selectedModel === "gpt-4o-mini-tts";

  return (
    <div className="flex flex-col gap-y-4 mt-1.5">
      <div className="flex gap-[36px]">
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            API Key
          </label>
          <input
            type="password"
            name="TTSOpenAIKey"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="OpenAI API Key"
            defaultValue={apiKey ? "*".repeat(20) : ""}
            required={true}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            Voice Model
          </label>
          <select
            name="TTSOpenAIVoiceModel"
            defaultValue={settings?.TTSOpenAIVoiceModel ?? "alloy"}
            className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
          >
            {["alloy", "echo", "fable", "onyx", "nova", "shimmer", "coral"].map(
              (voice) => {
                return (
                  <option key={voice} value={voice}>
                    {toProperCase(voice)}
                  </option>
                );
              }
            )}
          </select>
        </div>
      </div>

      <div className="flex gap-[36px]">
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            TTS Model
          </label>
          <select
            name="TTSOpenAIModel"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            defaultValue={settings?.TTSOpenAIModel ?? "tts-1"}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="tts-1">TTS-1 (Standard)</option>
            <option value="tts-1-hd">TTS-1-HD (High quality)</option>
            <option value="gpt-4o-mini-tts">GPT-4o Mini TTS (Customizable)</option>
          </select>
        </div>
      </div>

      {showInstructions && (
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center mb-3">
            <label className="text-white text-sm font-semibold">
              Voice Instructions
            </label>
            <button
              type="button"
              onClick={() => setInstructionsExpanded(!instructionsExpanded)}
              className="text-xs text-white hover:text-blue-300 transition-colors"
            >
              {instructionsExpanded ? "Collapse" : "Expand"}
            </button>
          </div>
          <textarea
            name="TTSOpenAIInstructions"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="Describe how the voice should sound (e.g., You speak in a 'sing songy' voice, similar to a Disney princess...)"
            defaultValue={settings?.TTSOpenAIInstructions || ""}
            rows={instructionsExpanded ? 5 : 2}
            spellCheck={true}
          />
          <p className="text-xs text-gray-400 mt-2">
            Describe vocal qualities, style, or character persona to customize the voice. Leave empty for default tone.
          </p>
        </div>
      )}
    </div>
  );
}
