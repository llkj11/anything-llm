import React from "react";
import { Tooltip } from "react-tooltip";
import Appearance from "@/models/appearance";

export function ChatTooltips() {
  const settings = Appearance.getSettings();
  return (
    <div id="chat-tooltips">
      <Tooltip id="copy-assistant-text" place="top" {...settings.tooltipTheme} />
      <Tooltip
        id="regenerate-assistant-text"
        place="top"
        {...settings.tooltipTheme}
      />
      <Tooltip
        id="redo-assistant-text"
        place="top"
        {...settings.tooltipTheme}
      />
      <Tooltip id="feedback-button" place="top" {...settings.tooltipTheme} />
      <Tooltip id="message-metrics" place="top" {...settings.tooltipTheme} />
      <Tooltip id="action-menu" place="top" {...settings.tooltipTheme} />
    </div>
  );
} 