import { useState } from "react";
import { SpeakerHigh, SpeakerSlash, CircleNotch } from "@phosphor-icons/react";
import paths from "@/utils/paths";

export default function AsyncTTSMessage({ slug, chatId }) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audio, setAudio] = useState(null);

  const loadAndPlayAudio = async () => {
    setLoading(true);
    try {
      // Try to use the workspace-specific endpoint first
      let ttsEndpoint = paths.workspace.tts(slug, chatId);
      const result = await fetch(ttsEndpoint);
      
      // If we couldn't find audio with the workspace endpoint, try the global one
      if (result.status === 404 || result.status === 204) {
        ttsEndpoint = paths.tts(chatId);
        const globalResult = await fetch(ttsEndpoint);
        
        if (globalResult.status === 404 || globalResult.status === 204) {
          return; // No audio available with either endpoint
        }
        
        if (!globalResult.ok) {
          console.error("Failed to fetch TTS audio:", globalResult.status);
          return;
        }
        
        const blob = await globalResult.blob();
        playAudio(blob);
        return;
      }

      if (!result.ok) {
        console.error("Failed to fetch TTS audio:", result.status);
        return;
      }

      const blob = await result.blob();
      playAudio(blob);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (blob) => {
    if (audio) {
      audio.pause();
      audio.remove();
      setAudio(null);
    }

    const newAudio = document.createElement("audio");
    newAudio.src = URL.createObjectURL(blob);
    newAudio.addEventListener("ended", () => {
      setAudioPlaying(false);
      newAudio.remove();
      setAudio(null);
    });
    document.body.appendChild(newAudio);
    setAudio(newAudio);
    setAudioPlaying(true);
    newAudio.play();
  };

  const toggleAudio = () => {
    if (audioPlaying) {
      if (audio) {
        audio.pause();
        audio.remove();
        setAudio(null);
      }
      setAudioPlaying(false);
      return;
    }

    loadAndPlayAudio();
  };

  return (
    <button
      onClick={toggleAudio}
      disabled={loading}
      className="flex flex-col items-center justify-center rounded-md border-none h-[26px] p-1 text-white/60 hover:bg-slate-700 hover:text-white"
    >
      {loading ? (
        <CircleNotch size={16} className="animate-spin" />
      ) : audioPlaying ? (
        <SpeakerSlash size={16} />
      ) : (
        <SpeakerHigh size={16} />
      )}
    </button>
  );
}
