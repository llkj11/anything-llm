import { useState } from "react";

function toProperCase(string) {
  return string.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export default function OpenAiOptions({ settings, workspace }) {
  const apiKey = workspace?.ttsOpenAiKey || settings?.TTSOpenAIKey;
  const [selectedModel, setSelectedModel] = useState(
    workspace?.ttsOpenAiModel || settings?.TTSOpenAIModel || "tts-1"
  );
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
            name="ttsOpenAiKey"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="OpenAI API Key"
            defaultValue={apiKey ? "*".repeat(20) : ""}
            required={false}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            Voice Model
          </label>
          <select
            name="ttsOpenAiVoiceModel"
            defaultValue={workspace?.ttsOpenAiVoiceModel || settings?.TTSOpenAIVoiceModel || "alloy"}
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
            name="ttsOpenAiModel"
            defaultValue={workspace?.ttsOpenAiModel || settings?.TTSOpenAIModel || "tts-1"}
            className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="tts-1">TTS-1</option>
            <option value="tts-1-hd">TTS-1-HD</option>
            <option value="gpt-4o-mini-tts">GPT-4o mini TTS</option>
          </select>
        </div>
      </div>
      {showInstructions && (
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center mb-2">
            <label className="text-white text-sm font-semibold">
              Voice Instructions
            </label>
            <div
              className="cursor-pointer text-xs underline text-white/60 hover:text-white"
              onClick={() => setInstructionsExpanded(!instructionsExpanded)}
            >
              {instructionsExpanded ? "Collapse" : "Expand"}
            </div>
          </div>
          <textarea
            name="ttsOpenAiInstructions"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5 min-h-[80px]"
            placeholder="You are a friendly and helpful assistant..."
            defaultValue={workspace?.ttsOpenAiInstructions || settings?.TTSOpenAIInstructions || ""}
            rows={instructionsExpanded ? 10 : 3}
            required={false}
            autoComplete="off"
            spellCheck={false}
          />
          <p className="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
            Provide a detailed description of how the voice should sound, including accent, tone, personality, etc. for GPT-4o mini TTS.
          </p>
        </div>
      )}
    </div>
  );
} 