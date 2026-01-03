import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addLaboratoryRecord,
  updateLaboratoryRecord,
  fetchLaboratoryRecords,
  fetchLaboratoryRecordByEntryCode,
} from "../../features/laboratory/laboratoryThunks";
import { clearSelectedLaboratoryRecord } from "../../features/laboratory/laboratorySlice";
import {
  convertJalaliToGregorian,
  convertGregorianToJalali,
} from "../../utils/dateHelpers";
import { groupList } from "../../data/group";
import TireTypeDropdown from "./TireTypeDropdown";
import { Lock, Unlock } from "lucide-react";

const initialForm = {
  depository_withdrawal_count: "",
  depository_return_date: "1404/--/--",
  depository_return_a: "0",
  depository_return_b: "0",
  depository_return_c: "0",
  // requested_test_code: "",
  tire_type: "",
  radial_bias: "",
  tire_group: "",
  tire_pattern: "",
  load_index: "",
  speed_index: "",
  layer_count: "",
  load_range: "",
  e_mark: "",
  noise: "",
  wet_grip: "",
  energy_label: "",
  tire_wear_indicator: "",
  traction_index: "",
  tire_temperature_index: "",
  tire_weight: "",
  tire_hardness: "",
  section_width: "",
  external_diameter: "",
  tread_depth: "",
  performed_tests: "",
  plunger_5: "",
  rim_test: "",
  rolling_result: "",
  rolling_grade: "",
  noise_result: "",
  wet_grip_result: "",
  wet_grip_grade: "",
  tire_failure_description: "",
  out_of_demand_tests: "",
  laboratory_confirmation: "",
  laboratory_to_depository_lock: "",
};

const LaboratoryRecordsForm = ({ onClose }) => {
  const [form, setForm] = useState(initialForm);
  const dispatch = useDispatch();
  const selected = useSelector(
    (state) => state.laboratoryRecords.selectedLaboratoryRecord
  );
  console.log(form);
  // Toggle function for cycling between choices
  const toggleRadialBias = () => {
    const choices = ["رادیال", "بایاس"];
    const currentIndex = choices.indexOf(form.radial_bias);
    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + 1) % choices.length;

    setForm((prev) => ({
      ...prev,
      radial_bias: choices[nextIndex],
    }));
  };

  useEffect(() => {
    if (selected) {
      const isLocked = selected.laboratory_to_depository_lock ?? false;

      const originalDate = selected.depository_return_date;

      const isGregorianFormat = /^\d{4}-\d{2}-\d{2}/.test(originalDate); // e.g. 2025-07-23

      setForm({
        ...selected,
        depository_return_date: isLocked
          ? convertGregorianToJalali(originalDate)
          : originalDate?.includes("/") // already Jalali
            ? originalDate
            : originalDate
              ? convertGregorianToJalali(originalDate)
              : "1404/--/--",
        laboratory_to_depository_lock: isLocked,
      });
    } else {
      setForm(initialForm);
    }
  }, [selected]);

  // useEffect(() => {
  //   const closeDropdown = () => {
  //     setFilteredCustomers([]);
  //     setFilteredStandard([]);
  //     setFilteredTest([]);
  //   };

  //   window.addEventListener("click", closeDropdown);
  //   return () => window.removeEventListener("click", closeDropdown);
  // }, []);

  const toggleLock = () => {
    if (form.laboratory_to_depository_lock) {
      alert("این فیلد قبلاً قفل شده و دیگر قابل باز کردن نیست.");
      return;
    }

    const confirmed = window.confirm(
      "آیا مطمئن هستید که می‌خواهید فیلد را قفل کنید؟ پس از قفل شدن قابل ویرایش نخواهد بود."
    );
    if (!confirmed) return;

    const dateToConvert = form.depository_return_date.includes("--")
      ? null
      : convertJalaliToGregorian(form.depository_return_date); // ✅ convert to Gregorian

    const updatedForm = {
      ...form,
      laboratory_to_depository_lock: true,
      depository_return_date: dateToConvert, // ✅ safe Gregorian date
    };

    dispatch(
      updateLaboratoryRecord({
        entry_code: selected.entry_code,
        laboratoryRecord: updatedForm,
      })
    ).then(() => {
      dispatch(fetchLaboratoryRecords());
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e) => {
    const input = e.target.value;
    // If someone tries to edit the year, just reset
    if (!input.startsWith("1404/")) {
      setForm({ ...form, depository_return_date: "1404/--/--" });
      return;
    }
    // Allow natural editing after "1404/"
    setForm({ ...form, depository_return_date: input });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;

    const updatedForm = { ...form };

    // If locked, preserve the original date
    if (form.laboratory_to_depository_lock) {
      updatedForm.depository_return_date = selected.depository_return_date;
    } else {
      // If empty or placeholder, remove it completely from payload
      if (
        !form.depository_return_date ||
        form.depository_return_date.includes("--")
      ) {
        delete updatedForm.depository_return_date;
      } else {
        // Convert to Gregorian if provided
        updatedForm.depository_return_date = convertJalaliToGregorian(
          form.depository_return_date
        );
      }
    }

    try {
      await dispatch(
        updateLaboratoryRecord({
          entry_code: selected.entry_code,
          laboratoryRecord: updatedForm,
        })
      ).unwrap();

      await dispatch(fetchLaboratoryRecords());
      dispatch(clearSelectedLaboratoryRecord());
    } catch (error) {
      console.error("Error during submit:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
      <h2 className="text-[#d1aa11] text-center justify-center m-4 ">
        {" "}
        {selected?.entry_code} :کد ردیابی انتخابی شما جهت افزودن اطلاعات آزمون
      </h2>
      <div className="flex flex_wrap gap-1 mt-5 ">
        <div className="relative w-1/3 mx-auto shadow-[inset_0_0_4px_rgba(168,85,247,0.3)] p-5 mt-6">
          <label
            htmlFor="receptory_info"
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neutral-900 px-4 py-1 text-xl text-[#a855f7] border border-[#a855f7]/20 rounded-md"
          >
            اطلاعات پذیرش
          </label>
          <div className="flex justify-center flex-wrap gap-4 mt-10">
            <div className="relative m-1">
              <input
                type="text"
                name="customers"
                id="customers"
                value={form.customers}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#a855f7]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]"
                placeholder=""
                readOnly
              />
              <label
                htmlFor="laboratoryRecord.customers"
                className="absolute top-0 right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-[#a855f7] transition-all"
              >
                مشتری این تست
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="standard"
                id="standard"
                value={form.standard}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#a855f7]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]"
                placeholder=""
                readOnly
              />
              <label
                htmlFor="laboratoryRecord.standard"
                className="absolute top-0 right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-[#a855f7] transition-all"
              >
                استاندارد
              </label>
            </div>
            <div className="relative m-1">
              <ul className="peer  p-2 text-right bg-neutral-900 border border-[#a855f7]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]">
                {selected.tests && selected.tests.length > 0 ? (
                  selected.tests.map((test, index) => (
                    <li className="mt-5 text-right" key={index} dir="rtl">
                      تست {index + 1} : {test}
                    </li>
                  ))
                ) : (
                  <li className="mt-5 text-right" dir="rtl">
                    ثبت نشده
                  </li>
                )}
              </ul>

              {/* <input
                type="text"
                name="tests"
                id="tests"
                value={form.tests}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#a855f7]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]"
                placeholder=""
                readOnly
              /> */}
              <label
                htmlFor="laboratoryRecord.tests"
                className="absolute top-0 right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-[#a855f7] transition-all"
              >
                تست
              </label>
            </div>
          </div>
        </div>

        <div className="relative w-1/3 mx-auto shadow-[inset_0_0_4px_rgba(255,255,0,0.3)] p-5 mt-6">
          <label
            htmlFor="tire_test_info"
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neutral-900 px-4 py-1 text-xl text-[#d1aa11] border border-[#d1aa11]/20 rounded-md"
          >
            تعیین وضعیت نمونه‌ها
          </label>
          <button
            className="group relative px-1 py-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 
             hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-400 
             text-black font-bold rounded-xl
             shadow-[0_0_20px_rgba(255,255,0,0.3)] 
             hover:shadow-[0_0_30px_rgba(255,255,0,0.6),0_0_60px_rgba(255,255,0,0.2)]
             border-2 border-yellow-300/50 hover:border-yellow-200
             transform hover:scale-105 transition-all duration-300 ease-out
             before:absolute before:inset-0 before:rounded-xl 
             before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
             before:translate-x-[-100%] hover:before:translate-x-[100%] 
             before:transition-transform before:duration-700
             overflow-hidden"
            type="button"
            onClick={toggleLock}
          >
            <span className="relative z-10 flex items-center gap-2">
              {form.laboratory_to_depository_lock ? (
                <Lock className="w-4 h-4 drop-shadow-sm" />
              ) : (
                <Unlock className="w-4 h-4 drop-shadow-sm" />
              )}
            </span>

            {/* Animated border glow */}
            <div
              className="absolute inset-0 rounded-xl border-2 border-yellow-200/0 
                  group-hover:border-yellow-200/70 
                  transition-all duration-300 
                  animate-pulse group-hover:animate-none"
            ></div>
          </button>
          <div className="flex justify-center flex-wrap gap-4 mt-10">
            <div className="relative m-1">
              <input
                type="text"
                name="depository_withdrawal_count"
                id="depository_withdrawal_count"
                value={form.depository_withdrawal_count}
                disabled={form.laboratory_to_depository_lock}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="depository_withdrawal_count"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.depository_withdrawal_count
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                تعداد انتقال از {form.number_of_rings} عدد موجود
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="depository_return_date"
                id="depository_return_date"
                value={form.depository_return_date}
                disabled={form.laboratory_to_depository_lock}
                onChange={handleDateChange}
                pattern="(1404/[0-9]{2}/[0-9]{2})?"
                maxLength={10}
                className="peer w-50 h-20 p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff] font-mono"
                dir="ltr"
              />

              <label
                htmlFor="depository_return_date"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
              ${
                form.depository_return_date &&
                form.depository_return_date !== "1404/--/--"
                  ? "top-0 text-xs text-[#5271ff]"
                  : "top-1/4 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
              }
              peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                تاریخ برگشت به انبار
              </label>
            </div>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-5">
            <div className="relative m-1">
              <input
                type="text"
                name="depository_return_a"
                id="depository_return_a"
                value={form.depository_return_a}
                disabled={form.laboratory_to_depository_lock}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="depository_return_a"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.depository_return_a
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                (A) تعداد برگشتی
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="depository_return_b"
                id="depository_return_b"
                value={form.depository_return_b}
                disabled={form.laboratory_to_depository_lock}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="depository_return_b"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.depository_return_b
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                (B) تعداد برگشتی
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="depository_return_c"
                id="depository_return_c"
                value={form.depository_return_c}
                disabled={form.laboratory_to_depository_lock}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="depository_return_c"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.depository_return_c
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                (C) تعداد برگشتی
              </label>
            </div>
          </div>
        </div>

        <div className="relative w-1/3 mx-auto shadow-[inset_0_0_4px_rgba(0,255,0,0.3)] p-5 mt-6">
          <label
            htmlFor="newEntry_info"
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neutral-900 px-4 py-1 text-xl text-[#00ffae] border border-[#00ffae]/20 rounded-md"
          >
            اطلاعات ورودی
          </label>

          <div className="flex justify-center flex-wrap gap-4 mt-10">
            <div className="relative m-1">
              <input
                type="text"
                name="entry_category"
                id="entry_category"
                value={form.entry_category}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#00ffae]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#00ffae] focus:ring-1 focus:ring-[#00ffae]"
                placeholder=""
                readOnly
              />
              <label
                htmlFor="laboratoryRecord.entry_category"
                className="absolute top-0 right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-[#00ffae] transition-all"
              >
                دسته
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="brand"
                id="brand"
                value={form.brand}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#00ffae]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#00ffae] focus:ring-1 focus:ring-[#00ffae]"
                placeholder=""
                readOnly
              />
              <label
                htmlFor="laboratoryRecord.brand"
                className="absolute top-0 right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-[#00ffae] transition-all"
              >
                مارک تجاری
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="size"
                id="size"
                value={form.size}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#00ffae]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#00ffae] focus:ring-1 focus:ring-[#00ffae]"
                placeholder=""
                readOnly
              />
              <label
                htmlFor="laboratoryRecord.size"
                className="absolute top-0 right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-[#00ffae] transition-all"
              >
                سایز
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="production_week_year"
                id="production_week_year"
                value={selected.production_week_year}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#00ffae]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#00ffae] focus:ring-1 focus:ring-[#00ffae]"
                placeholder=""
                readOnly
              />
              <label
                htmlFor="laboratoryRecord.production_week_year"
                className="absolute top-0 right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-[#00ffae] transition-all"
              >
                هفته_سال
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex_wrap gap-4 mt-10">
        <div className="relative w-1/2 mx-auto shadow-[inset_0_0_4px_rgba(255,255,0,0.3)] p-5 mt-6">
          <label
            htmlFor="tire_info"
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neutral-900 px-4 py-1 text-xl text-[#d1aa11] border border-[#d1aa11]/20 rounded-md"
          >
            اطلاعات روی تایر
          </label>
          <div className="flex justify-center flex-wrap gap-4 mt-10">
            <div className="relative m-1">
              <TireTypeDropdown form={form} handleChange={handleChange} />
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="radial_bias"
                id="radial_bias"
                value={form.radial_bias}
                onClick={
                  form.entry_category === "تایر" ? toggleRadialBias : undefined
                }
                readOnly
                disabled={form.entry_category !== "تایر"}
                className="peer w-50 h-20 p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff] cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder=""
              />

              <label
                htmlFor="radial_bias"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.radial_bias
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                {form.entry_category === "تایر"
                  ? "(کلیک کنید) رادیال/بایاس"
                  : form.entry_category || "—"}
              </label>
            </div>

            <div className="relative m-1">
              <select
                name="tire_group"
                id="tire_group"
                value={form.tire_group}
                onChange={handleChange}
                className="peer w-[12rem] h-20 p-2 pl-8 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff] appearance-none cursor-pointer"
              >
                <option value="" disabled className="text-neutral-400">
                  انتخاب گروه
                </option>
                {groupList.map((group, index) => (
                  <option
                    key={index}
                    value={group}
                    className="bg-neutral-900 text-neutral-200"
                  >
                    {group}
                  </option>
                ))}
              </select>
              <label
                htmlFor="tire_group"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all pointer-events-none
      ${
        form.tire_group
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]"
      }`}
              >
                گروه
              </label>
              {/* Custom dropdown arrow */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-5">
            <div className="relative m-1">
              <input
                type="text"
                name="tire_pattern"
                id="tire_pattern"
                value={form.tire_pattern}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="tire_pattern"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.tire_pattern
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                طرح آج
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="tire_wear_indicator"
                id="tire_wear_indicator"
                value={form.tire_wear_indicator}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="tire_wear_indicator"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.tire_wear_indicator
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                سایش تایر
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="layer_count"
                id="layer_count"
                value={form.layer_count}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="layer_count"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.layer_count
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                تعداد لایه
              </label>
            </div>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-5">
            <div className="relative m-1">
              <input
                type="text"
                name="noise"
                id="noise"
                value={form.noise}
                onChange={handleChange}
                className="peer w-10 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="noise"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.noise
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                S
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="wet_grip"
                id="wet_grip"
                value={form.wet_grip}
                onChange={handleChange}
                className="peer w-10 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="wet_grip"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.wet_grip
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                W
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="energy_label"
                id="energy_label"
                value={form.energy_label}
                onChange={handleChange}
                className="peer w-10 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="energy_label"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.energy_label
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                R
              </label>
            </div>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-5">
            <div className="relative m-1">
              <input
                type="text"
                name="load_range"
                id="load_range"
                value={form.load_range}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="load_range"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.load_range
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                دامنه بار
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="traction_index"
                id="traction_index"
                value={form.traction_index}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="traction_index"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.traction_index
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                چنگ‌زنی تایر
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="e_mark"
                id="e_mark"
                value={form.e_mark}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="e_mark"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.e_mark
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                E_mark
              </label>
            </div>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-5">
            <div className="relative m-1">
              <input
                type="text"
                name="speed_index"
                id="speed_index"
                value={form.speed_index}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="speed_index"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.speed_index
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                شاخص سرعت
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="load_index"
                id="load_index"
                value={form.load_index}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="load_index"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.load_index
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                شاخص بار
              </label>
            </div>

            <div className="relative m-1">
              <input
                type="text"
                name="tire_temperature_index"
                id="tire_temperature_index"
                value={form.tire_temperature_index}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="tire_temperature_index"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.tire_temperature_index
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                شاخص دما
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="tire_weight"
                id="tire_weight"
                value={form.tire_weight}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="tire_weight"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.tire_weight
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                شاخص وزن
              </label>
            </div>
          </div>
        </div>

        <div className="relative w-1/2 mx-auto shadow-[inset_0_0_4px_rgba(255,255,0,0.3)] p-5 mt-6">
          <label
            htmlFor="laboratory_info"
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neutral-900 px-4 py-1 text-xl text-[#d1aa11] border border-[#d1aa11]/20 rounded-md"
          >
            نتایج آزمون‌ها
          </label>
          <div className="flex justify-center flex-wrap gap-4 mt-10">
            <div className="relative m-1">
              <input
                type="text"
                name="tire_hardness"
                id="tire_hardness"
                value={form.tire_hardness}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="tire_hardness"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.tire_hardness
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                سختی
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="section_width"
                id="section_width"
                value={form.section_width}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="section_width"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.section_width
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                عرض مقطع
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="external_diameter"
                id="external_diameter"
                value={form.external_diameter}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="external_diameter"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.external_diameter
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                قطر خارجی
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="tread_depth"
                id="tread_depth"
                value={form.tread_depth}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="tread_depth"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.tread_depth
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                عمق آج
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="performed_tests"
                id="performed_tests"
                value={form.performed_tests}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="performed_tests"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.performed_tests
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                تست انجام‌شده
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="plunger_5"
                id="plunger_5"
                value={form.plunger_5}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="plunger_5"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.plunger_5
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                plunger_5
              </label>
            </div>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-5">
            <div className="relative m-1">
              <input
                type="text"
                name="rim_test"
                id="rim_test"
                value={form.rim_test}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="rim_test"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.rim_test
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                آزمون طوقه
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="rolling_result"
                id="rolling_result"
                value={form.rolling_result}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="rolling_result"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.rolling_result
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                نتیجه رولینگ
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="rolling_grade"
                id="rolling_grade"
                value={form.rolling_grade}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="rolling_grade"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.rolling_grade
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                گروه رولینگ
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="noise_result"
                id="noise_result"
                value={form.noise_result}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="noise_result"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.noise_result
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                نتیجه نویز
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="wet_grip_result"
                id="wet_grip_result"
                value={form.wet_grip_result}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="wet_grip_result"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.wet_grip_result
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                نتیجه چسبندگی
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="wet_grip_grade"
                id="wet_grip_grade"
                value={form.wet_grip_grade}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="wet_grip_grade"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.wet_grip_grade
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                گروه چسبندگی
              </label>
            </div>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-5">
            <div className="relative m-1">
              <input
                type="text"
                name="tire_failure_description"
                id="tire_failure_description"
                value={form.tire_failure_description}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="tire_failure_description"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.tire_failure_description
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                توضیح خرابی تایر
              </label>
            </div>
            <div className="relative m-1">
              <input
                type="text"
                name="out_of_demand_tests"
                id="out_of_demand_tests"
                value={form.out_of_demand_tests}
                onChange={handleChange}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
              />
              <label
                htmlFor="out_of_demand_tests"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.out_of_demand_tests
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                آزمون‌های خارج از درخواست
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center flex-wrap gap-4 mt-5">
        <div className="relative m-1">
          {/* Label positioned at top-right and always visible */}
          <label
            htmlFor="laboratory_confirmation_toggle"
            className="absolute -top-2 right-2 rounded-md bg-neutral-900 px-2 py-1 text-xs text-[#d1aa11] z-10 border border-[#d1aa11]/20"
          >
            نتیجه آزمون
          </label>

          <div className="w-50 h-20 p-2 bg-neutral-900 border border-[#d1aa11]/20 rounded flex items-center justify-center mt-3">
            <div className="relative inline-flex items-center gap-3">
              {/* Toggle background */}
              <div
                className={`w-20 h-8 rounded-full cursor-pointer transition-colors duration-300 relative ${
                  form.laboratory_confirmation === "yes"
                    ? "bg-green-600"
                    : form.laboratory_confirmation === "no"
                      ? "bg-red-600"
                      : "bg-neutral-600"
                }`}
                onClick={() => {
                  if (form.laboratory_confirmation === "yes") {
                    setForm({ ...form, laboratory_confirmation: "no" });
                  } else {
                    setForm({ ...form, laboratory_confirmation: "yes" });
                  }
                }}
              >
                {/* Toggle circle */}
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    form.laboratory_confirmation === "yes"
                      ? "translate-x-12"
                      : "translate-x-1"
                  }`}
                />

                {/* Optional: Add Yes/No text inside toggle */}
                <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium text-white">
                  <span
                    className={`transition-opacity duration-300 ${
                      form.laboratory_confirmation === "no"
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    مردود
                  </span>
                  <span
                    className={`transition-opacity duration-300 ${
                      form.laboratory_confirmation === "yes"
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    قبول
                  </span>
                </div>
              </div>

              {/* Status text */}
              <div className="text-xs sm:text-sm text-neutral-200 font-medium">
                {form.laboratory_confirmation === "yes"
                  ? "✓ قبول"
                  : form.laboratory_confirmation === "no"
                    ? "✗ مردود"
                    : "انتخاب کنید"}
              </div>
            </div>
          </div>

          {/* Hidden input for form handling */}
          <input
            type="hidden"
            id="depository_confirmation_toggle"
            name="depository_confirmation"
            value={form.laboratory_confirmation || ""}
          />
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 sm:gap-3 mt-4">
        <button
          className="w-1/4 px-3 sm:px-4 py-2.5 sm:py-3 border border-[#d1aa11]/20 rounded-lg text-neutral-400 hover:text-white hover:border-[#d1aa11] hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] bg-green-800 hover:bg-green-900 transition-all duration-300 text-center text-sm sm:text-base"
          type="submit"
        >
          افزودن اطلاعات آزمون تایر
        </button>

        <button
          type="button"
          onClick={onClose} // receives from parent
          className="w-1/4 px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-700 border border-[#d1aa11]/20 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-500 hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] transition-all duration-300 text-center text-sm sm:text-base shadow-[inset_0_0_4px_rgba(255,255,0,0.3)]"
        >
          کنسل
        </button>
      </div>
    </form>
  );
};

export default LaboratoryRecordsForm;
