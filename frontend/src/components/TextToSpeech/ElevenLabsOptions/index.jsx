import { useState, useEffect } from "react";
import System from "@/models/system";

export default function ElevenLabsOptions({ settings }) {
  const [inputValue, setInputValue] = useState(settings?.TTSElevenLabsKey);
  const [elevenLabsKey, setElevenLabsKey] = useState(
    settings?.TTSElevenLabsKey
  );

  return (
    <div className="flex gap-x-4">
      <div className="flex flex-col w-60">
        <label className="text-white text-sm font-semibold block mb-3">
          API Key
        </label>
        <input
          type="password"
          name="TTSElevenLabsKey"
          className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="ElevenLabs API Key"
          defaultValue={settings?.TTSElevenLabsKey ? "*".repeat(20) : ""}
          required={true}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => setElevenLabsKey(inputValue)}
        />
      </div>
      {!settings?.credentialsOnly && (
        <>
          <div className="flex flex-col w-60">
            <label className="text-white text-sm font-semibold block mb-3">
              Models
            </label>
            <select
              name="TTSElevenLabsModel"
              required={true}
              className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
              defaultValue={settings?.TTSElevenLabsModel || "eleven_multilingual_v2"}
            >
              <option value="eleven_multilingual_v2">
                Multilingual v2 (High Quality)
              </option>
              <option value="eleven_flash_v2_5">
                Flash v2.5 (Fast, Low Latency)
              </option>
            </select>
          </div>
          <ElevenLabsModelSelection settings={settings} apiKey={elevenLabsKey} />
        </>
      )}
    </div>
  );
}

function ElevenLabsModelSelection({ apiKey, settings }) {
  const [groupedModels, setGroupedModels] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function findCustomModels() {
      setLoading(true);
      const { models } = await System.customModels(
        "elevenlabs-tts",
        typeof apiKey === "boolean" ? null : apiKey
      );

      if (models?.length > 0) {
        const modelsByOrganization = models.reduce((acc, model) => {
          acc[model.organization] = acc[model.organization] || [];
          acc[model.organization].push(model);
          return acc;
        }, {});
        setGroupedModels(modelsByOrganization);
      }

      setLoading(false);
    }
    findCustomModels();
  }, [apiKey]);

  if (loading) {
    return (
      <div className="flex flex-col w-60">
        <label className="text-white text-sm font-semibold block mb-3">
          Voice Selection
        </label>
        <select
          name="TTSElevenLabsVoiceModel"
          disabled={true}
          className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled={true} selected={true}>
            -- loading available models --
          </option>
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-60">
      <label className="text-white text-sm font-semibold block mb-3">
        Voice Selection
      </label>
      <select
        name="TTSElevenLabsVoiceModel"
        required={true}
        className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        {Object.keys(groupedModels)
          .sort()
          .map((organization) => (
            <optgroup key={organization} label={organization}>
              {groupedModels[organization].map((model) => (
                <option
                  key={model.id}
                  value={model.id}
                  selected={model.id === settings?.TTSElevenLabsVoiceModel}
                >
                  {model.name}
                </option>
              ))}
            </optgroup>
          ))}
      </select>
    </div>
  );
}
