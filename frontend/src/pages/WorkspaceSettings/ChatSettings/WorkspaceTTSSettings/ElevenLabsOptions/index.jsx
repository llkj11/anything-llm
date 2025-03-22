import { useEffect, useState } from "react";
import System from "@/models/system";

export default function ElevenLabsOptions({ settings, workspace }) {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiKey = workspace?.ttsElevenLabsKey || settings?.TTSElevenLabsKey;

  useEffect(() => {
    async function fetchVoices() {
      if (!apiKey) return setVoices([]);
      setLoading(true);
      const response = await System.elevenLabsVoices(apiKey);
      setVoices(response.voices || []);
      setLoading(false);
    }
    fetchVoices();
  }, [apiKey]);

  return (
    <div className="flex flex-col gap-y-4 mt-1.5">
      <div className="flex gap-[36px]">
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            API Key
          </label>
          <input
            type="password"
            name="ttsElevenLabsKey"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="ElevenLabs API Key"
            defaultValue={apiKey ? "*".repeat(20) : ""}
            required={false}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            Voice
          </label>
          <select
            name="ttsElevenLabsVoiceModel"
            className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
            defaultValue={workspace?.ttsElevenLabsVoiceModel || settings?.TTSElevenLabsVoiceModel || "21m00Tcm4TlvDq8ikWAM"}
            disabled={loading}
          >
            {!loading && voices.length === 0 && (
              <option value="21m00Tcm4TlvDq8ikWAM">Rachel (default)</option>
            )}
            {loading && <option value="">Loading voices...</option>}
            {!loading &&
              voices.map((voice) => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
} 