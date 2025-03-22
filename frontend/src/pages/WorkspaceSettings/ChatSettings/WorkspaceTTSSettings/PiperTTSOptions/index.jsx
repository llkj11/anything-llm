import { useState, useEffect, useRef } from "react";
import PiperTTSClient from "@/utils/piperTTS";
import { titleCase } from "text-case";
import { humanFileSize } from "@/utils/numbers";

export default function PiperTTSOptions({ settings, workspace }) {
  return (
    <>
      <p className="text-sm font-base text-white text-opacity-60 mb-4">
        All PiperTTS models will run in your browser locally. This can be
        resource intensive on lower-end devices.
      </p>
      <div className="flex gap-x-4 items-center">
        <PiperTTSModelSelection settings={settings} workspace={workspace} />
      </div>
    </>
  );
}

function voicesByLanguage(voices = []) {
  const voicesByLanguage = voices.reduce((acc, voice) => {
    const langName = voice?.language?.name_english ?? "Unlisted";
    acc[langName] = acc[langName] || [];
    acc[langName].push(voice);
    return acc;
  }, {});
  return Object.entries(voicesByLanguage);
}

function voiceDisplayName(voice) {
  const { is_stored, name, quality, files } = voice;
  const onnxFileKey = Object.keys(files).find((key) => key.endsWith(".onnx"));
  const fileSize = files?.[onnxFileKey]?.size_bytes || 0;
  return `${is_stored ? "✔ " : ""}${titleCase(name)}-${quality === "low" ? "Low" : "HQ"} (${humanFileSize(fileSize)})`;
}

function PiperTTSModelSelection({ settings, workspace }) {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voicesByLang, setVoicesByLang] = useState([]);
  const client = useRef(null);

  useEffect(() => {
    async function fetchVoices() {
      try {
        client.current = PiperTTSClient.get();
        const allVoices = await client.current.getVoices();
        if (!allVoices) return;
        
        setVoices(allVoices);
        setVoicesByLang(voicesByLanguage(allVoices));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchVoices();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col w-60">
        <label className="text-white text-sm font-semibold block mb-3">
          Voice Model
        </label>
        <select
          disabled={true}
          className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option>Loading voice models...</option>
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-60">
      <label className="text-white text-sm font-semibold block mb-3">
        Voice Model
      </label>
      <select
        name="ttsPiperTTSModel"
        defaultValue={workspace?.ttsPiperTTSModel || settings?.TTSPiperTTSVoiceModel || ""}
        className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        <option value="">Select a voice model</option>
        {voicesByLang.map(([language, voices]) => (
          <optgroup key={language} label={language}>
            {voices.map((voice) => (
              <option key={voice.key} value={voice.key}>
                {voiceDisplayName(voice)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
} 