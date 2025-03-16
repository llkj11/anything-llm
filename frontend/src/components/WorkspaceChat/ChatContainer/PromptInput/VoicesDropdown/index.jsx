import React, { useState, useEffect } from "react";
import { SpeakerHigh } from "@phosphor-icons/react";
import { Tooltip } from "react-tooltip";
import System from "@/models/system";
import { useTranslation } from "react-i18next";

export default function VoicesDropdown({ selectedVoice, onSelectVoice, apiKey }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [groupedVoices, setGroupedVoices] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");

  useEffect(() => {
    async function fetchVoices() {
      setLoading(true);
      const { models } = await System.customModels(
        "elevenlabs-tts",
        typeof apiKey === "boolean" ? null : apiKey
      );

      if (models?.length > 0) {
        const voicesByOrganization = models.reduce((acc, model) => {
          acc[model.organization] = acc[model.organization] || [];
          acc[model.organization].push(model);
          return acc;
        }, {});
        setGroupedVoices(voicesByOrganization);

        // Find the name of the currently selected voice
        for (const org in voicesByOrganization) {
          const voice = voicesByOrganization[org].find(v => v.id === selectedVoice);
          if (voice) {
            setSelectedVoiceName(voice.name);
            break;
          }
        }

        // If no voice is selected yet, use the first one
        if (!selectedVoice && Object.keys(voicesByOrganization).length > 0) {
          const firstOrg = Object.keys(voicesByOrganization)[0];
          const firstVoice = voicesByOrganization[firstOrg][0];
          onSelectVoice(firstVoice.id);
          setSelectedVoiceName(firstVoice.name);
        }
      }

      setLoading(false);
    }
    fetchVoices();
  }, [apiKey, selectedVoice]);

  function handleVoiceSelect(voiceId, voiceName) {
    onSelectVoice(voiceId);
    setSelectedVoiceName(voiceName);
    setIsOpen(false);
  }

  if (loading) {
    return (
      <div
        id="voice-dropdown-btn"
        data-tooltip-id="tooltip-voice-dropdown-btn"
        data-tooltip-content={t("chat_window.loading_voices")}
        aria-label={t("chat_window.loading_voices")}
        className="border-none relative flex justify-center items-center opacity-60 cursor-not-allowed"
      >
        <SpeakerHigh
          weight="fill"
          color="var(--theme-sidebar-footer-icon-fill)"
          className="w-[22px] h-[22px] pointer-events-none text-theme-text-primary"
        />
        <Tooltip
          id="tooltip-voice-dropdown-btn"
          place="top"
          delayShow={300}
          className="tooltip !text-xs z-99"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        id="voice-dropdown-btn"
        data-tooltip-id="tooltip-voice-dropdown-btn"
        data-tooltip-content={t("chat_window.select_voice")}
        aria-label={t("chat_window.select_voice")}
        onClick={() => setIsOpen(!isOpen)}
        className="border-none relative flex justify-center items-center opacity-60 hover:opacity-100 light:opacity-100 light:hover:opacity-60 cursor-pointer"
      >
        <SpeakerHigh
          weight="fill"
          color="var(--theme-sidebar-footer-icon-fill)"
          className="w-[22px] h-[22px] pointer-events-none text-theme-text-primary"
        />
        <Tooltip
          id="tooltip-voice-dropdown-btn"
          place="top"
          delayShow={300}
          className="tooltip !text-xs z-99"
        />
      </div>

      {isOpen && (
        <div className="absolute bottom-[40px] left-0 bg-theme-bg-chat-input light:bg-white rounded-lg shadow-lg p-2 min-w-[200px] max-h-[300px] overflow-y-auto z-50">
          <div className="text-white text-xs font-semibold mb-2 px-2">
            {selectedVoiceName ? `Current: ${selectedVoiceName}` : "Select Voice"}
          </div>
          <div className="border-b border-theme-chat-input-border mb-2"></div>
          {Object.keys(groupedVoices).sort().map((organization) => (
            <div key={organization} className="mb-2">
              <div className="text-white text-xs font-semibold px-2 py-1 opacity-70">
                {organization}
              </div>
              {groupedVoices[organization].map((voice) => (
                <div
                  key={voice.id}
                  className={`px-2 py-1 text-white text-sm rounded hover:bg-theme-bg-secondary cursor-pointer ${
                    voice.id === selectedVoice ? "bg-theme-bg-secondary" : ""
                  }`}
                  onClick={() => handleVoiceSelect(voice.id, voice.name)}
                >
                  {voice.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}