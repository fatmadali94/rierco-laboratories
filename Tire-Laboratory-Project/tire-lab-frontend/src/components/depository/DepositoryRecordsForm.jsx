import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addDepositoryRecord,
  updateDepositoryRecord,
  fetchDepositoryRecords,
} from "../../features/depository/depositorythunks";
import { clearSelectedDepositoryRecord } from "../../features/depository/depositorySlice";
import {
  convertJalaliToGregorian,
  convertGregorianToJalali,
} from "../../utils/dateHelpers";

const initialForm = {
  owner_delivery_date: "1404/--/--",
  number_of_rings: "",
  owner_delivery_count: "",
  owner_delivery_type_a: "",
  owner_delivery_type_b: "",
  owner_delivery_type_c: "",
  auction_a: "",
  auction_b: "",
  auction_c: "",
  remained_a: "",
  remained_b: "",
  remained_c: "",
  depository_confirmation: "",
  depository_description: "",
};

const DepositoryRecordsForm = ({ onClose }) => {
  const [form, setForm] = useState(initialForm);
  const dispatch = useDispatch();
  const selected = useSelector(
    (state) => state.depositoryRecords.selectedDepositoryRecord
  );
  const labForEntry = useSelector(
    (state) => state.laboratoryRecords?.byEntryCode?.[selected?.entry_code]
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const clampNonNegative = (n) => (n < 0 ? 0 : n);
  const toInt = (v) => {
    if (v === null || v === undefined || v === "" || v === "null") return 0;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? 0 : n;
  };

  const computeRemained = (vals) => {
    const v = (k) => toInt(vals[k]);

    const remained_a = clampNonNegative(
      v("number_of_rings") -
        (v("depository_return_b") +
          v("depository_return_c") +
          v("owner_delivery_type_a") +
          v("auction_a"))
    );

    const remained_b = clampNonNegative(
      v("depository_return_b") - (v("owner_delivery_type_b") + v("auction_b"))
    );

    const remained_c = clampNonNegative(
      v("depository_return_c") - (v("owner_delivery_type_c") + v("auction_c"))
    );

    return {
      remained_a: remained_a.toString(),
      remained_b: remained_b.toString(),
      remained_c: remained_c.toString(),
    };
  };

  const normalize = (val) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? 0 : num;
  };

  const getVal = (key) => normalize(selected?.[key]);

  useEffect(() => {
    console.log("🛠 Selected from store:", selected);
    console.log("🧪 Lab for entry_code:", labForEntry);

    if (!selected) {
      setForm(initialForm);
      setConfirmed(false);
      return;
    }

    // Merge depository + lab (lab can be undefined initially)
    const merged = { ...selected, ...(labForEntry ?? {}) };

    const normalized = {
      ...merged,

      // normalize numerics (null/"null"/"" → 0)
      number_of_rings: toInt(merged.number_of_rings),

      auction_a: toInt(merged.auction_a),
      auction_b: toInt(merged.auction_b),
      auction_c: toInt(merged.auction_c),

      owner_delivery_type_a: toInt(merged.owner_delivery_type_a),
      owner_delivery_type_b: toInt(merged.owner_delivery_type_b),
      owner_delivery_type_c: toInt(merged.owner_delivery_type_c),

      // lab fields might be missing in prod depository selected:
      depository_return_a: toInt(merged.depository_return_a),
      depository_return_b: toInt(merged.depository_return_b),
      depository_return_c: toInt(merged.depository_return_c),

      owner_delivery_count: toInt(merged.owner_delivery_count),

      owner_delivery_date: merged.owner_delivery_date
        ? convertGregorianToJalali(merged.owner_delivery_date)
        : "1404/--/--",
    };

    // ✅ Always recompute from rule (don’t trust DB remained_* copies)
    const remained = computeRemained(normalized);
    normalized.remained_a = toInt(remained.remained_a);
    normalized.remained_b = toInt(remained.remained_b);
    normalized.remained_c = toInt(remained.remained_c);

    setForm(normalized);
    console.log("🛠 prefilledForm (merged + recomputed):", normalized);

    setConfirmed(merged.depository_confirmation === "yes");
  }, [selected, labForEntry]); // ⬅️ Depend on both slices

  // Regular handleChange for other inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedForm = {
      ...form,
      [name]: value,
    };

    const v = (k) => toInt(updatedForm[k]);

    updatedForm.owner_delivery_count = (
      v("owner_delivery_type_a") +
      v("owner_delivery_type_b") +
      v("owner_delivery_type_c")
    ).toString();

    Object.assign(updatedForm, computeRemained(updatedForm));

    setForm(updatedForm);
  };

  const handleDateChange = (e) => {
    const input = e.target.value;

    // If someone tries to edit the year, just reset
    if (!input.startsWith("1404/")) {
      setForm({ ...form, owner_delivery_date: "1404/--/--" });
      return;
    }

    // Allow natural editing after "1404/"
    setForm({ ...form, owner_delivery_date: input });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected) {
      // Only convert if it's a complete date (not 1404/--/--)
      const dateToConvert =
        form.owner_delivery_date && form.owner_delivery_date.includes("--")
          ? null
          : form.owner_delivery_date;

      const updatedForm = {
        ...form,
        owner_delivery_date: dateToConvert
          ? convertJalaliToGregorian(dateToConvert)
          : null,
      };

      dispatch(
        updateDepositoryRecord({
          entry_code: selected.entry_code,
          depositoryRecord: updatedForm,
        })
      ).then(() => {
        dispatch(fetchDepositoryRecords());
        setForm(initialForm);
        dispatch(clearSelectedDepositoryRecord());
        setConfirmed(false);
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <h2 className="text-[#ff4d4d] text-center justify-center m-4 ">
          {" "}
          {selected.entry_code} :کد ردیابی انتخابی شما جهت بروزرسانی
        </h2>
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
                form.owner_delivery_date &&
                form.owner_delivery_date !== "1404/--/--"
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
              تعداد تحویل به صاحب کالا{" "}
            </label>
          </div>
        </div>

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
                readOnly
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

        <div className="flex justify-center flex-wrap gap-4 mt-5">
          <div className="relative m-1">
            {/* Label positioned at top-right and always visible */}
            <label
              htmlFor="depository_confirmation_toggle"
              className="absolute -top-2 right-2 rounded-md bg-neutral-900 px-2 py-1 text-xs text-[#5271ff] z-10 border border-[#5271ff]/20"
            >
              تعداد تایرهای برگشتی از آزمون تایر را تایید می‌کنید؟
            </label>

            <label className="absolute -bottom-2 right-6 rounded-md bg-neutral-900 px-2 py-1 text-xs text-[#ff5252] z-10 border border-[#ff5252]/20">
              (در صورت تایید دیگر قابل تغییر نخواهد بود)
            </label>

            <div className="w-[18rem] h-20 p-2 bg-neutral-900 border border-[#5271ff]/20 rounded flex items-center justify-center mt-3">
              <div className="relative inline-flex items-center gap-3">
                {/* Toggle background */}
                <div
                  className={`w-20 h-8 rounded-full cursor-pointer transition-colors duration-300 relative ${
                    form.depository_confirmation === "yes"
                      ? "bg-green-600"
                      : form.depository_confirmation === "no"
                        ? "bg-red-600"
                        : "bg-neutral-600"
                  }`}
                  onClick={() => {
                    if (form.depository_confirmation === "yes") {
                      // If already confirmed, do not allow reverting
                      if (confirmed) return;
                      // Allow reverting only if not confirmed before
                      setForm({ ...form, depository_confirmation: "no" });
                    } else {
                      // Open confirmation modal before changing to "yes"
                      setShowConfirmModal(true);
                    }
                  }}
                >
                  {/* Toggle circle */}
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      form.depository_confirmation === "yes"
                        ? "translate-x-12"
                        : "translate-x-1"
                    }`}
                  />

                  {/* Optional: Add Yes/No text inside toggle */}
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium text-white">
                    <span
                      className={`transition-opacity duration-300 ${
                        form.depository_confirmation === "no"
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      خیر
                    </span>
                    <span
                      className={`transition-opacity duration-300 ${
                        form.depository_confirmation === "yes"
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      بله
                    </span>
                  </div>
                </div>

                {/* Status text */}
                <div className="text-xs sm:text-sm text-neutral-200 font-medium">
                  {form.depository_confirmation === "yes"
                    ? "✓ تایید شده"
                    : form.depository_confirmation === "no"
                      ? "✗ تایید نشده"
                      : "انتخاب کنید"}
                </div>
              </div>
            </div>

            {/* Hidden input for form handling */}
            <input
              type="hidden"
              id="depository_confirmation_toggle"
              name="depository_confirmation"
              value={form.depository_confirmation || ""}
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
            onClick={onClose} // receives from parent
            className="w-1/4 px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-700 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-500 hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] transition-all duration-300 text-center text-sm sm:text-base shadow-[inset_0_0_4px_rgba(255,0,0,0.3)]"
          >
            کنسل
          </button>
        </div>
      </form>
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-md w-80 text-center">
            <h2 className="text-lg font-semibold mb-4">
              آیا مطمئن هستید که تایید نهایی انجام شده است؟
            </h2>
            <div className="flex justify-center gap-4">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={() => {
                  setForm({ ...form, depository_confirmation: "yes" });
                  setConfirmed(true);
                  setShowConfirmModal(false);
                }}
              >
                تایید می‌کنم
              </button>
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setForm({ ...form, depository_confirmation: "no" });
                  setShowConfirmModal(false);
                }}
              >
                خیر، تایید نشده
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepositoryRecordsForm;
