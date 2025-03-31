import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import System from "@/models/system";
import showToast from "@/utils/toast";
// Import logos and option components - Assume they exist or need creation/adaptation
import AnythingLLMIcon from "@/media/logo/anything-llm-icon.png";
import OpenAiLogo from "@/media/llmprovider/openai.png";
import AzureOpenAiLogo from "@/media/llmprovider/azure.png";
import AnthropicLogo from "@/media/llmprovider/anthropic.png";
// ... import other necessary logos ...
import OpenAiOptions from "@/components/LLMSelection/OpenAiOptions";
import AzureAiOptions from "@/components/LLMSelection/AzureAiOptions";
import AnthropicAiOptions from "@/components/LLMSelection/AnthropicAiOptions";
// ... import other necessary option components ...
import PreLoader from "@/components/Preloader";
import LLMItem from "@/components/LLMSelection/LLMItem"; // Re-use for item display
import { CaretUpDown, MagnifyingGlass, X } from "@phosphor-icons/react";
import CTAButton from "@/components/lib/CTAButton";

// Import the adapted component
import EnhancementOpenAiOptions from "@/components/EnhancementProviderSelection/OpenAiOptions";
// TODO: Import adapted components for other providers as they are created

// Define the available LLM providers specifically for enhancement
// Populate with full list, referencing adapted components where needed
const AVAILABLE_ENHANCEMENT_PROVIDERS = [
  {
    name: "OpenAI",
    value: "openai",
    logo: OpenAiLogo,
    options: (settings) => <EnhancementOpenAiOptions settings={settings} />, // Use adapted component
    description: "Use OpenAI models to enhance TTS instructions.",
    requiredConfig: ["TtsEnhanceApiKey"], // Keys needed by this component
  },
  {
    name: "Azure OpenAI",
    value: "azure",
    logo: AzureOpenAiLogo,
    options: (settings) => <AzureAiOptions settings={settings} keyPrefix="TtsEnhance" />, // Needs adaptation or prop passing
    description: "Use Azure-hosted OpenAI models.",
    requiredConfig: ["TtsEnhanceAzureApiKey"], // Hypothetical key, needs confirmation
  },
  {
    name: "Anthropic",
    value: "anthropic",
    logo: AnthropicLogo,
    options: (settings) => <AnthropicAiOptions settings={settings} keyPrefix="TtsEnhance" />, // Needs adaptation
    description: "Use Anthropic models like Claude.",
    requiredConfig: ["TtsEnhanceAnthropicApiKey"], // Hypothetical key
  },
  // TODO: Add all other providers from AVAILABLE_LLM_PROVIDERS in LLMPreference/index.jsx
  // adapting the .options() call to use copied/modified components or pass necessary props.
  // Ensure requiredConfig uses the correct TtsEnhance... keys.
];

export default function EnhancementProviderPreference() {
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {}; // Start empty
    const formData = new FormData(form);

    // Set the selected provider
    data['TtsEnhanceProvider'] = selectedProvider;

    // Iterate over form data and map to TtsEnhance keys
    for (var [key, value] of formData.entries()) {
      // Skip the search input if present
      if (key === 'enhancement-search') continue;
      
      // Prepend TtsEnhance if not already there (handles adapted components)
      // This assumes adapted components use names like OpenAiKey, OpenAiModelPref, AzureEndpoint etc.
      let targetKey = key;
      if (!key.startsWith('TtsEnhance')) {
         // Simple heuristic: Capitalize first letter for standard keys like ApiKey, ModelPref
         // More complex keys like AzureOpenAiEndpoint might need specific mapping rules
         // For now, we assume adapted components will output keys like 'ApiKey', 'ModelPref', 'BasePath' etc.
         targetKey = `TtsEnhance${key}`;
      }
      data[targetKey] = value;
    }
    
    console.log("Saving Enhancement Provider Settings:", data);
    setSaving(true);
    const { error } = await System.updateSystem(data); 

    if (error) {
      showToast(t("enhancement-provider.toast.save-error", `Failed to save TTS Enhancement settings: ${error}`), "error");
    } else {
      showToast(t("enhancement-provider.toast.save-success", "TTS Enhancement preferences saved successfully."), "success");
       // Fetch keys again to update the UI state after saving
      const _settings = await System.keys();
      setSettings(_settings);
    }
    setSaving(false);
    setHasChanges(false); // Reset changes state after save attempt
  };

  const updateProviderChoice = (selection) => {
    setSearchQuery("");
    setSelectedProvider(selection);
    setSearchMenuOpen(false);
    setHasChanges(true);
  };

  const handleXButton = () => {
    if (searchQuery.length > 0) {
      setSearchQuery("");
      if (searchInputRef.current) searchInputRef.current.value = "";
    } else {
      setSearchMenuOpen(!searchMenuOpen);
    }
  };

  useEffect(() => {
    async function fetchKeys() {
      const _settings = await System.keys();
      setSettings(_settings);
      setSelectedProvider(_settings?.TtsEnhanceProvider); // Use correct key
      setLoading(false);
    }
    fetchKeys();
  }, []);

  useEffect(() => {
    const filtered = AVAILABLE_ENHANCEMENT_PROVIDERS.filter((provider) =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProviders(filtered);
  }, [searchQuery, selectedProvider]);

  const selectedProviderObject = AVAILABLE_ENHANCEMENT_PROVIDERS.find(
    (provider) => provider.value === selectedProvider
  );

  return (
    <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      <Sidebar />
      {loading ? (
        <div
          style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
          className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
        >
          <div className="w-full h-full flex justify-center items-center">
            <PreLoader />
          </div>
        </div>
      ) : (
        <div
          style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
          className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
        >
          <form onSubmit={handleSubmit} className="flex w-full" id="enhancement-provider-form"> {/* Add form ID */}
            <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
              <div className="w-full flex flex-col gap-y-1 pb-6 border-white light:border-theme-sidebar-border border-b-2 border-opacity-10">
                <div className="flex gap-x-4 items-center">
                  <p className="text-lg leading-6 font-bold text-white">
                    {t("enhancement-provider.title", "TTS Enhancement Provider")} 
                  </p>
                </div>
                <p className="text-xs leading-[18px] font-base text-white text-opacity-60">
                  {t("enhancement-provider.description", "Configure the Large Language Model (LLM) used to enhance TTS instructions for the gpt-4o-mini-tts model.")} 
                </p>
              </div>
              <div className="w-full justify-end flex">
                {hasChanges && (
                  <CTAButton
                    // onClick={() => handleSubmit()} // Submit is handled by form onSubmit
                    className="mt-3 mr-0 -mb-14 z-10"
                    type="submit" // Make button type submit
                  >
                    {saving ? t("common.saving", "Saving...") : t("common.save-changes", "Save changes")}
                  </CTAButton>
                )}
              </div>
              <div className="text-base font-bold text-white mt-6 mb-4">
                {t("enhancement-provider.provider", "Enhancement Provider")}
              </div>
              <div className="relative">
                {/* Search Menu Overlay - Copied */}
                {searchMenuOpen && (
                  <div
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 backdrop-blur-sm z-10"
                    onClick={() => setSearchMenuOpen(false)}
                  />
                )}
                {/* Search Menu - Copied */}
                {searchMenuOpen ? (
                  <div className="absolute top-0 left-0 w-full max-w-[640px] max-h-[310px] overflow-auto white-scrollbar min-h-[64px] bg-theme-settings-input-bg rounded-lg flex flex-col justify-between cursor-pointer border-2 border-primary-button z-20">
                     {/* Search Input - Copied */}
                    <div className="w-full flex flex-col gap-y-1">
                      <div className="flex items-center sticky top-0 border-b border-[#9CA3AF] mx-4 bg-theme-settings-input-bg">
                        <MagnifyingGlass
                          size={20}
                          weight="bold"
                          className="absolute left-4 z-30 text-theme-text-primary -ml-4 my-2"
                        />
                        <input
                          type="text"
                          name="enhancement-search" 
                          autoComplete="off"
                          placeholder={t("enhancement-provider.search-placeholder", "Search providers")}
                          className="border-none -ml-4 my-2 bg-transparent z-20 pl-12 h-[38px] w-full px-4 py-1 text-sm outline-none text-theme-text-primary placeholder:text-theme-text-primary placeholder:font-medium"
                          onChange={(e) => setSearchQuery(e.target.value)}
                          ref={searchInputRef}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }}
                        />
                        <X
                          size={20}
                          weight="bold"
                          className="cursor-pointer text-white hover:text-x-button"
                          onClick={handleXButton}
                        />
                      </div>
                       {/* Provider List - Copied */}
                      <div className="flex-1 pl-4 pr-2 flex flex-col gap-y-1 overflow-y-auto white-scrollbar pb-4">
                        {filteredProviders.map((provider) => {
                          return (
                            <LLMItem
                              key={provider.name}
                              name={provider.name}
                              value={provider.value}
                              image={provider.logo}
                              description={provider.description}
                              checked={selectedProvider === provider.value}
                              onClick={() => updateProviderChoice(provider.value)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Button to open search menu - Copied
                  <button
                    className="w-full max-w-[640px] h-[64px] bg-theme-settings-input-bg rounded-lg flex items-center p-[14px] justify-between cursor-pointer border-2 border-transparent hover:border-primary-button transition-all duration-300"
                    type="button"
                    onClick={() => setSearchMenuOpen(true)}
                  >
                    <div className="flex gap-x-4 items-center">
                      <img
                        src={selectedProviderObject?.logo || AnythingLLMIcon}
                        alt={`${selectedProviderObject?.name || 'provider'} logo`}
                        className="w-10 h-10 rounded-md"
                      />
                      <div className="flex flex-col text-left">
                        <div className="text-sm font-semibold text-white">
                          {selectedProviderObject?.name || t("common.none-selected", "None selected")}
                        </div>
                        <div className="mt-1 text-xs text-description">
                          {selectedProviderObject?.description || t("enhancement-provider.select-provider-desc", "You need to select an enhancement provider")}
                        </div>
                      </div>
                    </div>
                    <CaretUpDown
                      size={24}
                      weight="bold"
                      className="text-white"
                    />
                  </button>
                )}
              </div>
              {/* Provider Specific Options - Copied */}    
              <div
                onChange={() => setHasChanges(true)}
                className="mt-4 flex flex-col gap-y-1"
              >
                {selectedProvider &&
                  AVAILABLE_ENHANCEMENT_PROVIDERS.find(
                    (provider) => provider.value === selectedProvider
                  )?.options(settings)} 
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 