import { useEffect, useState, useRef } from "react";
import { SpeakerHigh, PauseCircle, CircleNotch } from "@phosphor-icons/react";
import PiperTTSClient from "@/utils/piperTTS";
import {
  THOUGHT_REGEX_COMPLETE,
  THOUGHT_REGEX_OPEN,
  THOUGHT_REGEX_CLOSE,
} from "../../../ThoughtContainer";

export default function PiperTTS({ voiceId = null, message }) {
  const playerRef = useRef(null);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);

  function stripThinkingTags(text) {
    if (!text) return "";
    
    // First try to match complete thinking sections (with open and close tags)
    if (text.match(THOUGHT_REGEX_COMPLETE)) {
      return text.replace(THOUGHT_REGEX_COMPLETE, "").trim();
    }
    
    // If there's an opening and closing tag but not in the complete pattern format
    if (text.match(THOUGHT_REGEX_OPEN) && text.match(THOUGHT_REGEX_CLOSE)) {
      const closingTag = text.match(THOUGHT_REGEX_CLOSE)[0];
      const splitMessage = text.split(closingTag);
      // Return everything after the closing tag
      return splitMessage[1]?.trim() || "";
    }
    
    // If there's just an opening tag with no closing tag, just keep everything after it
    if (text.match(THOUGHT_REGEX_OPEN)) {
      const openingTag = text.match(THOUGHT_REGEX_OPEN)[0];
      const splitMessage = text.split(openingTag);
      // Return just the original message since the thinking is incomplete
      return text;
    }
    
    return text;
  }

  async function speakMessage(e) {
    e.preventDefault();
    if (speaking) {
      playerRef?.current?.pause();
      return;
    }

    try {
      if (!audioSrc) {
        setLoading(true);
        // Filter out thinking tags before generating audio
        const filteredMessage = stripThinkingTags(message);
        const client = new PiperTTSClient({ voiceId });
        const blobUrl = await client.getAudioBlobForText(filteredMessage);
        setAudioSrc(blobUrl);
        setLoading(false);
      } else {
        playerRef.current.play();
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      setSpeaking(false);
    }
  }

  useEffect(() => {
    function setupPlayer() {
      if (!playerRef?.current) return;
      playerRef.current.addEventListener("play", () => {
        setSpeaking(true);
      });

      playerRef.current.addEventListener("pause", () => {
        playerRef.current.currentTime = 0;
        setSpeaking(false);
      });
    }
    setupPlayer();
  }, []);

  return (
    <div className="mt-3 relative">
      <button
        type="button"
        onClick={speakMessage}
        disabled={loading}
        data-tooltip-id="message-to-speech"
        data-tooltip-content={
          speaking ? "Pause TTS speech of message" : "TTS Speak message"
        }
        className="border-none text-[var(--theme-sidebar-footer-icon-fill)]"
        aria-label={speaking ? "Pause speech" : "Speak message"}
      >
        {speaking ? (
          <PauseCircle size={18} className="mb-1" />
        ) : (
          <>
            {loading ? (
              <CircleNotch size={18} className="mb-1 animate-spin" />
            ) : (
              <SpeakerHigh size={18} className="mb-1" />
            )}
          </>
        )}
        <audio
          ref={playerRef}
          hidden={true}
          src={audioSrc}
          autoPlay={true}
          controls={false}
        />
      </button>
    </div>
  );
}
