/**
 * Regular expressions for identifying thinking sections in messages
 * Matches various thinking tags like <think>, <thinking>, <thought>, <thought_chain>
 */
const THOUGHT_KEYWORDS = ["thought", "thinking", "think", "thought_chain"];
const THOUGHT_REGEX_OPEN = new RegExp(
  THOUGHT_KEYWORDS.map((keyword) => `<${keyword}\\s*(?:[^>]*?)?\\s*>`).join("|")
);
const THOUGHT_REGEX_CLOSE = new RegExp(
  [...THOUGHT_KEYWORDS, "response", "answer"].map((keyword) => `</${keyword}\\s*(?:[^>]*?)?>`).join("|")
);
const THOUGHT_REGEX_COMPLETE = new RegExp(
  THOUGHT_KEYWORDS.map(
    (keyword) =>
      `<${keyword}\\s*(?:[^>]*?)?\\s*>[\\s\\S]*?<\\/${keyword}\\s*(?:[^>]*?)?>`
  ).join("|")
);

/**
 * Strips thinking/reasoning tags from message content for TTS
 * 
 * @param {string} text - The original message text possibly containing thinking tags
 * @returns {string} - The message with thinking sections removed
 */
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

module.exports = stripThinkingTags; 