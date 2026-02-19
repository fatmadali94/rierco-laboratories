// utils/shamsiDate.js
// Utilities for Shamsi (Jalali/Persian) date conversion

/**
 * Convert Gregorian date to Shamsi (Jalali) date
 *
 * For production, use: npm install moment-jalaali
 * This provides a simplified version
 */
export function toShamsiDate(date) {
  if (!date) return "";

  try {
    // Try to use moment-jalaali if available
    const moment = require("moment-jalaali");

    const m = moment(date);
    const jYear = m.jYear();
    const jMonth = String(m.jMonth() + 1).padStart(2, "0");
    const jDay = String(m.jDate()).padStart(2, "0");

    return `${jYear}/${jMonth}/${jDay}`;
  } catch (error) {
    // moment-jalaali not installed, use approximation
    console.warn("moment-jalaali not installed. Using approximate conversion.");
    console.warn("Run: npm install moment-jalaali for accurate dates");

    return approximateShamsiDate(date);
  }
}

/**
 * Approximate Shamsi date conversion (not 100% accurate)
 * Use moment-jalaali for production
 */
export function approximateShamsiDate(date) {
  const d = new Date(date);

  // Simple approximation: subtract 621 or 622 years
  // This is NOT accurate for all dates!
  const gYear = d.getFullYear();
  const gMonth = d.getMonth() + 1; // 1-12
  const gDay = d.getDate();

  // Rough conversion
  let jYear, jMonth, jDay;

  if (gMonth > 3 || (gMonth === 3 && gDay >= 21)) {
    // After March 21: subtract 621
    jYear = gYear - 621;
  } else {
    // Before March 21: subtract 622
    jYear = gYear - 622;
  }

  // Approximate month conversion (very rough)
  // This is simplified and not accurate
  if (gMonth >= 3 && gMonth <= 5) {
    jMonth = gMonth - 2;
  } else if (gMonth >= 6 && gMonth <= 8) {
    jMonth = gMonth - 2;
  } else if (gMonth >= 9 && gMonth <= 11) {
    jMonth = gMonth - 2;
  } else {
    jMonth = gMonth + 10;
  }

  jDay = gDay; // Approximation

  const jMonthStr = String(jMonth).padStart(2, "0");
  const jDayStr = String(jDay).padStart(2, "0");

  return `${jYear}/${jMonthStr}/${jDayStr}`;
}

/**
 * Get current Shamsi date
 */
export function getCurrentShamsiDate() {
  return toShamsiDate(new Date());
}

/**
 * Format Shamsi date with Persian month name
 */
export function formatShamsiDateWithMonthName(date) {
  const persianMonths = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];

  try {
    const moment = require("moment-jalaali");
    const m = moment(date);

    const jYear = m.jYear();
    const jMonth = m.jMonth(); // 0-11
    const jDay = m.jDate();

    return `${jDay} ${persianMonths[jMonth]} ${jYear}`;
  } catch (error) {
    // Fallback without moment-jalaali
    const shamsiDate = toShamsiDate(date);
    const parts = shamsiDate.split("/");
    const monthIndex = parseInt(parts[1]) - 1;

    return `${parts[2]} ${persianMonths[monthIndex]} ${parts[0]}`;
  }
}

/**
 * Shamsi month names (Persian)
 */
const SHAMSI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/**
 * Shamsi weekday names (Persian)
 */
const SHAMSI_WEEKDAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];
