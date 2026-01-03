import { toJalaali, toGregorian } from "jalaali-js";

// Converts "YYYY/MM/DD" or "YYYY-MM-DD" (Jalali) → "YYYY-MM-DD" (Gregorian)
export function convertJalaliToGregorian(jalaliStr) {
  if (!jalaliStr) return null;

  const parts = jalaliStr.includes("/")
    ? jalaliStr.split("/")
    : jalaliStr.split("-");
  const [jy, jm, jd] = parts.map(Number);
  const { gy, gm, gd } = toGregorian(jy, jm, jd);

  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`; // No time component
}

// Converts "YYYY-MM-DD[T...]" → "YYYY/MM/DD" (Jalali), safe from timezones
export function convertGregorianToJalali(gregorianStr) {
  if (!gregorianStr) return "";

  const dateOnly = gregorianStr.split("T")[0]; // Remove time
  const [year, month, day] = dateOnly.split("-").map(Number);
  const { jy, jm, jd } = toJalaali(year, month, day);

  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}
