import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addReceptoryRecord,
  updateReceptoryRecord,
  fetchReceptoryRecords,
} from "../../features/receptory/receptoryThunks";
import { clearSelectedReceptoryRecord } from "../../features/receptory/receptorySlice";
import { standardsList } from "../../data/standard";
import { testsList } from "../../data/test";
import {
  addCustomer,
  searchCustomers,
} from "../../features/tire_data/customers";
import { clearSearchList as clearCustomers } from "../../features/tire_data/customers";

const initialForm = {
  customers: "",
  standard: "",
  tests: [],
  receptory_confirmation: "",
};

const ReceptoryRecordsForm = ({ onClose }) => {
  const [form, setForm] = useState(initialForm);
  const dispatch = useDispatch();
  const selected = useSelector(
    (state) => state.receptoryRecords.selectedReceptoryRecord
  );
  const [filteredStandard, setFilteredStandard] = useState([]);
  const [testInput, setTestInput] = useState("");

  // New state for dropdown functionality
  const [showDropdown, setShowDropdown] = useState(false);

  const { searchList: customers, loading: customersLoading } = useSelector(
    (state) => state.customers
  );

  useEffect(() => {
    if (selected) {
      setForm({
        customers: selected.customers || "",
        standard: selected.standard || "",
        tests: Array.isArray(selected.tests) ? selected.tests : [],
        receptory_confirmation: selected.receptory_confirmation || "",
      });
      setTestInput("");
    } else {
      setForm(initialForm);
    }
  }, [selected]);

  useEffect(() => {
    const closeDropdown = () => {
      setFilteredStandard([]);
      setShowDropdown(false); // Close tests dropdown too
    };
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "customers") {
      setForm((prev) => ({ ...prev, customers: value }));
      if (value.trim()) {
        dispatch(searchCustomers(value));
      } else {
        dispatch(clearCustomers());
      }
    } else if (name === "standard") {
      const matches = standardsList.filter((standard) =>
        standard.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStandard(matches.slice(0, 10));
      setForm((prev) => ({ ...prev, standard: value }));
    } else if (name === "tests") {
      setTestInput(value);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // New handler for adding custom test from input
  const handleAddTest = () => {
    if (testInput.trim() && !form.tests.includes(testInput.trim())) {
      setForm({ ...form, tests: [...form.tests, testInput.trim()] });
      setTestInput("");
    }
  };

  // New handler for selecting from dropdown
  const handleSelectFromDropdown = (test) => {
    if (!form.tests.includes(test)) {
      setForm({ ...form, tests: [...form.tests, test] });
    }
    setShowDropdown(false);
  };

  // Optional: Handle Enter key to add test
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTest();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.customers.trim()) {
      await dispatch(addCustomer(form.customers.trim())).unwrap();
    }

    const cleanedFormData = {
      customers: form.customers,
      standard: form.standard,
      tests: form.tests,
      receptory_confirmation: form.receptory_confirmation,
    };

    const entryCode = selected?.entry_code || form.entry_code;

    dispatch(
      updateReceptoryRecord({
        entry_code: entryCode,
        receptoryRecord: cleanedFormData,
      })
    ).then(() => {
      dispatch(fetchReceptoryRecords());
      setForm(initialForm);
      dispatch(clearSelectedReceptoryRecord());
      dispatch(clearCustomers()); // Close dropdown after submit
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <h2 className="text-[#83358F] text-center justify-center m-4 ">
        {" "}
        {selected.entry_code} :پذیرش کد ردیابی
      </h2>
      <div className="flex flex-wrap gap-1 mt-5">
        <div className="relative w-full mx-auto shadow-[inset_0_0_4px_rgba(0,255,0,0.3)] p-5 mt-5">
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
                value={selected.entry_category}
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
                value={selected.brand}
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
                value={selected.size}
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
                name="seal_number"
                id="seal_number"
                value={selected.seal_number}
                className="peer w-50 h-20  p-2 bg-neutral-900 border border-[#00ffae]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#00ffae] focus:ring-1 focus:ring-[#00ffae]"
                placeholder=""
                readOnly
              />
              <label
                htmlFor="laboratoryRecord.seal_number"
                className="absolute top-0 right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-[#00ffae] transition-all"
              >
                شماره پلمپ
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
        <div className="flex justify-center mx-auto gap-4 mt-10">
          <div className="relative m-1">
            <input
              name="customers"
              onClick={(e) => e.stopPropagation()}
              value={form.customers}
              onChange={handleChange}
              placeholder=""
              autoComplete="off"
              className="peer w-50 h-20 p-2 w-full bg-neutral-900 border border-[#5271ff]/20 rounded text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
            />
            <label
              htmlFor="customers"
              className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.customers
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
            >
              متقاضی
            </label>

            {customers.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-neutral-800 shadow-lg border border-[#5271ff]/20">
                {customers.map((customer) => (
                  <li
                    key={customer.id}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, customer: customer.name }));
                      dispatch(clearCustomers());
                    }}
                    className="px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700 cursor-pointer"
                  >
                    {customer.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative m-1">
            <input
              name="standard"
              onClick={(e) => e.stopPropagation()}
              value={form.standard}
              onChange={handleChange}
              placeholder=""
              autoComplete="off"
              className="peer w-50 h-20 p-2 w-full bg-neutral-900 border border-[#5271ff]/20 rounded text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
            />
            <label
              htmlFor="standard"
              className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.standard
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
            >
              استاندارد
            </label>

            {filteredStandard.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-neutral-800 shadow-lg border border-[#5271ff]/20">
                {filteredStandard.map((standard) => (
                  <li
                    key={standard}
                    onClick={() => {
                      setForm({ ...form, standard });
                      setFilteredStandard([]);
                    }}
                    className="px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700 cursor-pointer"
                  >
                    {standard}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative m-1">
            {/* Input container with dropdown and add button */}
            <div className="relative flex items-center">
              <input
                name="tests"
                value={testInput}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                onClick={(e) => e.stopPropagation()}
                placeholder=""
                autoComplete="off"
                className="peer w-full h-20 p-2 pr-20 bg-neutral-900 border border-[#a855f7]/20 rounded-l text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]"
              />

              {/* Dropdown button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="absolute right-10 z-10 sm:right-30 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-[#a855f7] focus:outline-none"
              >
                <svg
                  className="w-4 h-4"
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
              </button>

              {/* Add button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddTest();
                }}
                className="h-20 px-3 bg-[#a855f7] hover:bg-[#a855f7]/80 rounded-r text-white focus:outline-none focus:ring-1 focus:ring-[#a855f7] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            {/* Floating label */}
            <label
              htmlFor="tests"
              className={`absolute right-14 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all pointer-events-none
      ${
        form.tests.length > 0 || testInput
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 pr-2 peer-focus:text-xs peer-focus:text-[#5271ff]`}
            >
              تست درخواستی
            </label>

            {/* Dropdown options */}
            {showDropdown && (
              <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-neutral-800 shadow-lg border border-[#5271ff]/20">
                {testsList.map((test) => (
                  <li
                    key={test}
                    onClick={() => handleSelectFromDropdown(test)}
                    className="px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700 cursor-pointer flex items-center justify-between"
                  >
                    <span>{test}</span>
                    {form.tests.includes(test) && (
                      <svg
                        className="w-4 h-4 text-[#5271ff]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Display selected tests as pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-[#5271ff]/10 text-[#5271ff] px-2 py-1 rounded-full text-xs"
                >
                  {test}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.tests.filter((_, i) => i !== index);
                      setForm({ ...form, tests: updated });
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center flex-wrap gap-4 mt-5">
        <div className="relative m-1">
          {/* Label positioned at top-right and always visible */}
          <label
            htmlFor="receptory_confirmation_toggle"
            className="absolute -top-2 right-2 rounded-md bg-neutral-900 px-2 py-1 text-xs text-[#5271ff] z-10 border border-[#5271ff]/20"
          >
            این ورودی را پذیرش کردید؟
          </label>

          <div className="w-50 h-20 p-2 bg-neutral-900 border border-[#5271ff]/20 rounded flex items-center justify-center mt-3">
            <div className="relative inline-flex items-center gap-3">
              {/* Toggle background */}
              <div
                className={`w-20 h-8 rounded-full cursor-pointer transition-colors duration-300 relative ${
                  form.receptory_confirmation === "yes"
                    ? "bg-green-600"
                    : form.receptory_confirmation === "no"
                      ? "bg-red-600"
                      : "bg-neutral-600"
                }`}
                onClick={() => {
                  if (form.receptory_confirmation === "yes") {
                    setForm({ ...form, receptory_confirmation: "no" });
                  } else {
                    setForm({ ...form, receptory_confirmation: "yes" });
                  }
                }}
              >
                {/* Toggle circle */}
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    form.receptory_confirmation === "yes"
                      ? "translate-x-12"
                      : "translate-x-1"
                  }`}
                />

                {/* Optional: Add Yes/No text inside toggle */}
                <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium text-white">
                  <span
                    className={`transition-opacity duration-300 ${
                      form.receptory_confirmation === "no"
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    خیر
                  </span>
                  <span
                    className={`transition-opacity duration-300 ${
                      form.receptory_confirmation === "yes"
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
                {form.receptory_confirmation === "yes"
                  ? "✓ تایید شده"
                  : form.receptory_confirmation === "no"
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
            value={form.receptory_confirmation || ""}
          />
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 sm:gap-3 mt-4">
        <button
          className="w-1/4 px-3 sm:px-4 py-2.5 sm:py-3 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-[#52ff8a] hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] bg-green-800 hover:bg-green-900 transition-all duration-300 text-center text-sm sm:text-base"
          type="submit"
        >
          پذیرش
        </button>

        <button
          type="button"
          onClick={onClose} // receives from parent
          className="w-1/4 px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-700 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-500 hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] transition-all duration-300 text-center text-sm sm:text-base shadow-[inset_0_0_4px_rgba(168,85,247,0.3)]"
        >
          کنسل
        </button>
      </div>
    </form>
  );
};

export default ReceptoryRecordsForm;
