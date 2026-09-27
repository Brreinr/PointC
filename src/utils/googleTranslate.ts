/**
 * Google Translate Integration Utility
 * Uses Google Translate API to translate visual elements, buttons, and text in the pointC Editor.
 */

export interface GoogleTranslateResult {
  translatedText: string;
  targetLang: string;
}

/**
 * Translates a single text using Google Translate API
 */
export async function translateTextWithGoogle(
  text: string,
  targetLang: 'es' | 'en',
  sourceLang: string = 'auto'
): Promise<string> {
  if (!text || text.trim() === '') return text;

  try {
    const response = await fetch('/api/google-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLang,
        sourceLang,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.translatedText || text;
    }
  } catch (err) {
    console.warn('Backend Google Translate failed, falling back to client fetch:', err);
  }

  // Fallback direct call to Google Translate GTX endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return (data[0] || []).map((part: any) => part[0]).join('') || text;
    }
  } catch (e) {
    console.error('Direct Google Translate failed:', e);
  }

  return text;
}

/**
 * Translates multiple texts using Google Translate API in batch
 */
export async function translateBatchWithGoogle(
  texts: string[],
  targetLang: 'es' | 'en',
  sourceLang: string = 'auto'
): Promise<string[]> {
  if (!texts || texts.length === 0) return [];

  try {
    const response = await fetch('/api/google-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts,
        targetLang,
        sourceLang,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.translations) && data.translations.length === texts.length) {
        return data.translations;
      }
    }
  } catch (err) {
    console.warn('Batch Google Translate error:', err);
  }

  // Fallback sequential
  const results: string[] = [];
  for (const t of texts) {
    results.push(await translateTextWithGoogle(t, targetLang, sourceLang));
  }
  return results;
}

/**
 * Activates language change cleanly on the document across all UI elements
 */
export function applyGoogleTranslateToDOM(targetLang: 'es' | 'en') {
  try {
    const langCode = targetLang === 'en' ? 'en' : 'es';
    if (document.documentElement) {
      document.documentElement.lang = langCode;
    }
    const isOriginal = langCode === 'es';
    const cookieValEs = `/es/${langCode}`;
    const cookieValAuto = `/auto/${langCode}`;

    const host = window.location.hostname;
    const domains = ['', host, '.' + host];
    const parts = host.split('.');
    if (parts.length > 2) {
      domains.push('.' + parts.slice(-2).join('.'));
    }

    if (isOriginal) {
      domains.forEach((d) => {
        const domainStr = d ? `; domain=${d}` : '';
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainStr}`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      try {
        localStorage.removeItem('pointc_google_translate_lang');
      } catch {}
    } else {
      domains.forEach((d) => {
        const domainStr = d ? `; domain=${d}` : '';
        document.cookie = `googtrans=${cookieValEs}; path=/${domainStr}`;
        document.cookie = `googtrans=${cookieValAuto}; path=/${domainStr}`;
      });
      try {
        localStorage.setItem('pointc_google_translate_lang', langCode);
      } catch {}
    }

    const selectElem = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } catch (e) {
    console.error('Error applying language to DOM:', e);
  }
}
