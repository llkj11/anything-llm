import { useState, useEffect } from "react";
import System from "@/models/system";

// Renamed component for Enhancement Provider context
export default function EnhancementOpenAiOptions({ settings }) {
  // Use TtsEnhance... keys
  const [inputValue, setInputValue] = useState(settings?.TtsEnhanceApiKey ? '********' : ''); // Show placeholder if key exists
  const [enhanceApiKey, setEnhanceApiKey] = useState(settings?.TtsEnhanceApiKey);

  useEffect(() => {
    // Pre-fill state if settings are loaded after initial render
    if(settings?.TtsEnhanceApiKey && !enhanceApiKey){
        setEnhanceApiKey(settings.TtsEnhanceApiKey);
        setInputValue('********');
    }
  }, [settings]);

  return (
    <div className="flex gap-[36px] mt-1.5">
      <div className="flex flex-col w-60">
        <label className="text-white text-sm font-semibold block mb-3">
          Enhancer API Key
        </label>
        <input
          type="password"
          name="TtsEnhanceApiKey" // Use correct setting name
          className="border-none bg-theme-settings-input-bg text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
          placeholder="OpenAI API Key for Enhancement"
          defaultValue={inputValue}
          required={false} // API key might not be strictly required if main key is set
          autoComplete="off"
          spellCheck={false}
          // Clear placeholder on focus if it's the placeholder
          onFocus={(e) => {if (e.target.value === '********') e.target.value = ''}}
          onChange={(e) => setInputValue(e.target.value)} 
          onBlur={(e) => {
             // If field is empty on blur, reset to placeholder if key originally existed
             if(!e.target.value && settings?.TtsEnhanceApiKey){
                 setInputValue('********')
             }
             setEnhanceApiKey(e.target.value); // Update the key state for model fetching
          }}
        />
        <p className="text-xs text-white/60 mt-1">Optional. If blank, the main OpenAI API key will be used.</p>
      </div>
      {/* Model selection component adapted for enhancement */}
      <EnhancementOpenAIModelSelection settings={settings} apiKey={enhanceApiKey} />
    </div>
  );
}

// Renamed model selection component
function EnhancementOpenAIModelSelection({ apiKey, settings }) {
  const [groupedModels, setGroupedModels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function findCustomModels() {
      setLoading(true);
      setError(null);
      try {
        // Use the potentially specific enhancer key, or fallback to main key if enhance key is not set/provided
        const keyToUse = apiKey || settings?.OpenAiKey;
        if (!keyToUse) {
           setError("Main OpenAI API Key or Enhancer API Key is required to fetch models.");
           setLoading(false);
           return;
        }
        const { models } = await System.customModels(
          "openai",
          typeof keyToUse === "boolean" ? null : keyToUse // Handle boolean if key is just 'present'
        );
        
        if (models?.length > 0) {
          const modelsByOrganization = models.reduce((acc, model) => {
            acc[model.organization] = acc[model.organization] || [];
            acc[model.organization].push(model);
            return acc;
          }, {});
          setGroupedModels(modelsByOrganization);
        } else {
           // Handle case where no models are returned but no error occurred
           setGroupedModels({});
           setError("No models found for the provided API key.");
        }
      } catch (e) {
         console.error("Failed to fetch OpenAI models:", e);
         setError(`Failed to fetch models: ${e.message}`);
         setGroupedModels({});
      } finally {
        setLoading(false);
      }
    }
    findCustomModels();
  }, [apiKey, settings?.OpenAiKey]); // Re-run if enhancer key or main key changes

  if (loading) {
    return (
      <div className="flex flex-col w-60">
        <label className="text-white text-sm font-semibold block mb-3">
          Enhancer Model Selection
        </label>
        <select
          name="TtsEnhanceModelPref" // Use correct setting name
          disabled={true}
          className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled={true} selected={true}>
            -- loading available models --
          </option>
        </select>
      </div>
    );
  }
  
  if (error) {
     return (
      <div className="flex flex-col w-60">
        <label className="text-white text-sm font-semibold block mb-3">
          Enhancer Model Selection
        </label>
        <select
          name="TtsEnhanceModelPref" // Use correct setting name
          disabled={true}
          className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled={true} selected={true}>
            -- Error loading models --
          </option>
        </select>
        <p className="text-xs text-red-400 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-60">
      <label className="text-white text-sm font-semibold block mb-3">
        Enhancer Model Selection
      </label>
      <select
        name="TtsEnhanceModelPref" // Use correct setting name
        required={true}
        className="border-none bg-theme-settings-input-bg border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
       {Object.keys(groupedModels).length === 0 && <option disabled={true} selected={true}>-- No models found --</option>}
        {Object.keys(groupedModels)
          .sort()
          .map((organization) => (
            <optgroup key={organization} label={organization}>
              {groupedModels[organization].map((model) => (
                <option
                  key={model.id}
                  value={model.id}
                  selected={settings?.TtsEnhanceModelPref === model.id} // Use correct setting name
                >
                  {model.name}
                </option>
              ))}
            </optgroup>
          ))}
      </select>
    </div>
  );
} 