/**
 * Google Translate integration utility for IP-SAKTI Sahayak
 * Translates the entire DOM page into English, Hindi, Sanskrit, Tamil, etc.
 */

export const triggerGoogleTranslate = (langCode: string) => {
  try {
    const targetCookie = `/en/${langCode}`;
    
    // Set googtrans cookie across root path and domain
    document.cookie = `googtrans=${targetCookie}; path=/`;
    if (window.location.hostname) {
      document.cookie = `googtrans=${targetCookie}; domain=${window.location.hostname}; path=/`;
      document.cookie = `googtrans=${targetCookie}; domain=.${window.location.hostname}; path=/`;
    }

    // Try finding Google Translate select dropdown in DOM
    const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change'));
    } else {
      // Reload to activate cookie translation across all React components
      window.location.reload();
    }
  } catch (err) {
    console.warn('Google translate trigger failed:', err);
  }
};
