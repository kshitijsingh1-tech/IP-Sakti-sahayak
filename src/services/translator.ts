/**
 * Google Translate integration utility for IP-SAKTI Sahayak
 * Translates the entire DOM page into English, Hindi, Sanskrit, Tamil, Telugu, etc.
 */

export const triggerGoogleTranslate = (langCode: string) => {
  try {
    // 1. Check if Google Translate iframe/select exists in DOM
    const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change'));
      return;
    }

    // 2. Fallback: Set googtrans cookie & trigger reload if cookie changed
    const targetCookie = `/en/${langCode}`;
    const currentCookie = (document.cookie.match(/googtrans=([^;]+)/) || [])[1];

    if (currentCookie !== targetCookie) {
      document.cookie = `googtrans=${targetCookie}; path=/`;
      document.cookie = `googtrans=${targetCookie}; domain=${window.location.hostname}; path=/`;
      window.location.reload();
    }
  } catch (err) {
    console.warn('Google translate trigger failed:', err);
  }
};
