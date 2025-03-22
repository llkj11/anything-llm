/**
 * Removes <thinking> tags and their content from text.
 * Used to clean up text for TTS since we don't want to speak the thinking process.
 * @param {string} text - The text to clean up
 * @returns {string} - Text with thinking tags and content removed
 */
function stripThinkingTags(text) {
  if (!text) return '';
  return text.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
}

module.exports = { stripThinkingTags }; 