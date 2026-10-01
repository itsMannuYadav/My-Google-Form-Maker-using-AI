// The user's own Gemini API key lives only in this browser's localStorage.
// It is sent to our server per request (header) and is never stored there.
const STORAGE_KEY = "myaiformmaker.geminiApiKey";

export function getStoredGeminiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function storeGeminiKey(key: string) {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // Storage blocked: the key just won't persist across reloads.
  }
}

export function clearStoredGeminiKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function looksLikeGeminiKey(key: string): boolean {
  return /^[A-Za-z0-9_-]{20,}$/.test(key);
}
