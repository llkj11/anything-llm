import React, { useEffect, useState, useRef } from "react";
import showToast from "@/utils/toast";
import { CaretUpDown, MagnifyingGlass, X } from "@phosphor-icons/react";
import OpenAiLogo from "@/media/llmprovider/openai.png";
import AnythingLLMIcon from "@/media/logo/anything-llm-icon.png";
import ElevenLabsIcon from "@/media/ttsproviders/elevenlabs.png";
import PiperTTSIcon from "@/media/ttsproviders/piper.png";
import GenericOpenAiLogo from "@/media/ttsproviders/generic-openai.png";

// Import the OpenAI TTS Options component
import OpenAiOptions from "./OpenAiOptions";

const PROVIDERS = [
  {
    name: "System default",
    value: null,
    logo: AnythingLLMIcon,
    options: () => <div className="text-sm text-white/60 mt-4">Using system default TTS settings.</div>,
    description: "Use the global TTS settings defined in the instance settings.",
  },
  {
    name: "System native",
    value: "native",
    logo: AnythingLLMIcon,
    options: () => <div className="text-sm text-white/60 mt-4">Browser-native TTS settings will be used.</div>,
    description: "Uses your browser's built in TTS service if supported.",
  },
  {
    name: "OpenAI",
    value: "openai",
    logo: OpenAiLogo,
    options: (settings, workspace, setHasChanges) => (
      <OpenAiOptions 
        settings={settings} 
        workspace={workspace} 
        setHasChanges={setHasChanges} 
      />
    ),
    description: "Use OpenAI's text to speech voices, including customizable GPT-4o TTS.",
  },
  {
    name: "ElevenLabs",
    value: "elevenlabs",
    logo: ElevenLabsIcon,
    options: () => (
      <div className="flex flex-col gap-y-4 mt-4">
        <div className="text-sm text-white/60">ElevenLabs TTS settings will be used.</div>
        <div className="p-4 bg-theme-bg-secondary rounded-md">
          <div className="text-sm text-white">
            Configure your workspace-specific ElevenLabs TTS settings in the next version update.
          </div>
        </div>
      </div>
    ),
    description: "Use ElevenLabs's text to speech voices and technology.",
  },
  {
    name: "PiperTTS",
    value: "piper_local",
    logo: PiperTTSIcon,
    options: () => (
      <div className="flex flex-col gap-y-4 mt-4">
        <div className="text-sm text-white/60">Piper TTS models will run in your browser locally.</div>
        <div className="p-4 bg-theme-bg-secondary rounded-md">
          <div className="text-sm text-white">
            Configure your workspace-specific Piper TTS settings in the next version update.
          </div>
        </div>
      </div>
    ),
    description: "Run TTS models locally in your browser privately.",
  },
  {
    name: "OpenAI Compatible",
    value: "generic-openai",
    logo: GenericOpenAiLogo,
    options: () => (
      <div className="flex flex-col gap-y-4 mt-4">
        <div className="text-sm text-white/60">OpenAI-compatible TTS settings will be used.</div>
        <div className="p-4 bg-theme-bg-secondary rounded-md">
          <div className="text-sm text-white">
            Configure your workspace-specific OpenAI-compatible TTS settings in the next version update.
          </div>
        </div>
      </div>
    ),
    description:
      "Connect to an OpenAI compatible TTS service running locally or remotely.",
  },
];

export default function WorkspaceTTSSettings({ settings, workspace, setHasChanges }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProviders, setFilteredProviders] = useState(PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState(
    workspace?.ttsProvider || null
  );
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Add this style for mobile
  const mobileStyles = `
    @media (max-height: 700px) {
      .tts-dropdown {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        max-height: 80vh !important;
        z-index: 1000 !important;
        width: 90% !important;
        max-width: 500px !important;
      }
    }
  `;

  const updateProviderChoice = (selection) => {
    setSearchQuery("");
    setSelectedProvider(selection);
    setSearchMenuOpen(false);
    setHasChanges(true);
  };

  const handleXButton = (e) => {
    e.stopPropagation();
    if (searchQuery.length > 0) {
      setSearchQuery("");
      if (searchInputRef.current) searchInputRef.current.value = "";
    } else {
      setSearchMenuOpen(false);
    }
  };

  const toggleDropdown = () => {
    const newState = !searchMenuOpen;
    setSearchMenuOpen(newState);
    
    // If opening the dropdown, scroll to ensure it's visible
    if (newState && dropdownRef.current) {
      setTimeout(() => {
        const dropdownRect = dropdownRef.current?.getBoundingClientRect();
        if (dropdownRect) {
          // If the dropdown would be off-screen, scroll it into view
          const viewportHeight = window.innerHeight;
          if (dropdownRect.bottom > viewportHeight) {
            window.scrollTo({
              top: window.scrollY + dropdownRect.top - 100,
              behavior: 'smooth'
            });
          }
        }
      }, 10);
    }
  };

  // Position the dropdown above instead of below if near the bottom of viewport
  useEffect(() => {
    if (searchMenuOpen && dropdownRef.current) {
      try {
        const dropdownEl = dropdownRef.current;
        const rect = dropdownEl.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Check if dropdown would go off-screen at the bottom
        if (rect.top + rect.height > viewportHeight - 20) {
          // Position above the button instead
          dropdownEl.style.top = 'auto';
          dropdownEl.style.bottom = '56px';
          dropdownEl.style.maxHeight = `${Math.min(rect.top - 20, 250)}px`; 
        } else {
          // Position below the button (default)
          dropdownEl.style.top = '56px';
          dropdownEl.style.bottom = 'auto';
          dropdownEl.style.maxHeight = `${Math.min(viewportHeight - rect.top - 60, 250)}px`;
        }
      } catch (e) {
        console.error("Error positioning dropdown:", e);
      }
    }
  }, [searchMenuOpen]);

  useEffect(() => {
    const filtered = PROVIDERS.filter((provider) =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProviders(filtered);
  }, [searchQuery]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchMenuOpen(false);
      }
    };

    if (searchMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchMenuOpen]);

  useEffect(() => {
    // Update hasChanges if the selectedProvider changes
    if (selectedProvider !== workspace?.ttsProvider) {
      setHasChanges(true);
    }
  }, [selectedProvider, workspace?.ttsProvider, setHasChanges]);

  const selectedProviderObject = PROVIDERS.find(
    (provider) => provider.value === selectedProvider
  );

  return (
    <div className="w-full flex flex-col gap-y-1 pb-6 border-white light:border-theme-sidebar-border border-b-2 border-opacity-10">
      <style>{mobileStyles}</style>
      <div className="flex gap-x-4 items-center">
        <p className="text-lg leading-6 font-bold text-white">
          Text-to-speech Settings
        </p>
      </div>
      <p className="text-xs leading-[18px] font-base text-white text-opacity-60 mb-6">
        Configure workspace-specific text-to-speech settings. If set, these will override the global TTS settings when chatting in this workspace.
      </p>
      
      <div className="text-base font-bold text-white mb-4">Provider</div>
      <div className="relative" style={{ marginBottom: "250px" }}>
        <div
          className="h-[48px] px-4 rounded-lg flex items-center justify-between bg-theme-settings-input-bg text-white cursor-pointer text-sm"
          onClick={toggleDropdown}
        >
          <div className="flex items-center gap-x-2">
            {selectedProviderObject ? (
              <>
                <img
                  src={selectedProviderObject.logo}
                  className="h-6 w-6 rounded-md"
                  alt={selectedProviderObject.name}
                />
                <div>
                  <span>{selectedProviderObject.name}</span>
                </div>
              </>
            ) : (
              <div>
                <span>Select a TTS provider</span>
              </div>
            )}
          </div>
          {searchMenuOpen ? (
            <X
              size={20}
              weight="bold"
              className="cursor-pointer text-white hover:text-x-button"
              onClick={handleXButton}
            />
          ) : (
            <CaretUpDown
              size={16}
              weight="bold"
              className="text-theme-text-primary"
            />
          )}
        </div>

        {searchMenuOpen && (
          <div
            ref={dropdownRef}
            className="tts-dropdown absolute top-[56px] left-0 w-full max-w-[640px] max-h-[250px] overflow-auto white-scrollbar min-h-[64px] bg-theme-settings-input-bg rounded-lg flex flex-col justify-between cursor-pointer border-2 border-primary-button z-50"
          >
            <div className="w-full flex flex-col gap-y-1">
              <div className="flex items-center sticky top-0 border-b border-[#9CA3AF] mx-4 bg-theme-settings-input-bg z-51">
                <MagnifyingGlass
                  size={20}
                  weight="bold"
                  className="absolute left-4 z-30 text-theme-text-primary -ml-4 my-2"
                />
                <input
                  type="text"
                  name="tts-provider-search"
                  autoComplete="off"
                  placeholder="Search text to speech providers"
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
              <div className="p-2 flex flex-col">
                {filteredProviders.map((provider) => (
                  <div
                    key={provider.value || "null"}
                    className={`p-2 rounded-lg flex gap-x-3 items-center hover:bg-theme-bg-hover ${
                      provider.value === selectedProvider ? "bg-theme-bg-hover" : ""
                    }`}
                    onClick={() => updateProviderChoice(provider.value)}
                  >
                    <img
                      src={provider.logo}
                      className="h-10 w-10 rounded-md"
                      alt={provider.name}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {provider.name}
                      </span>
                      <span className="text-xs text-white/60">
                        {provider.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <input 
          type="hidden" 
          name="ttsProvider" 
          value={selectedProvider || ""} 
        />

        {selectedProvider &&
          PROVIDERS.find(
            (provider) => provider.value === selectedProvider
          )?.options(settings, workspace, setHasChanges)}
      </div>
    </div>
  );
} 