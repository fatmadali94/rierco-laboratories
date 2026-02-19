// utils/persianText.js
// Utilities for handling Persian/Farsi text in PDFs
// Final working version - only reshapes, no bidi reversal needed

/**
 * Cache for loaded modules
 */
let cachedReshaper = null;
let cacheInitialized = false;
let cachePromise = null;

/**
 * Initialize and cache the Persian text processing modules
 * Call this ONCE when your app starts
 */
async function initializePersianText() {
  if (cacheInitialized) return true;

  // Return existing promise if already initializing
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    try {
      // Import arabic-reshaper
      const arabicReshaperModule = await import("arabic-reshaper");

      // arabic-reshaper exports an object with convertArabic method
      cachedReshaper = arabicReshaperModule.default || arabicReshaperModule;

      cacheInitialized = true;
      console.log("✅ Persian text processing (reshaper) loaded successfully");
      return true;
    } catch (error) {
      console.warn(
        "⚠️  arabic-reshaper not available. Persian letters may not connect properly.",
      );
      console.warn("   Install with: npm install arabic-reshaper");
      cacheInitialized = false;
      return false;
    }
  })();

  return cachePromise;
}

/**
 * Prepare Persian text for display in PDF (Synchronous)
 *
 * IMPORTANT: When using a Persian font in PDFKit, you only need to reshape
 * the letters (for proper connection). The font handles RTL automatically.
 * DO NOT reverse the text order.
 *
 * MUST call initializePersianText() first during app startup
 */
function preparePersianText(text) {
  if (!text) return "";

  if (!cacheInitialized || !cachedReshaper) {
    // Packages not loaded, return as-is
    // The Persian font will still render it, just without connected letters
    return text;
  }

  try {
    // ONLY reshape - this connects the letters properly
    // DON'T reverse - the font handles RTL direction
    if (cachedReshaper && typeof cachedReshaper.convertArabic === "function") {
      return cachedReshaper.convertArabic(text);
    }

    return text;
  } catch (error) {
    console.warn("Error processing Persian text:", error.message);
    return text;
  }
}

/**
 * Simple RTL reversal (for fallback when no Persian font available)
 */
function reverseForRTL(text) {
  if (!text) return "";

  // Split by spaces to reverse word order but keep words intact
  const words = text.split(" ");
  return words.reverse().join(" ");
}

/**
 * Reverse string completely
 */
function reverseString(str) {
  if (!str) return "";
  return str.split("").reverse().join("");
}

/**
 * Check if text contains Persian/Arabic characters
 */
function isPersian(text) {
  if (!text) return false;
  const persianRegex = /[\u0600-\u06FF]/;
  return persianRegex.test(text);
}

/**
 * Convert English numbers to Persian numbers
 */
function toPersianNumbers(text) {
  if (!text) return "";

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return text
    .toString()
    .replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
}

/**
 * Convert Persian numbers to English numbers
 */
function toEnglishNumbers(text) {
  if (!text) return "";

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  let result = text;

  persianDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, "g"), index.toString());
  });

  arabicDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, "g"), index.toString());
  });

  return result;
}

// Export functions
export {
  initializePersianText,
  preparePersianText,
  reverseString,
  reverseForRTL,
  isPersian,
  toPersianNumbers,
  toEnglishNumbers,
};

// Export as default object too for compatibility
export default {
  initializePersianText,
  preparePersianText,
  reverseString,
  reverseForRTL,
  isPersian,
  toPersianNumbers,
  toEnglishNumbers,
};
