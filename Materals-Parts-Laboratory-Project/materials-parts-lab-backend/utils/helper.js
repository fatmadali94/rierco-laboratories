// server-side helper
export default function formatCarNumber(raw = "") {
  // Accept optional extra spaces; re-emit canonical spacing
  const re = /^([0-9]{2})([بپتثجچحخدرزسشصطظعفقکگلمنوهی])([0-9]{3})\s*IR\s*([0-9]{2})$/;
  const m = raw.match(re);
  return m ? `${m[1]}${m[2]}${m[3]} IR ${m[4]}` : raw;
}
