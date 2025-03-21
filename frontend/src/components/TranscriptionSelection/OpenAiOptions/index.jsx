import { useState, useEffect } from "react";

// Define available OpenAI transcription models
const OPENAI_TRANSCRIPTION_MODELS = [
  { value: "whisper-1", label: "Whisper Large", description: "Original Whisper large model" },
  { value: "gpt-4o-transcribe", label: "GPT-4o Transcribe", description: "GPT-4o transcription model" },
  { value: "gpt-4o-mini-transcribe", label: "GPT-4o Mini Transcribe", description: "Smaller, more efficient GPT-4o transcription model" },
];

export default function OpenAiWhisperOptions({ settings }) {
  // Try to get API key from either version of the key name
  const apiKey = settings?.OpenAiKey || settings?.openAiKey || "";
  const [inputValue, setInputValue] = useState(apiKey);
  const [_openAIKey, setOpenAIKey] = useState(apiKey);
  const [model, setModel] = useState(settings?.WhisperModelPref || "whisper-1");

  useEffect(() => {
    console.log("OpenAI Whisper model selected:", model);
  }, [model]);

  return (
    <div className="flex flex-col gap-4 mt-1.5">
      <div className="flex flex-col w-full max-w-[640px]">
        <label className="text-white text-sm font-semibold block mb-3">
          API Key
        </label>
        <input
          type="password"
          name="OpenAiKey"
          className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="OpenAI API Key"
          defaultValue={apiKey ? "*".repeat(20) : ""}
          required={true}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => setOpenAIKey(inputValue)}
        />
        {/* Add a hidden field for the lowercase version */}
        <input type="hidden" name="openAiKey" value={inputValue} />
      </div>
      <div className="flex flex-col w-full max-w-[640px]">
        <label className="text-white text-sm font-semibold block mb-3">
          Transcription Model
        </label>
        <select
          name="WhisperModelPref"
          value={model}
          onChange={(e) => {
            const selectedValue = e.target.value;
            console.log("Changing model to:", selectedValue);
            setModel(selectedValue);
          }}
          className="border-none flex-shrink-0 bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          {OPENAI_TRANSCRIPTION_MODELS.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
        <div className="text-xs text-white/60 mt-2">
          {OPENAI_TRANSCRIPTION_MODELS.find(m => m.value === model)?.description}
        </div>
      </div>
    </div>
  );
}
