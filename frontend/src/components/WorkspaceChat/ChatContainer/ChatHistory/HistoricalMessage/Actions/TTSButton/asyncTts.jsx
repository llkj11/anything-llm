import { useState } from "react";
import { SpeakerHigh, SpeakerSlash, CircleNotch } from "@phosphor-icons/react";
import paths from "@/utils/paths";
console.log("TTS Button component loaded");

export default function AsyncTTSMessage({ slug, chatId }) {
  console.log("TTS Button component rendered with slug:", slug, "chatId:", chatId);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audio, setAudio] = useState(null);

  const loadAndPlayAudio = async () => {
    console.log("Starting TTS audio load");
    setLoading(true);
    try {
      // Try to use the workspace-specific endpoint first
      let ttsEndpoint = paths.workspace.tts(slug, chatId);
      console.log("Fetching workspace TTS endpoint:", ttsEndpoint);
      const result = await fetch(ttsEndpoint);
      console.log("Workspace TTS response status:", result.status);
      
      // If we couldn't find audio with the workspace endpoint, try the global one
      if (result.status === 404 || result.status === 204) {
        console.log("Workspace TTS not found, trying global endpoint");
        ttsEndpoint = paths.tts(chatId);
        const globalResult = await fetch(ttsEndpoint);
        console.log("Global TTS response status:", globalResult.status);
        
        if (globalResult.status === 404 || globalResult.status === 204) {
          console.log("No TTS audio available from either endpoint");
          return;
        }
        
        if (!globalResult.ok) {
          console.error("Failed to fetch global TTS audio:", globalResult.status, await globalResult.text());
          return;
        }
        
        const blob = await globalResult.blob();
        console.log("Received global TTS blob of size:", blob.size);
        playAudio(blob);
        return;
      }

      if (!result.ok) {
        console.error("Failed to fetch workspace TTS audio:", result.status, await result.text());
        return;
      }

      const blob = await result.blob();
      console.log("Received workspace TTS blob of size:", blob.size);
      playAudio(blob);
    } catch (error) {
      console.error("Error in loadAndPlayAudio:", error);
    } finally {
      console.log("Finished TTS audio load attempt");
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
    console.log("TTS button clicked", { audioPlaying, audio });
    if (audioPlaying) {
      console.log("Stopping current audio playback");
      if (audio) {
        audio.pause();
        audio.remove();
        setAudio(null);
      }
      setAudioPlaying(false);
      return;
    }

    console.log("Starting new audio playback");
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
