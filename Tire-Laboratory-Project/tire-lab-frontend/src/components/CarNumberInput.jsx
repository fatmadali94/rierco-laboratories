// CarNumberInput.jsx
import React, { useEffect, useMemo, useState } from "react";

const PERSIAN_LETTERS = [
  "ب",
  "پ",
  "ت",
  "ث",
  "ج",
  "چ",
  "ح",
  "خ",
  "د",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ط",
  "ظ",
  "ع",
  "ف",
  "ق",
  "ک",
  "گ",
  "ل",
  "م",
  "ن",
  "و",
  "ه",
  "ی",
];

// Parse a combined plate like "25د235 IR63"
function parsePlate(str = "") {
  const m = str.match(
    /^(\d{2})([بپتثجچحخدرزسشصطظعفقکگلمنوهی])(\d{3})\s?IR\s?(\d{2})$/
  );
  if (!m) return { a2: "", letter: "", b3: "", c2: "" };
  return { a2: m[1], letter: m[2], b3: m[3], c2: m[4] };
}

function onlyDigits(s = "", max = 3) {
  return s.replace(/\D/g, "").slice(0, max);
}

export default function CarNumberInput({ form, setForm }) {
  // Initialize local pieces from form.car_number if present
  const initial = useMemo(
    () => parsePlate(form.car_number || ""),
    [form.car_number]
  );
  const [a2, setA2] = useState(initial.a2);
  const [letter, setLetter] = useState(initial.letter || PERSIAN_LETTERS[0]);
  const [b3, setB3] = useState(initial.b3);
  const [c2, setC2] = useState(initial.c2);

  // If parent changes form.car_number externally, sync local pieces
  useEffect(() => {
    setA2(initial.a2);
    setLetter(initial.letter || PERSIAN_LETTERS[0]);
    setB3(initial.b3);
    setC2(initial.c2);
  }, [initial.a2, initial.letter, initial.b3, initial.c2]);

  // Combine parts when all valid
  useEffect(() => {
    const allValid =
      a2.length === 2 &&
      PERSIAN_LETTERS.includes(letter) &&
      b3.length === 3 &&
      c2.length === 2;

    const combined = allValid ? `${a2}${letter}${b3} IR${c2}` : "";
    setForm((prev) => ({ ...prev, car_number: combined }));
  }, [a2, letter, b3, c2, setForm]);

  const preview = `${a2}${letter}${b3}${a2 || b3 || c2 ? " IR" : ""}${c2}`;

  return (
    <div className="w-full mb-2">
      <div className="flex items-center gap-2">
        {/* 2 digits */}
        <input
          inputMode="numeric"
          maxLength={2}
          value={a2}
          onChange={(e) => setA2(onlyDigits(e.target.value, 2))}
          placeholder="NN"
          className="w-16 border p-2 text-center"
          required
        />

        {/* Persian letter */}
        <select
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          className="w-20 border p-2 text-center"
          aria-label="Persian letter"
        >
          {PERSIAN_LETTERS.map((ch) => (
            <option key={ch} value={ch}>
              {ch}
            </option>
          ))}
        </select>

        {/* 3 digits */}
        <input
          inputMode="numeric"
          maxLength={3}
          value={b3}
          onChange={(e) => setB3(onlyDigits(e.target.value, 3))}
          placeholder="NNN"
          className="w-20 border p-2 text-center"
          required
        />

        {/* IR literal */}
        <span className="px-2 font-medium select-none">IR</span>

        {/* region 2 digits */}
        <input
          inputMode="numeric"
          maxLength={2}
          value={c2}
          onChange={(e) => setC2(onlyDigits(e.target.value, 2))}
          placeholder="NN"
          className="w-16 border p-2 text-center"
          required
        />
      </div>

      {/* Hidden/real field that your form submits & HTML5-validates */}
      <input
        type="hidden"
        name="car_number"
        value={form.car_number || ""}
        required
        pattern="^[0-9]{2}[بپتثجچحخدرزسشصطظعفقکگلمنوهی][0-9]{3}\s?IR\s?[0-9]{2}$"
      />
    </div>
  );
}
