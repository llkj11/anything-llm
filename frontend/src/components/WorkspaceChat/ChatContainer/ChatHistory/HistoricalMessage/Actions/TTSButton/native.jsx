import React, { useEffect, useState } from "react";
import { SpeakerHigh, PauseCircle } from "@phosphor-icons/react";
import {
  THOUGHT_REGEX_COMPLETE,
  THOUGHT_REGEX_OPEN,
  THOUGHT_REGEX_CLOSE,
} from "../../../ThoughtContainer";

export default function NativeTTSMessage({ message }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported("speechSynthesis" in window);
  }, []);

  function endSpeechUtterance() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    return;
  }

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

  function speakMessage() {
    // if the user is pausing this particular message
    // while the synth is speaking we can end it.
    // If they are clicking another message's TTS
    // we need to ignore that until they pause the one that is playing.
    if (window.speechSynthesis.speaking && speaking) {
      endSpeechUtterance();
      return;
    }

    if (window.speechSynthesis.speaking && !speaking) return;
    // Remove thinking tags before speaking
    const filteredMessage = stripThinkingTags(message);
    const utterance = new SpeechSynthesisUtterance(filteredMessage);
    utterance.addEventListener("end", endSpeechUtterance);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  if (!supported) return null;
  return (
    <div className="mt-3 relative">
      <button
        onClick={speakMessage}
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
          <SpeakerHigh size={18} className="mb-1" />
        )}
      </button>
    </div>
  );
}
