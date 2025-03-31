import { useState, useRef } from "react";
import showToast from "@/utils/toast";
import System from "@/models/system";
import { Eye, EyeSlash, Sparkle } from "@phosphor-icons/react";

function toProperCase(string) {
  return string.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export default function OpenAiOptions({ settings, workspace, setHasChanges }) {
  const apiKey = workspace?.ttsOpenAiKey || settings?.TTSOpenAIKey;
  const [selectedModel, setSelectedModel] = useState(
    workspace?.ttsOpenAiModel || settings?.TTSOpenAIModel || "tts-1"
  );
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);
  const showInstructions = selectedModel === "gpt-4o-mini-tts";
  const [showKey, setShowKey] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const instructionsRef = useRef(null);
  
  // Track form changes
  const handleChange = () => {
    console.log("TTS options changed, updating form");
    if (setHasChanges) setHasChanges(true);
  };

  const testVoice = async () => {
    try {
      // Get form values
      const formElement = document.getElementById("chat-settings-form");
      const formData = new FormData(formElement);
      const key = formData.get("ttsOpenAiKey") || settings?.TTSOpenAIKey;
      const voice = formData.get("ttsOpenAiVoiceModel") || "alloy";
      const model = formData.get("ttsOpenAiModel") || "tts-1";
      const instructions = model === "gpt-4o-mini-tts" ? 
        (formData.get("ttsOpenAiInstructions") || "") : "";
      
      if (!key) {
        showToast("Please provide an OpenAI API key", "warning");
        return;
      }
      
      // Set loading state
      const button = document.getElementById("test-voice-button");
      if (button) {
        button.disabled = true;
        button.textContent = "Loading...";
      }
      
      // Create a unique audio tag ID to avoid conflicts
      const audioElementId = `audio-test-${Date.now()}`;
      
      // Add a temporary audio element to the DOM that we can control
      const audioContainer = document.createElement('div');
      audioContainer.innerHTML = `<audio id="${audioElementId}" controls style="display: none;"></audio>`;
      document.body.appendChild(audioContainer);
      
      try {
        console.log("Starting TTS test request with params:", { provider: "openai", voice, model });
        
        // Make a direct fetch request to our API endpoint instead of using the System utility
        const response = await fetch('/api/tts/test-tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-anythingllm-auth': localStorage.getItem('authToken') || '',
          },
          body: JSON.stringify({
            provider: "openai",
            key,
            voice,
            model,
            instructions,
            text: "This is a test of the text to speech feature. How does this sound?"
          }),
        });
        const contentType = response.headers.get("Content-Type");
        if (!contentType || !contentType.includes("audio")) {
          const errorText = await response.text();
          throw new Error(`Expected audio response, got ${contentType}: ${errorText}`);
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("TTS test request failed:", response.status, errorText);
          throw new Error(`Failed to generate TTS: ${errorText}`);
        }
        
        // Get the audio as a blob directly from the response
        const audioBlob = await response.blob();
        console.log("Response received. Blob size:", audioBlob.size, "Blob type:", audioBlob.type);
        
        if (audioBlob.size === 0) {
          throw new Error("Received empty audio data");
        }
        
        // Create a valid audio blob with the correct type
        const validAudioBlob = new Blob([audioBlob], { type: 'audio/mpeg' });
        
        // Create an audio element and play it
        const audioElement = document.getElementById(audioElementId);
        const audioUrl = URL.createObjectURL(validAudioBlob);
        
        // Log what we're trying to play
        console.log("Created audio URL:", audioUrl);
        
        // Set up event handlers
        audioElement.onerror = (e) => {
          console.error("Audio element error:", e, "CurrentSrc:", audioElement.currentSrc);
          showToast(`Audio playback error: ${e.target.error?.message || 'Unknown error'}. Source: ${audioElement.currentSrc}`, "error");
          resetButton();
        };
        
        audioElement.oncanplaythrough = () => {
          console.log("Audio ready to play");
          audioElement.play().catch(e => {
            console.error("Play error:", e);
            showToast(`Couldn't play audio: ${e.message}`, "error");
            resetButton();
          });
        };
        
        audioElement.onended = () => {
          console.log("Audio playback finished");
          resetButton();
          // Clean up
          setTimeout(() => {
            audioContainer.remove();
          }, 1000);
        };
        
        // Set the source and load the audio
        audioElement.src = audioUrl;
        audioElement.load();
        
        // If we don't get a canplaythrough event within 5 seconds, try to play anyway
        setTimeout(() => {
          if (audioElement && audioElement.paused) {
            console.log("Forcing play attempt after timeout");
            audioElement.play().catch(e => {
              console.error("Forced play error:", e);
              showToast(`Couldn't play audio: ${e.message}`, "error");
              resetButton();
            });
          }
        }, 5000);
        
      } catch (err) {
        console.error("Error in TTS test:", err);
        showToast(`Error: ${err.message}`, "error");
        resetButton();
        // Clean up
        audioContainer.remove();
      }
      
      function resetButton() {
        const button = document.getElementById("test-voice-button");
        if (button) {
          button.disabled = false;
          button.textContent = "Test Voice";
        }
      }
      
    } catch (error) {
      console.error("Top-level error in testVoice:", error);
      showToast(`Error: ${error.message}`, "error");
      
      // Reset button state
      const button = document.getElementById("test-voice-button");
      if (button) {
        button.disabled = false;
        button.textContent = "Test Voice";
      }
    }
  };

  const enhanceInstructions = async () => {
    if (!instructionsRef.current) return;
    const currentInstructions = instructionsRef.current.value;
    if (!currentInstructions) {
      showToast("Please provide some initial instructions to enhance.", "warning");
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch("/api/tts/enhance-instructions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-anythingllm-auth": localStorage.getItem("authToken") || "",
        },
        body: JSON.stringify({ instructions: currentInstructions }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.enhancedInstructions && instructionsRef.current) {
        instructionsRef.current.value = result.enhancedInstructions;
        showToast("Instructions enhanced successfully!", "success");
        if (setHasChanges) setHasChanges(true);
      } else {
        throw new Error("Failed to get enhanced instructions from response.");
      }
    } catch (error) {
      console.error("Error enhancing TTS instructions:", error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-4 mt-1.5">
      <div className="flex gap-[36px]">
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            API Key
          </label>
          <div className="relative w-full">
            <input
              type={showKey ? "text" : "password"}
              name="ttsOpenAiKey"
              className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5 pr-10"
              placeholder="OpenAI API Key"
              defaultValue={apiKey}
              required={false}
              autoComplete="off"
              spellCheck={false}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200"
            >
              {showKey ? (
                <EyeSlash size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            Voice Model
          </label>
          <select
            name="ttsOpenAiVoiceModel"
            defaultValue={workspace?.ttsOpenAiVoiceModel || settings?.TTSOpenAIVoiceModel || "alloy"}
            className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
            onChange={handleChange}
          >
            {["alloy", "echo", "fable", "onyx", "nova", "shimmer", "coral"].map(
              (voice) => {
                return (
                  <option key={voice} value={voice}>
                    {toProperCase(voice)}
                  </option>
                );
              }
            )}
          </select>
        </div>
      </div>
      <div className="flex gap-[36px]">
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-3">
            TTS Model
          </label>
          <select
            name="ttsOpenAiModel"
            defaultValue={workspace?.ttsOpenAiModel || settings?.TTSOpenAIModel || "tts-1"}
            className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
            onChange={(e) => {
              setSelectedModel(e.target.value);
              handleChange();
            }}
          >
            <option value="tts-1">TTS-1</option>
            <option value="tts-1-hd">TTS-1-HD</option>
            <option value="gpt-4o-mini-tts">GPT-4o mini TTS</option>
          </select>
        </div>
        <div className="flex flex-col items-end justify-end">
          <button
            type="button"
            id="test-voice-button"
            onClick={testVoice}
            className="bg-primary-button hover:bg-primary-button-hover text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Test Voice
          </button>
        </div>
      </div>
      {showInstructions && (
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center mb-2">
            <label className="text-white text-sm font-semibold">
              Voice Instructions
            </label>
            <div
              className="cursor-pointer text-xs underline text-white/60 hover:text-white"
              onClick={() => setInstructionsExpanded(!instructionsExpanded)}
            >
              {instructionsExpanded ? "Collapse" : "Expand"}
            </div>
          </div>
          <textarea
            name="ttsOpenAiInstructions"
            className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5 min-h-[80px]"
            placeholder="You are a friendly and helpful assistant..."
            defaultValue={workspace?.ttsOpenAiInstructions || settings?.TTSOpenAIInstructions || ""}
            rows={instructionsExpanded ? 10 : 3}
            required={false}
            autoComplete="off"
            spellCheck={false}
            onChange={handleChange}
            ref={instructionsRef}
          />
          <p className="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
            Provide a detailed description of how the voice should sound, including accent, tone, personality, etc. for GPT-4o mini TTS.
          </p>
          <button
            type="button"
            disabled={isEnhancing}
            onClick={enhanceInstructions}
            className="mt-2 w-fit bg-secondary-button hover:bg-secondary-button-hover text-white font-bold py-1 px-3 rounded text-sm inline-flex items-center gap-x-1 transition-colors disabled:opacity-50"
          >
            {isEnhancing ? (
              <>
                <Sparkle className="animate-pulse" size={16} /> Enhancing...
              </>
            ) : (
              <>
                <Sparkle size={16} /> Enhance Instructions
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
} 