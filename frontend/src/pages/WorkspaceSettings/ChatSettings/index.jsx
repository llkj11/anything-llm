import System from "@/models/system";
import Workspace from "@/models/workspace";
import showToast from "@/utils/toast";
import { castToType } from "@/utils/types";
import { useEffect, useRef, useState } from "react";
import ChatHistorySettings from "./ChatHistorySettings";
import ChatPromptSettings from "./ChatPromptSettings";
import ChatTemperatureSettings from "./ChatTemperatureSettings";
import ChatModeSelection from "./ChatModeSelection";
import WorkspaceLLMSelection from "./WorkspaceLLMSelection";
import ChatQueryRefusalResponse from "./ChatQueryRefusalResponse";
import WorkspaceTTSSettings from "./WorkspaceTTSSettings";

export default function ChatSettings({ workspace }) {
  const [settings, setSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const formEl = useRef(null);
  useEffect(() => {
    async function fetchSettings() {
      const _settings = await System.keys();
      setSettings(_settings ?? {});
    }
    fetchSettings();
  }, []);

  const handleUpdate = async (e) => {
    setSaving(true);
    e.preventDefault();
    
    try {
      const data = {};
      const form = new FormData(formEl.current);
      
      console.log("Raw form data:", Array.from(form.entries()));
      
      // Make sure we handle all fields properly
      for (var [key, value] of form.entries()) {
        // Handle empty/special values
        if (key === 'ttsProvider' && value === '') {
          data[key] = null;
        } else if (value === '' && ['chatProvider', 'chatModel'].includes(key)) {
          // Handle empty string values for critical chat settings
          console.log(`Empty value detected for ${key}, using default value`);
          data[key] = key === 'chatProvider' ? 'default' : '';
        } else if (key === 'ttsOpenAiKey' && value.startsWith('*')) {
          // Skip masked API key if it hasn't been changed (just asterisks)
          console.log('Skipping masked API key that was not changed');
        } else {
          data[key] = castToType(key, value);
        }
      }
      
      // Ensure we have all needed TTS values
      if (data.ttsProvider === 'openai') {
        if (!data.ttsOpenAiKey && workspace?.ttsOpenAiKey) {
          // Keep the existing key if the form just shows asterisks
          data.ttsOpenAiKey = workspace.ttsOpenAiKey;
          console.log('Preserving existing API key');
        }
        
        // Ensure we have voice and model
        if (!data.ttsOpenAiVoiceModel) {
          data.ttsOpenAiVoiceModel = workspace?.ttsOpenAiVoiceModel || 'alloy';
        }
        
        if (!data.ttsOpenAiModel) {
          data.ttsOpenAiModel = workspace?.ttsOpenAiModel || 'tts-1';
        }
        
        // Handle instructions for GPT-4o
        if (data.ttsOpenAiModel === 'gpt-4o-mini-tts' && !data.ttsOpenAiInstructions && workspace?.ttsOpenAiInstructions) {
          data.ttsOpenAiInstructions = workspace.ttsOpenAiInstructions;
        }
      }
      
      // Manually check if the ttsProvider field exists and process it correctly
      if (!('ttsProvider' in data) && workspace?.ttsProvider) {
        console.log("Adding missing ttsProvider from workspace:", workspace.ttsProvider);
        data.ttsProvider = workspace.ttsProvider;
      }
      
      console.log("Processed data being sent to server:", {...data, ttsOpenAiKey: data.ttsOpenAiKey ? '***' : undefined});
      
      const { workspace: updatedWorkspace, message } = await Workspace.update(
        workspace.slug,
        data
      );
      
      if (!!updatedWorkspace) {
        console.log("Workspace updated successfully:", {
          ...updatedWorkspace,
          ttsOpenAiKey: updatedWorkspace.ttsOpenAiKey ? '***' : undefined
        });
        
        showToast("Workspace updated!", "success", { clear: true });
        
        // Reload with a clear cache to ensure fresh data
        setTimeout(() => {
          console.log("Reloading page to apply new settings");
          // Force a hard refresh to clear any caches
          window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
        }, 800);
      } else {
        console.error("Error updating workspace:", message);
        showToast(`Error: ${message}`, "error", { clear: true });
      }
    } catch (err) {
      console.error("Exception updating workspace:", err);
      showToast(`Error: ${err.message}`, "error", { clear: true });
    } finally {
      setSaving(false);
      setHasChanges(false);
    }
  };

  if (!workspace) return null;
  return (
    <div id="workspace-chat-settings-container">
      <form
        ref={formEl}
        onSubmit={handleUpdate}
        id="chat-settings-form"
        className="w-1/2 flex flex-col gap-y-6"
      >
        <WorkspaceLLMSelection
          settings={settings}
          workspace={workspace}
          setHasChanges={setHasChanges}
        />
        <ChatModeSelection
          workspace={workspace}
          setHasChanges={setHasChanges}
        />
        <ChatHistorySettings
          workspace={workspace}
          setHasChanges={setHasChanges}
        />
        <ChatPromptSettings
          workspace={workspace}
          setHasChanges={setHasChanges}
        />
        <ChatQueryRefusalResponse
          workspace={workspace}
          setHasChanges={setHasChanges}
        />
        <ChatTemperatureSettings
          settings={settings}
          workspace={workspace}
          setHasChanges={setHasChanges}
        />
        <WorkspaceTTSSettings
          settings={settings}
          workspace={workspace}
          setHasChanges={setHasChanges}
        />
        {hasChanges && (
          <button
            type="submit"
            form="chat-settings-form"
            className="w-fit transition-all duration-300 border border-slate-200 px-5 py-2.5 rounded-lg text-white text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800 focus:ring-gray-800"
          >
            {saving ? "Updating..." : "Update workspace"}
          </button>
        )}
      </form>
    </div>
  );
}
