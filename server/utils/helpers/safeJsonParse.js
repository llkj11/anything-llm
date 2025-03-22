/**
 * Safely parses a JSON string, returning a default value if parsing fails
 * @param {string} str - The JSON string to parse
 * @param {any} defaultValue - The default value to return if parsing fails
 * @returns {any} - The parsed JSON or the default value
 */
function safeJsonParse(str, defaultValue = {}) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
}

module.exports = { safeJsonParse }; 