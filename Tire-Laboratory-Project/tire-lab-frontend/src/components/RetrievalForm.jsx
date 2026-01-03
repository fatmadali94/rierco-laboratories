// components/RetrievalForm.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  submitRetrievalFormThunk,
  resetSubmittedId,
} from "../features/retrievalForm/retrievalFormSlice";
import { fetchEntryCodesThunk } from "../features/retrievalForm/retrievalFormSlice";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  convertJalaliToGregorian,
  convertGregorianToJalali,
} from "../utils/dateHelpers";
import CarNumberInput from "./CarNumberInput";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/retrievalForm`;

const initialFormState = {
  pickup_name: "",
  car_number: "",
  pickup_date: "",
  pickup_hour: "",
  entryCodes: [], // list of codes (fetched later)
  selectedCodes: [], // which codes are checked
  counts: {}, // { code: count }
};

function RetrievalForm() {
  const dispatch = useDispatch();
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [counts, setCounts] = useState({});
  const [form, setForm] = useState(initialFormState);
  const { lastSubmittedId } = useSelector((state) => state.retrievalForm);
  const entryCodes = useSelector((state) => state.retrievalForm.entryCodes);

  const normalizeDigits = (str = "") =>
    str.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

  function toYYYYMMDD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Store Gregorian in form.pickup_date (YYYY-MM-DD)
  const handleDateChange = (dateObj) => {
    if (!dateObj) {
      setForm((prev) => ({ ...prev, pickup_date: "" }));
      return;
    }
    // Get native JS Date (Gregorian) from the picker
    const gDate = dateObj.toDate(); // ✅ no conversions, timezone-safe calendar date
    const gregorianStr = toYYYYMMDD(gDate);
    setForm((prev) => ({ ...prev, pickup_date: gregorianStr }));
  };

  // Show Jalali in the picker from stored Gregorian
  const displayJalali = convertGregorianToJalali(form.pickup_date); // "YYYY/MM/DD"

  useEffect(() => {
    dispatch(fetchEntryCodesThunk());
  }, [dispatch]);

  const handleCheckboxChange = (code) => {
    setSelectedCodes((prev) => {
      if (prev.includes(code)) {
        const updated = prev.filter((c) => c !== code);
        const newCounts = { ...counts };
        delete newCounts[code];
        setCounts(newCounts);
        return updated;
      } else {
        return [...prev, code];
      }
    });
  };

  const handleCountChange = (code, value) => {
    setCounts((prev) => ({
      ...prev,
      [code]: value,
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setForm(() => ({
      ...initialFormState,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedCodes.length === 0)
      return alert("Please select at least one entry_code.");
    if (selectedCodes.some((code) => !counts[code]))
      return alert("Please enter ring count for all selected codes.");

    const formData = {
      ...form,
      entry_codes: selectedCodes,
      count: selectedCodes.map((code) => counts[code]),
    };

    dispatch(submitRetrievalFormThunk(formData));
  };

  useEffect(() => {
    if (lastSubmittedId) {
      window.open(
        `${BASE_URL}/retrieval-forms/${lastSubmittedId}/print`,
        "_blank"
      );
      dispatch(resetSubmittedId());
    }
  }, [lastSubmittedId]);

  return (
    <form
      onSubmit={handleSubmit}
      dir="rtl"
      className="mx-auto mt-8 max-w-2xl rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100/60 dark:bg-zinc-900 dark:ring-zinc-800"
    >
      {/* Header */}
      <header className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
          ایجاد فرم خروج تایر
        </h2>
      </header>

      <fieldset className="space-y-5">
        {/* Pickup Name */}
        <div className="grid gap-2">
          <label
            htmlFor="pickup_name"
            className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-zinc-200"
          >
            نام تحویل‌گیرنده
          </label>
          <input
            id="pickup_name"
            type="text"
            name="pickup_name"
            value={form.pickup_name}
            onChange={handleFormChange}
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition
                   placeholder:text-gray-400
                   focus:border-transparent focus:ring-2 focus:ring-indigo-500/70
                   dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Car Number */}
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-zinc-200">
            شماره پلاک خودرو
          </label>
          <div
            dir="ltr"
            className="rounded-xl border border-gray-200 p-3 dark:border-zinc-700"
          >
            <CarNumberInput form={form} setForm={setForm} />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-200">
              تاریخ
            </label>
            <DatePicker
              value={convertGregorianToJalali(form.pickup_date)}
              onChange={handleDateChange}
              calendar={persian}
              locale={persian_fa}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition
                     focus:border-transparent focus:ring-2 focus:ring-indigo-500/70
                     dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="pickup_hour"
              className="text-sm font-medium text-gray-700 dark:text-zinc-200"
            >
              ساعت
            </label>
            <input
              id="pickup_hour"
              type="time"
              name="pickup_hour"
              value={form.pickup_hour}
              onChange={handleFormChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition
                     focus:border-transparent focus:ring-2 focus:ring-indigo-500/70
                     dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>
      </fieldset>

      <h3 className="font-bold mb-2">کدهای ورودی:</h3>
      <div className="mb-4 max-h-48 overflow-y-auto border rounded p-2">
        {entryCodes.length === 0 ? (
          <p className="text-gray-500">هیچ کد ورودی یافت نشد.</p>
        ) : (
          entryCodes.map((code) => (
            <div key={code} className="flex items-center mb-1">
              <input
                type="checkbox"
                checked={selectedCodes.includes(code)}
                onChange={() => handleCheckboxChange(code)}
                className="mr-2"
              />
              <span className="mr-4">{code}</span>
              {selectedCodes.includes(code) && (
                <input
                  type="number"
                  min="1"
                  placeholder="تعداد حلقه"
                  value={counts[code] || ""}
                  onChange={(e) => handleCountChange(code, e.target.value)}
                  className="border p-1 w-24 ml-2"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 flex items-center justify-between gap-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center rounded-xl border border-yellow-200 px-4 py-2 text-sm font-medium text-gray-700 transition
                   hover:bg-gray-50 active:scale-[0.99]
                   dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
          >
            restart
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition
                   hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:ring-offset-2
                   active:scale-[0.99] disabled:opacity-50 dark:focus:ring-offset-zinc-900"
          >
            ثبت فرم
          </button>
        </div>
      </footer>
    </form>
  );
}

export default RetrievalForm;
