// Simple in-memory cache for TTS audio responses to avoid regenerating the same audio
const responseCache = new Map();

// Set a maximum size for the cache to prevent memory leaks
const MAX_CACHE_SIZE = 100; // Maximum number of items to store
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

// Add item to cache with timestamp for expiry
function set(key, value) {
  // Clear old entries if cache is too large
  if (responseCache.size >= MAX_CACHE_SIZE) {
    clearOldestEntry();
  }
  
  responseCache.set(key, {
    value,
    timestamp: Date.now()
  });
  return value;
}

// Get item from cache and check if it's still valid
function get(key) {
  const item = responseCache.get(key);
  if (!item) return null;
  
  // Check if the item has expired
  if (Date.now() - item.timestamp > MAX_AGE_MS) {
    responseCache.delete(key);
    return null;
  }
  
  return item.value;
}

// Clear the oldest entry based on timestamp
function clearOldestEntry() {
  let oldestKey = null;
  let oldestTime = Infinity;
  
  for (const [key, item] of responseCache.entries()) {
    if (item.timestamp < oldestTime) {
      oldestTime = item.timestamp;
      oldestKey = key;
    }
  }
  
  if (oldestKey) {
    responseCache.delete(oldestKey);
  }
}

// Clear the entire cache
function clear() {
  responseCache.clear();
}

module.exports = {
  responseCache: {
    set,
    get,
    clear
  }
}; 