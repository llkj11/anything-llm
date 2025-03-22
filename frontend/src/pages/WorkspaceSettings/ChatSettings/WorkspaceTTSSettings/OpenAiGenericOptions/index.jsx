import React from "react";

export default function OpenAiGenericOptions({ settings, workspace }) {
  return (
    <div className="w-full flex flex-col gap-y-7">
      <div className="flex gap-x-4">
        <div className="flex flex-col w-60">
          <div className="flex justify-between items-center mb-2">
            <label className="text-white text-sm font-semibold">Base URL</label>
          </div>
          <input
            type="url"
            name="ttsOpenAiCompatibleEndpoint"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="http://localhost:7851/v1"
            defaultValue={workspace?.ttsOpenAiCompatibleEndpoint || settings?.TTSOpenAICompatibleEndpoint}
            required={false}
            autoComplete="off"
            spellCheck={false}
          />
          <p className="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
            This should be the base URL of the OpenAI compatible TTS service you
            will generate TTS responses from.
          </p>
        </div>
      </div>
      <div className="flex gap-x-4">
        <div className="flex flex-col w-60">
          <div className="flex justify-between items-center mb-2">
            <label className="text-white text-sm font-semibold">API Key</label>
          </div>
          <input
            type="password"
            name="ttsOpenAiCompatibleKey"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="OpenAI compatible API Key"
            defaultValue={workspace?.ttsOpenAiCompatibleKey || settings?.TTSOpenAICompatibleKey ? "*".repeat(20) : ""}
            required={false}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
      <div className="flex gap-x-4">
        <div className="flex flex-col w-60">
          <div className="flex justify-between items-center mb-2">
            <label className="text-white text-sm font-semibold">Voice</label>
          </div>
          <input
            type="text"
            name="ttsOpenAiCompatibleVoiceModel"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="Enter voice ID (e.g. alloy)"
            defaultValue={workspace?.ttsOpenAiCompatibleVoiceModel || settings?.TTSOpenAICompatibleVoiceModel || "alloy"}
            required={false}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
} 