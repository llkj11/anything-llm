import { createContext, useEffect, useState } from "react";
import AnythingLLM from "./media/logo/anything-llm.png";
import AnythingLLMDark from "./media/logo/anything-llm-dark.png";
import DefaultLoginLogoLight from "./media/illustrations/login-logo.svg";
import DefaultLoginLogoDark from "./media/illustrations/login-logo-light.svg";
import System from "./models/system";

export const REFETCH_LOGO_EVENT = "refetch-logo";
export const LogoContext = createContext();

export function LogoProvider({ children }) {
  const [logo, setLogo] = useState("");
  const [loginLogo, setLoginLogo] = useState("");
  const [isCustomLogo, setIsCustomLogo] = useState(false);
  
  // Determine if we need the dark or light logo based on theme
  const useDarkLogo = () => {
    const theme = localStorage.getItem("theme") || "default";
    const darkThemes = ["default", "dark-blue", "forest", "midnight"];
    return !darkThemes.includes(theme);
  };
  
  const DefaultLoginLogo = useDarkLogo()
    ? DefaultLoginLogoDark
    : DefaultLoginLogoLight;

  async function fetchInstanceLogo() {
    try {
      const { isCustomLogo, logoURL } = await System.fetchLogo();
      if (logoURL) {
        setLogo(logoURL);
        setLoginLogo(isCustomLogo ? logoURL : DefaultLoginLogo);
        setIsCustomLogo(isCustomLogo);
      } else {
        useDarkLogo()
          ? setLogo(AnythingLLMDark)
          : setLogo(AnythingLLM);
        setLoginLogo(DefaultLoginLogo);
        setIsCustomLogo(false);
      }
    } catch (err) {
      useDarkLogo()
        ? setLogo(AnythingLLMDark)
        : setLogo(AnythingLLM);
      setLoginLogo(DefaultLoginLogo);
      setIsCustomLogo(false);
      console.error("Failed to fetch logo:", err);
    }
  }

  useEffect(() => {
    fetchInstanceLogo();
    window.addEventListener(REFETCH_LOGO_EVENT, fetchInstanceLogo);
    return () => {
      window.removeEventListener(REFETCH_LOGO_EVENT, fetchInstanceLogo);
    };
  }, []);

  return (
    <LogoContext.Provider value={{ logo, setLogo, loginLogo, isCustomLogo }}>
      {children}
    </LogoContext.Provider>
  );
}
