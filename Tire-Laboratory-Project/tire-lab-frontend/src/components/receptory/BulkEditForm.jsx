import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
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

const BulkEditForm = ({ selectedEntries = [], onClose = () => {}, onSubmit = null }) => {
  const [form, setForm] = useState(initialForm);
  const dispatch = useDispatch();
  const [filteredStandard, setFilteredStandard] = useState([]);
  const [testInput, setTestInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const { searchList: customers, loading: customersLoading } = useSelector(
    (state) => state.customers
  );

  useEffect(() => {
    // Reset form when opened
    setForm(initialForm);
    setTestInput("");
  }, []);

  useEffect(() => {
    const closeDropdown = () => {
      setFilteredStandard([]);
      setShowDropdown(false);
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

  const handleAddTest = () => {
    if (testInput.trim() && !form.tests.includes(testInput.trim())) {
      setForm({ ...form, tests: [...form.tests, testInput.trim()] });
      setTestInput("");
    }
  };

  const handleSelectFromDropdown = (test) => {
    if (!form.tests.includes(test)) {
      setForm({ ...form, tests: [...form.tests, test] });
    }
    setShowDropdown(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTest();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (form.customers.trim()) {
        await dispatch(addCustomer(form.customers.trim())).unwrap();
      }

      const cleanedFormData = {
        customers: form.customers,
        standard: form.standard,
        tests: form.tests,
        receptory_confirmation: form.receptory_confirmation,
      };

      if (onSubmit) {
        // Call the parent's onSubmit with the form data
        await onSubmit(cleanedFormData);
      }
      
      // Reset form and clear customers
      setForm(initialForm);
      dispatch(clearCustomers());

  // call onClose to close the parent form if provided
  if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting simple receptory form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <h2 className="text-[#83358F] text-center justify-center m-4 ">
        پذیرش گروهی ورودی‌ها
      </h2>

      <div className="flex flex-wrap gap-1 mt-5">
        <div className="relative w-full mx-auto p-5 mt-2">
          <div className="flex justify-center flex-wrap gap-4 mt-2">
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
                        setForm((prev) => ({ ...prev, customers: customer.name }));
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

            <div className="relative m-1">
              <label
                htmlFor="receptory_confirmation_toggle"
                className="absolute -top-2 right-2 rounded-md bg-neutral-900 px-2 py-1 text-xs text-[#5271ff] z-10 border border-[#5271ff]/20"
              >
                این ورودی را پذیرش کردید؟
              </label>

              <div className="w-50 h-20 p-2 bg-neutral-900 border border-[#5271ff]/20 rounded flex items-center justify-center mt-3">
                <div className="relative inline-flex items-center gap-3">
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
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                        form.receptory_confirmation === "yes"
                          ? "translate-x-12"
                          : "translate-x-1"
                      }`}
                    />

                    <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium text-white">
                      <span className={`transition-opacity duration-300 ${form.receptory_confirmation === "no" ? "opacity-100" : "opacity-0"}`}>
                        خیر
                      </span>
                      <span className={`transition-opacity duration-300 ${form.receptory_confirmation === "yes" ? "opacity-100" : "opacity-0"}`}>
                        بله
                      </span>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-neutral-200 font-medium">
                    {form.receptory_confirmation === "yes"
                      ? "✓ تایید شده"
                      : form.receptory_confirmation === "no"
                      ? "✗ تایید نشده"
                      : "انتخاب کنید"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 sm:gap-3 mt-4">
        <button
          className="w-1/4 px-3 sm:px-4 py-2.5 sm:py-3 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-[#52ff8a] hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] bg-green-800 hover:bg-green-900 transition-all duration-300 text-center text-sm sm:text-base"
          type="submit"
        >
          ثبت
        </button>

        <button
          type="button"
          onClick={() => {
              setForm(initialForm);
              dispatch(clearCustomers());
              if (onClose) onClose();
            }}
          className="w-1/4 px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-700 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-500 hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] transition-all duration-300 text-center text-sm sm:text-base"
        >
          کنسل
        </button>
      </div>
    </form>
  );
};

export default BulkEditForm;
