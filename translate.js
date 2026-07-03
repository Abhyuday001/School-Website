/* ============================================================
   TRANSLATE.JS
   Translates arbitrary English text (e.g. content pulled live
   from the Google Sheet CMS) into Hindi on demand, using the
   free MyMemory translation API.

   - Results are cached in localStorage so the same sentence is
     never translated twice (keeps you well within the free
     API's daily usage limits, and makes repeat visits instant).
   - If the API is unreachable or fails, the original English
     text is shown instead of breaking the page.

   NOTE: this is machine translation, not a human review — good
   for notices/addresses, but for anything that needs to be
   perfectly worded in Hindi (e.g. a mission statement), consider
   adding a native Hindi column to the Google Sheet instead.
   ============================================================ */

const TRANSLATE_CACHE_KEY = 'translateCache_en_hi_v1';

function loadTranslateCache() {
  try {
    return JSON.parse(localStorage.getItem(TRANSLATE_CACHE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function saveTranslateCache(cache) {
  try {
    localStorage.setItem(TRANSLATE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    // localStorage full or unavailable — non-fatal, just skip caching
  }
}

const _translateCache = loadTranslateCache();

/**
 * Translate a single string of English text to Hindi.
 * Returns the original text unchanged if it's empty, already
 * cached, or if the translation request fails.
 */
async function translateToHindi(text) {
  if (!text || !text.trim()) return text;
  if (_translateCache[text]) return _translateCache[text];

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`;
    const response = await fetch(url);
    const data = await response.json();
    const translated = data && data.responseData && data.responseData.translatedText
      ? data.responseData.translatedText
      : text;

    _translateCache[text] = translated;
    saveTranslateCache(_translateCache);
    return translated;
  } catch (error) {
    console.error('Translation request failed, showing original English text:', error);
    return text;
  }
}

/**
 * Translate a list of strings in parallel. Order is preserved.
 */
async function translateAllToHindi(textArray) {
  return Promise.all(textArray.map(t => translateToHindi(t)));
}
