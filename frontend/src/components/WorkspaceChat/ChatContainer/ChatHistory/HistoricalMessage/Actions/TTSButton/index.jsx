import { useEffect, useState } from "react";
import NativeTTSMessage from "./native";
import AsyncTTSMessage from "./asyncTts";
import PiperTTSMessage from "./piperTTS";
import System from "@/models/system";
import Workspace from "@/models/workspace";

export default function TTSMessage({ slug, chatId, message }) {
  const [settings, setSettings] = useState({});
  const [workspace, setWorkspace] = useState(null);
  const [provider, setProvider] = useState("native");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSettings() {
      const _settings = await System.keys();
      const _workspace = await Workspace.bySlug(slug);
      
      // Use workspace-specific TTS provider if available, otherwise use system default
      const ttsProvider = _workspace?.ttsProvider || _settings?.TextToSpeechProvider || "native";
      
      setProvider(ttsProvider);
      setSettings(_settings);
      setWorkspace(_workspace);
      setLoading(false);
    }
    getSettings();
  }, [slug]);

  if (!chatId || loading) return null;

  switch (provider) {
    case "openai":
    case "generic-openai":
    case "elevenlabs":
      return <AsyncTTSMessage slug={slug} chatId={chatId} />;
    case "piper_local":
      // For Piper TTS, use workspace-specific voice model if available
      return (
        <PiperTTSMessage
          voiceId={workspace?.ttsPiperTTSModel || settings?.TTSPiperTTSVoiceModel}
          message={message}
        />
      );
    default:
      return <NativeTTSMessage message={message} />;
  }
}
