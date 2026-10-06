// The user's own Gemini API key stays in this browser and is sent only to Google.
// By default it lasts for the browser session (sessionStorage). If the user opts in to
// "remember on this device" it is kept in localStorage instead.
const STORAGE_KEY = "myaiformmaker.geminiApiKey";

export interface StoredGeminiKey {
  key: string;
  remembered: boolean;
}

export function getStoredGeminiKey(): StoredGeminiKey {
  try {
    const remembered = localStorage.getItem(STORAGE_KEY);
    if (remembered) return { key: remembered, remembered: true };
  } catch {
    // storage blocked
  }
  try {
    const session = sessionStorage.getItem(STORAGE_KEY);
    if (session) return { key: session, remembered: false };
  } catch {
    // storage blocked
  }
  return { key: "", remembered: false };
}

export function storeGeminiKey(key: string, remember: boolean) {
  clearStoredGeminiKey();
  try {
    (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, key);
  } catch {
    // Storage blocked: the key just won't persist across reloads.
  }
}

export function clearStoredGeminiKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function looksLikeGeminiKey(key: string): boolean {
  return /^[A-Za-z0-9_-]{20,}$/.test(key);
}
