import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewEntry,
  updateNewEntry,
  fetchNewEntries,
} from "../../features/newEntires/newEntriesThunks";
import { clearSelectedNewEntry } from "../../features/newEntires/newEntiresSlice";
import { categoryOptions } from "../../data/categories";
import {
  addCountry,
  searchCountries,
} from "../../features/tire_data/countries";
import { addBrand, searchBrands } from "../../features/tire_data/brands";
import { addSize, searchSizes } from "../../features/tire_data/sizes";
import { clearSearchList as clearCountries } from "../../features/tire_data/countries";
import { clearSearchList as clearSizes } from "../../features/tire_data/sizes";
import { clearSearchList as clearBrands } from "../../features/tire_data/brands";

import {
  convertJalaliToGregorian,
  convertGregorianToJalali,
} from "../../utils/dateHelpers";

const initialForm = {
  entry_code: "",
  company_entry_date: "",
  entry_category: "",
  size: "",
  brand: "",
  country: "",
  number_of_rings: "",
  production_week_year: [],
  seal_number: "",
  description: "",
};

const NewEntriesForm = () => {
  const [form, setForm] = useState(initialForm);
  const [displayEntryCode, setDisplayEntryCode] = useState(""); // For showing in input
  const [displayEndEntryCode, setDisplayEndEntryCode] = useState(""); // For showing end entry code
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // For category dropdown
  const dispatch = useDispatch();
  const selected = useSelector((state) => state.newEntries.selectedNewEntry);
  const newEntries = useSelector((state) => state.newEntries.NewEntries);
  const user = useSelector((state) => state.auth.user);
  const [chosed, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [productionWeekYearInput, setProductionWeekYearInput] = useState("");

  const { searchList: countries, loading: countriesLoading } = useSelector(
    (state) => state.countries
  );
  const { searchList: sizes, loading: sizesLoading } = useSelector(
    (state) => state.sizes
  );
  const { searchList: brands, loading: brandsLoading } = useSelector(
    (state) => state.brands
  );

  // Function to get the next entry code number
  const getNextEntryCodeNumber = () => {
    if (!newEntries || newEntries.length === 0) return 1;

    // Get all numbers including the ones in the form
    const allNumbers = [...newEntries]
      .filter(
        (entry) => entry.entry_code && entry.entry_code.startsWith("1404-")
      )
      .map((entry) => {
        const numericPart = entry.entry_code.split("-")[1];
        return parseInt(numericPart) || 0;
      });

    // Also check the displayEndEntryCode if it exists
    if (displayEndEntryCode) {
      allNumbers.push(parseInt(displayEndEntryCode));
    }

    const filteredNumbers = allNumbers
      .filter((num) => !isNaN(num))
      .sort((a, b) => b - a); // Sort descending

    if (filteredNumbers.length === 0) return 1;
    return filteredNumbers[0] + 1;
  };

  // Function to format display value (without 1404 prefix)
  const formatDisplayValue = (fullCode) => {
    if (!fullCode) return "";
    if (fullCode.startsWith("1404-")) {
      return fullCode.split("-")[1] || "";
    }
    return fullCode;
  };

  // Function to format full entry code (with 1404 prefix)
  const formatFullEntryCode = (displayValue) => {
    if (!displayValue) return "";
    // Remove any existing "1404-" prefix if user typed it
    const cleanValue = displayValue.replace(/^1404\-/, "");
    return `1404-${cleanValue}`;
  };

  // Function to get current Shamsi date
  const getCurrentShamsiDate = () => {
    const today = new Date();
    const todayISO = today.toISOString().split("T")[0]; // Get YYYY-MM-DD format
    return convertGregorianToJalali(todayISO);
  };

  useEffect(() => {
    setForm(initialForm);
    dispatch(clearSelectedNewEntry());
  }, []);

  useEffect(() => {
    if (selected) {
      setForm({
        ...selected,
        productionWeekYear: Array.isArray(selected.productionWeekYear)
          ? selected.productionWeekYear
          : [],
        company_entry_date: convertGregorianToJalali(
          selected.company_entry_date
        ),
        depository_entry_date: convertGregorianToJalali(
          selected.depository_entry_date
        ),
      });
      setProductionWeekYearInput("");
      // Set display value without the 1404 prefix for editing
      setDisplayEntryCode(formatDisplayValue(selected.entry_code));
    } else {
      // Auto-set the next entry code for new entries
      const nextNumber = getNextEntryCodeNumber();
      const fullCode = `1404-${nextNumber}`;
      const currentShamsiDate = getCurrentShamsiDate();

      setForm((prev) => ({
        ...prev,
        entry_code: fullCode,
        company_entry_date: currentShamsiDate,
      }));
      setDisplayEntryCode(nextNumber.toString());
    }
  }, [selected, newEntries]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "entry_code") {
      const cleanValue = value.replace(/[^0-9.]/g, "");
      const displayValue = cleanValue.replace(/^1404\-/, "");
      setDisplayEntryCode(displayValue);

      const fullCode = formatFullEntryCode(displayValue);
      setForm((prev) => ({ ...prev, entry_code: fullCode }));
    } else if (name === "end_entry_code") {
      const cleanValue = value.replace(/[^0-9.]/g, "");
      const displayValue = cleanValue.replace(/^1404\-/, "");
      setDisplayEndEntryCode(displayValue);
    } else if (name === "production_week_year") {
      setProductionWeekYearInput(value);
    } else if (name === "country") {
      setForm((prev) => ({ ...prev, country: value }));
      if (value.trim()) {
        dispatch(searchCountries(value)); // Fetch from backend
      } else {
        dispatch(clearCountries()); // Close dropdown when cleared
      }
    } else if (name === "size") {
      setForm((prev) => ({ ...prev, size: value }));
      if (value.trim()) {
        dispatch(searchSizes(value)); // Fetch from backend
      } else {
        dispatch(clearSizes());
      }
    } else if (name === "brand") {
      setForm((prev) => ({ ...prev, brand: value }));
      if (value.trim()) {
        dispatch(searchBrands(value)); // Fetch from backend
      } else {
        dispatch(clearBrands());
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProductionWeekYear = () => {
    if (productionWeekYearInput.trim()) {
      setForm({
        ...form,
        production_week_year: [
          ...form.production_week_year,
          productionWeekYearInput.trim(),
        ],
      });
      setProductionWeekYearInput("");
    }
  };

  // Optional: Handle Enter key to add production_week_year
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddProductionWeekYear();
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryValue) => {
    setForm({ ...form, entry_category: categoryValue });
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Prepare "add-if-not-exists" calls for country, brand, size
      const addIfNeeded = [];

      if (form.country.trim()) {
        addIfNeeded.push(dispatch(addCountry(form.country.trim())).unwrap());
      }
      if (form.brand.trim()) {
        addIfNeeded.push(dispatch(addBrand(form.brand.trim())).unwrap());
      }
      if (form.size.trim()) {
        addIfNeeded.push(dispatch(addSize(form.size.trim())).unwrap());
      }

      // Step 2: Run all add-if-not-exists requests in parallel
      if (addIfNeeded.length > 0) {
        await Promise.all(addIfNeeded);
      }

      // Step 3: Handle multiple entries if end entry code is provided
      if (displayEndEntryCode && !selected) {
        const startNum = parseInt(displayEntryCode);
        const endNum = parseInt(displayEndEntryCode);

        if (!isNaN(startNum) && !isNaN(endNum) && startNum <= endNum) {
          const entriesPromises = [];

          for (let i = startNum; i <= endNum; i++) {
            const formDataWithUser = {
              ...form,
              entry_code: `1404-${i}`,
              number_of_rings:
                form.number_of_rings === "" ? null : form.number_of_rings,
              created_by: user?.id,
              company_entry_date: convertJalaliToGregorian(
                form.company_entry_date
              ),
              depository_entry_date: convertJalaliToGregorian(
                form.depository_entry_date
              ),
              production_week_year: form.production_week_year,
            };
            entriesPromises.push(
              dispatch(addNewEntry(formDataWithUser)).unwrap()
            );
          }

          const results = await Promise.all(entriesPromises);
          // After all entries are added, update with the last entry code
          const lastEntry = results[results.length - 1];
          if (lastEntry) {
            setDisplayEntryCode(lastEntry.entry_code.split("-")[1]);
          }
        }
      } else {
        // Handle single entry
        const formDataWithUser = {
          ...form,
          number_of_rings:
            form.number_of_rings === "" ? null : form.number_of_rings,
          created_by: user?.id,
          company_entry_date: convertJalaliToGregorian(form.company_entry_date),
          depository_entry_date: convertJalaliToGregorian(
            form.depository_entry_date
          ),
          production_week_year: form.production_week_year,
        };

        if (selected) {
          await dispatch(
            updateNewEntry({
              entry_code: selected.entry_code,
              newEntry: formDataWithUser,
            })
          ).unwrap();
          dispatch(fetchNewEntries());
        } else {
          await dispatch(addNewEntry(formDataWithUser)).unwrap();
        }
      }

      // ✅ Clear all dropdown lists after submit
      dispatch(clearCountries());
      dispatch(clearBrands());
      dispatch(clearSizes());

      // Step 5: Reset form
      setForm(initialForm);
      setDisplayEntryCode("");
      setDisplayEndEntryCode("");
      dispatch(clearSelectedNewEntry());

      if (!selected) {
        setForm((prev) => ({
          ...initialForm,
          company_entry_date: getCurrentShamsiDate(),
        }));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Optionally show a toast or error message to the user
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="flex justify-center text-blue-400 ">
        فرم زیر را جهت ثبت ورودی جدید پر کنید
      </h2>
      <div className="flex justify-center flex-wrap gap-4 mt-5">
        <div className="relative m-1">
          <div className="flex items-center gap-2">
            <div className="relative">
              {/* 1404- prefix display for start entry */}
              <span className="absolute left-0 top-0 z-10 text-neutral-400 text-xs sm:text-sm bg-neutral-800 border border-[#5271ff]/20 rounded-r px-2 h-20 flex items-center border-l-0">
                1404-
              </span>
              <input
                type="text"
                name="entry_code"
                id="entry_code"
                value={displayEntryCode}
                onChange={handleChange}
                className="peer w-50 h-20 p-2 pl-16 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
                inputMode="numeric"
              />
              <label
                htmlFor="entry_code"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
                  ${
                    displayEntryCode
                      ? "top-0 text-xs text-[#5271ff]"
                      : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
                  }
                  peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                کد شروع
              </label>
              {/* Show full code preview for start entry */}
              {displayEntryCode && (
                <div className="absolute top-full mt-1 text-xs text-neutral-500 text-right right-0">
                  {form.entry_code} :کد کامل
                </div>
              )}
            </div>

            <span className="text-neutral-400">تا</span>

            <div className="relative">
              {/* 1404- prefix display for end entry */}
              <span className="absolute left-0 top-0 z-10 text-neutral-400 text-xs sm:text-sm bg-neutral-800 border border-[#5271ff]/20 rounded-r px-2 h-20 flex items-center border-l-0">
                1404-
              </span>
              <input
                type="text"
                name="end_entry_code"
                id="end_entry_code"
                value={displayEndEntryCode}
                onChange={handleChange}
                className="peer w-50 h-20 p-2 pl-16 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
                placeholder=""
                inputMode="numeric"
                disabled={selected} // Disable when editing existing entry
              />
              <label
                htmlFor="end_entry_code"
                className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
                  ${
                    displayEndEntryCode
                      ? "top-0 text-xs text-[#5271ff]"
                      : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
                  }
                  peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
              >
                کد پایان
              </label>
              {/* Show full code preview for end entry */}
              {displayEndEntryCode && (
                <div className="absolute top-full mt-1 text-xs text-neutral-500 text-right right-0">
                  {`1404-${displayEndEntryCode}`} :کد کامل
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center flex-wrap gap-4 mt-5">
        <div className="relative m-1">
          <input
            name="company_entry_date"
            id="company_entry_date"
            value={form.company_entry_date}
            onChange={handleChange}
            placeholder=""
            className="peer w-50 h-20 p-2  bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
          />
          <label
            htmlFor="company_entry_date"
            className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
              ${
                form.company_entry_date
                  ? "top-0 text-xs text-[#5271ff]"
                  : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
              }
              peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
          >
            تاریخ ورود به شرکت
          </label>
        </div>

        {/* Modern Category Selection Dropdown */}
        <div className="relative m-1">
          {/* Hidden input for peer selector functionality */}
          <input
            type="text"
            name="entry_category"
            id="entry_category"
            value={form.entry_category}
            onChange={() => {}} // Controlled by dropdown
            className="peer absolute opacity-0 pointer-events-none"
            onFocus={() => setIsDropdownOpen(true)}
          />

          <div
            className={`w-[12.5rem] h-20 p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-200 cursor-pointer flex items-center justify-between transition-all duration-200 hover:border-[#5271ff]/40 ${
              isDropdownOpen ? "border-[#5271ff] ring-1 ring-[#5271ff]" : ""
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span
              className={
                form.entry_category ? "text-neutral-200" : "text-neutral-500"
              }
            >
              {form.entry_category || "انتخاب کنید"}
            </span>
            <svg
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
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

          <label
            htmlFor="entry_category"
            className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all pointer-events-none
              ${
                form.entry_category
                  ? "top-0 text-xs text-[#5271ff]"
                  : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
              }
              peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
          >
            دسته تایر ورودی
          </label>

          {/* Dropdown Options */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-[#5271ff]/20 rounded-lg shadow-lg z-50 overflow-hidden">
              {categoryOptions.map((option, index) => (
                <div
                  key={option.value}
                  className="px-4 py-3 text-xs sm:text-sm text-neutral-200 hover:bg-neutral-700 hover:text-[#5271ff] cursor-pointer transition-all duration-150 flex items-center justify-between group"
                  onClick={() => handleCategorySelect(option.value)}
                >
                  <span>{option.label}</span>
                  {form.entry_category === option.value && (
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
                </div>
              ))}
            </div>
          )}

          {/* Click outside to close dropdown */}
          {isDropdownOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}
        </div>

        <div className="relative m-1">
          <input
            name="size"
            onClick={(e) => e.stopPropagation()}
            value={form.size}
            onChange={handleChange}
            placeholder=""
            autoComplete="off"
            className="peer w-50 h-20 p-2 w-full bg-neutral-900 border border-[#5271ff]/20 rounded text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
          />
          <label
            htmlFor="size"
            className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.size
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
          >
            سایز
          </label>

          {sizes.length > 0 && (
            <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-neutral-800 shadow-lg border border-[#5271ff]/20">
              {sizes.map((size) => (
                <li
                  key={size.id}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, size: size.name }));
                    dispatch({ type: "sizes/clearSearchList" });
                  }}
                  className="px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700 cursor-pointer"
                >
                  {size.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative m-1" onClick={(e) => e.stopPropagation()}>
          <input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder=""
            autoComplete="off"
            className="peer w-50 h-20 p-2 w-full bg-neutral-900 border border-[#5271ff]/20 rounded text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
          />
          <label
            htmlFor="brand"
            className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.brand
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
          >
            مارک تجاری
          </label>

          {brands.length > 0 && (
            <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-neutral-800 shadow-lg border border-[#5271ff]/20">
              {brands.map((brand) => (
                <li
                  key={brand.id}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, brand: brand.name }));
                    dispatch({ type: "brands/clearSearchList" });
                  }}
                  className="px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700 cursor-pointer"
                >
                  {brand.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex justify-center flex-wrap gap-4 mt-5">
        <div className="relative m-1" onClick={(e) => e.stopPropagation()}>
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder=""
            autoComplete="off"
            className="peer w-50 h-20 p-2 w-full bg-neutral-900 border border-[#5271ff]/20 rounded text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
          />
          <label
            htmlFor="country"
            className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.country
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
          >
            کشور سازنده
          </label>

          {countries.length > 0 && (
            <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-neutral-800 shadow-lg border border-[#5271ff]/20">
              {countries.map((country) => (
                <li
                  key={country.id}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, country: country.name }));
                    dispatch({ type: "countries/clearSearchList" });
                  }}
                  className="px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700 cursor-pointer"
                >
                  {country.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* <Combobox
          value={form.country}
          onChange={(val) => setForm({ ...form, country: val })}
        >
          <div className="relative m-1">
            <Combobox.Input
              onChange={(e) => setQuery(e.target.value)}
              className="peer w-50 h-20 p-2 w-full bg-neutral-900 border border-[#5271ff]/20 rounded text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
              placeholder=""
              displayValue={() => form.country}
            />

            <Combobox.Options className="absolute mt-1 w-40 border bg-neutral-800 text-gray-500 rounded shadow max-h-40 overflow-y-auto z-10">
              {filteredCountries.map((item) => (
                <Combobox.Option
                  key={item}
                  value={item}
                  className={({ active }) =>
                    `px-4 py-2 cursor-pointer ${active ? "bg-gray-500 text-white" : ""}`
                  }
                >
                  {item}
                </Combobox.Option>
              ))}
            </Combobox.Options>
            <label
              htmlFor="country"
              className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.country
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
            >
              کشور سازنده
            </label>
          </div>
        </Combobox> */}

        <div className="relative m-1">
          <input
            name="number_of_rings"
            value={form.number_of_rings}
            onChange={handleChange}
            placeholder=""
            className="peer w-50 h-20 p-2 w-full bg-neutral-900 border border-[#5271ff]/20 rounded text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
          />
          <label
            htmlFor="number_of_rings"
            className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.number_of_rings
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
          >
            تعداد حلقه ورودی
          </label>
        </div>

        <div className="relative m-1">
          {/* Input container with dropdown and add button */}
          <div className="relative flex items-center">
            <input
              name="production_week_year"
              value={productionWeekYearInput}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              onClick={(e) => e.stopPropagation()}
              placeholder=""
              autoComplete="off"
              className="peer w-40 h-20 p-2 pr-20 bg-neutral-900 border border-[#5271ff]/20 rounded-l text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
            />

            {/* Add button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddProductionWeekYear();
              }}
              className="h-20 px-3 bg-blue-400 hover:bg-[#5271ff]/80 rounded-r text-white focus:outline-none focus:ring-1 focus:ring-[#5271ff] transition-colors"
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
            htmlFor="production_week_year"
            className={`absolute right-14 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all pointer-events-none
              ${
                form.production_week_year.length > 0 || productionWeekYearInput
                  ? "top-0 text-xs text-[#5271ff]"
                  : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
              }
              peer-focus:top-0 pr-2 peer-focus:text-xs peer-focus:text-[#5271ff]`}
          >
            هفته_سال تولید
          </label>

          {/* Display selected production_week_year's as pills */}
          <div className="flex flex-wrap gap-2 mt-2">
            {form.production_week_year.map((production_week_year, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-[#5271ff]/10 text-[#5271ff] px-2 py-1 rounded-full text-xs"
              >
                {production_week_year}
                <button
                  type="button"
                  onClick={() => {
                    const updated = form.production_week_year.filter(
                      (_, i) => i !== index
                    );
                    setForm({ ...form, production_week_year: updated });
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
          <input
            name="seal_number"
            value={form.seal_number}
            onChange={handleChange}
            placeholder=""
            className="peer w-50 h-20 p-2 w-full bg-neutral-900 border border-[#5271ff]/20 rounded text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
          />
          <label
            htmlFor="seal_number"
            className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.seal_number
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
          >
            شماره پلمپ
          </label>
        </div>
      </div>
      <div className="flex justify-center flex-wrap gap-4 mt-5">
        <div className="relative m-1 w-full">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder=""
            rows={3}
            className="peer w-full h-20 p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-sm text-neutral-200 placeholder-transparent focus:outline-none focus:border-[#5271ff] focus:ring-1 focus:ring-[#5271ff]"
          />
          <label
            htmlFor="description"
            className={`absolute right-2 rounded-md bg-neutral-900 px-1 text-xs sm:text-sm text-neutral-400 transition-all
      ${
        form.description
          ? "top-0 text-xs text-[#5271ff]"
          : "top-1/2 -translate-y-1/2 peer-placeholder-shown:text-neutral-300 peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2"
      }
      peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#5271ff]`}
          >
            توضیحات
          </label>
        </div>
      </div>
      <div className="flex justify-center items-center gap-2 sm:gap-3 mt-4">
        <button
          className="w-1/4 px-3 sm:px-4 py-2.5 sm:py-3 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-[#52ff8a] hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] bg-green-800 hover:bg-green-900 edit transition-all duration-300 text-center text-sm sm:text-base"
          type="submit"
        >
          + {selected ? "آپدیت" : "افزودن"} ورودی جدید +
        </button>

        {selected && (
          <button
            className="w-1/4 px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-700 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-500 hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] transition-all duration-300 text-center text-sm sm:text-base shadow-[inset_0_0_4px_rgba(0,255,0,0.3)]"
            type="button"
            onClick={() => {
              dispatch(clearSelectedNewEntry());
              setForm(initialForm);
            }}
          >
            کنسل
          </button>
        )}
      </div>
    </form>
  );
};

export default NewEntriesForm;
