import React, { useState, useEffect } from 'react';
import { convertJalaliToGregorian } from "../../utils/dateHelpers";

const initialForm = {
  owner_delivery_date: "1404/--/--",
  number_of_rings: "0",
  owner_delivery_count: "0",
  owner_delivery_type_a: "0",
  owner_delivery_type_b: "0",
  owner_delivery_type_c: "0",
  auction_a: "0",
  auction_b: "0",
  auction_c: "0",
  remained_a: "0",
  remained_b: "0",
  remained_c: "0",
  depository_confirmation: "",
  depository_description: "",
};

const toInt = (v) => {
  if (v === null || v === undefined || v === "" || v === "null") return 0;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 0 : n;
};

const BulkEditForm = ({ selectedEntries = [], onSubmit, onClose }) => {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    // reset form whenever the selected entries change / form opens
    setForm(initialForm);
  }, [selectedEntries]);

  // Keep owner_delivery_count auto-calculated from A/B/C types
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };

    // compute owner_delivery_count from the three type fields
    const a = toInt(updated.owner_delivery_type_a);
    const b = toInt(updated.owner_delivery_type_b);
    const c = toInt(updated.owner_delivery_type_c);
    updated.owner_delivery_count = (a + b + c).toString();

    // NOTE: intentionally do NOT compute remained_* or other derived fields here.
    // User will provide other values manually.

    setForm(updated);
  };

  const handleDateChange = (e) => {
    const input = e.target.value;

    // If someone tries to edit the year, just reset – same behaviour as single form
    if (!input.startsWith("1404/")) {
      setForm({ ...form, owner_delivery_date: "1404/--/--" });
      return;
    }

    setForm({ ...form, owner_delivery_date: input });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dateToConvert =
      form.owner_delivery_date && form.owner_delivery_date.includes("--")
        ? null
        : form.owner_delivery_date;

    const payload = {
      ...form,
      owner_delivery_date: dateToConvert
        ? convertJalaliToGregorian(dateToConvert)
        : null,
    };

    if (onSubmit) onSubmit({ entryCodes: selectedEntries, depositoryRecord: payload });
    // close after submit
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-200">ویرایش گروهی ({selectedEntries.length} مورد)</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Date + owner_delivery_count (same behavior as single form) */}
          <div className="flex justify-center flex-wrap gap-4 mt-5">
            <div className="relative m-1">
              <input
                type="text"
                name="owner_delivery_date"
                id="owner_delivery_date"
                value={form.owner_delivery_date}
                onChange={handleDateChange}
                pattern="1404/[0-9]{2}/[0-9]{2}"
                placeholder="1404/MM/DD"
                maxLength={10}
                className="peer w-50 h-20 p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff] font-mono"
                dir="ltr"
              />
              <label
                htmlFor="owner_delivery_date"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
              ${
                form.owner_delivery_date && form.owner_delivery_date !== "1404/--/--"
                  ? "top-0 text-xs text-[#5271ff]"
                  : "top-1/4 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
              }
              peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                تاریخ تحویل به صاحب کالا
              </label>
            </div>

            <div className="relative m-1">
              <input
                type="text"
                name="owner_delivery_count"
                id="owner_delivery_count"
                value={form.owner_delivery_count}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
                readOnly
              />
              <label
                htmlFor="owner_delivery_count"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.owner_delivery_count
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                تعداد تحویل به صاحب کالا
              </label>
            </div>
          </div>

          {/* Other input groups (default 0) */}
          <div className="w-fit mx-auto shadow-[inset_0_0_8px_rgba(255,0,0,0.3)] mt-5 px-5">
            <div className="flex justify-center flex-wrap gap-4 mt-5">
              <div className="relative m-1">
                <input
                  type="text"
                  name="owner_delivery_type_a"
                  id="owner_delivery_type_a"
                  value={form.owner_delivery_type_a}
                  onChange={handleChange}
                  className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                  placeholder=""
                />
                <label
                  htmlFor="owner_delivery_type_a"
                  className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.owner_delivery_type_a
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
                >
                  (A) تحویلی نوع
                </label>
              </div>

              <div className="relative m-1">
                <input
                  type="text"
                  name="owner_delivery_type_b"
                  id="owner_delivery_type_b"
                  value={form.owner_delivery_type_b}
                  onChange={handleChange}
                  className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                  placeholder=""
                />
                <label
                  htmlFor="owner_delivery_type_b"
                  className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.owner_delivery_type_b
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
                >
                  (B) تحویلی نوع
                </label>
              </div>

              <div className="relative m-1">
                <input
                  type="text"
                  name="owner_delivery_type_c"
                  id="owner_delivery_type_c"
                  value={form.owner_delivery_type_c}
                  onChange={handleChange}
                  className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                  placeholder=""
                />
                <label
                  htmlFor="owner_delivery_type_c"
                  className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.owner_delivery_type_c
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
                >
                  (C) تحویلی نوع
                </label>
              </div>
            </div>

            <div className="flex justify-center flex-wrap gap-4 mt-5">
              <div className="relative m-1">
                <input
                  type="text"
                  name="auction_a"
                  id="auction_a"
                  value={form.auction_a}
                  onChange={handleChange}
                  className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                  placeholder=""
                />
                <label
                  htmlFor="auction_a"
                  className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.auction_a
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
                >
                  (A) مزایده نوع
                </label>
              </div>

              <div className="relative m-1">
                <input
                  type="text"
                  name="auction_b"
                  id="auction_b"
                  value={form.auction_b}
                  onChange={handleChange}
                  className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                  placeholder=""
                />
                <label
                  htmlFor="auction_b"
                  className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.auction_b
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
                >
                  (B) مزایده نوع
                </label>
              </div>

              <div className="relative m-1">
                <input
                  type="text"
                  name="auction_c"
                  id="auction_c"
                  value={form.auction_c}
                  onChange={handleChange}
                  className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                  placeholder=""
                />
                <label
                  htmlFor="auction_c"
                  className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.auction_c
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
                >
                  (C) مزایده نوع
                </label>
              </div>
            </div>

            <div className="flex justify-center flex-wrap gap-4 mt-5 mb-5">
              <div className="relative m-1">
                <input
                  type="text"
                  name="remained_a"
                  id="remained_a"
                  value={form.remained_a}
                  onChange={handleChange}
                  className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                  placeholder=""
                />
                <label
                  htmlFor="remained_a"
                  className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.remained_a
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
                >
                  (A) باقیمانده نوع
                </label>
              </div>

              <div className="relative m-1">
                <input
                  type="text"
                  name="remained_b"
                  id="remained_b"
                  value={form.remained_b}
                  onChange={handleChange}
                  className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                  placeholder=""
                />
                <label
                  htmlFor="remained_b"
                  className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.remained_b
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
                >
                  (B) باقیمانده نوع
                </label>
              </div>

              <div className="relative m-1">
                <input
                  type="text"
                  name="remained_c"
                  id="remained_c"
                  value={form.remained_c}
                  onChange={handleChange}
                  className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                  placeholder=""
                />
                <label
                  htmlFor="remained_c"
                  className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.remained_c
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
                >
                  (C) باقیمانده نوع
                </label>
              </div>
            </div>
          </div>

          {/* Confirmation toggle and description area simplified for bulk edit */}
          <div className="flex justify-center flex-wrap gap-4 mt-5">
            <div className="relative m-1 w-full">
              <textarea
                name="depository_description"
                value={form.depository_description}
                onChange={handleChange}
                placeholder="توضیحات انباردار"
                className="w-full bg-neutral-900 text-neutral-200 p-3 rounded border border-[#5271ff]/20"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-center items-center gap-2 sm:gap-3 mt-4">
            <button
              className="w-1/4 px-3 sm:px-4 py-2.5 sm:py-3 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-[#52ff8a] hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] bg-green-800 hover:bg-green-900 transition-all duration-300 text-center text-sm sm:text-base"
              type="submit"
            >
              بروزرسانی رکورد انبار
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-1/4 px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-700 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-500 hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] transition-all duration-300 text-center text-sm sm:text-base shadow-[inset_0_0_4px_rgba(255,0,0,0.3)]"
            >
              کنسل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkEditForm;