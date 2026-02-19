// src/components/dataManagement/TestsManagement.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTest,
  updateTest,
  deleteTest,
  fetchTests,
  searchTests,
  fetchActiveStandards,
  selectTests,
  selectTestSearchResults,
  selectActiveStandards,
  selectTestsLoading,
  selectTestsError,
  selectTestsSuccess,
  clearMessages,
} from "../../redux/tests/testsSlice";

const TestsManagement = () => {
  const dispatch = useDispatch();

  // Selectors
  const tests = useSelector(selectTests);
  const searchResults = useSelector(selectTestSearchResults);
  const activeStandards = useSelector(selectActiveStandards);
  const loading = useSelector(selectTestsLoading);
  const error = useSelector(selectTestsError);
  const success = useSelector(selectTestsSuccess);

  // State
  const [mode, setMode] = useState("list"); // 'list', 'create', 'edit'
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    base_price: "",
    measurement_unit: "",
    description: "",
    financial_year: "1404",
    is_active: true,
    standard_ids: [],
  });

  //with no decimals
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0";

    return new Intl.NumberFormat("fa-IR", {
      style: "decimal", // Changed from "currency"
      minimumFractionDigits: 0, // No decimals
      maximumFractionDigits: 0, // No decimals
    }).format(amount);
  };

  // Load data on mount
  useEffect(() => {
    dispatch(fetchTests({ page: 1, limit: 50 }));
    dispatch(fetchActiveStandards());
  }, [dispatch]);

  // Search with debounce
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(searchTests(searchTerm));
        setShowSearchDropdown(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowSearchDropdown(false);
    }
  }, [searchTerm, dispatch]);

  // Clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle standard selection
  const toggleStandard = (standardId) => {
    setFormData((prev) => ({
      ...prev,
      standard_ids: prev.standard_ids.includes(standardId)
        ? prev.standard_ids.filter((id) => id !== standardId)
        : [...prev.standard_ids, standardId],
    }));
  };

  // Handle test selection from search
  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setSearchTerm(test.title);
    setShowSearchDropdown(false);
    setMode("edit");
    setFormData({
      title: test.title,
      code: test.code || "",
      base_price: test.base_price.toString(),
      measurement_unit: test.measurement_unit || "",
      description: test.description || "",
      financial_year: test.financial_year || "1404",
      is_active: test.is_active,
      standard_ids: test.standards?.map((s) => s.id) || [],
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      code: "",
      base_price: "",
      measurement_unit: "",
      description: "",
      financial_year: "1404",
      is_active: true,
      standard_ids: [],
    });
    setSelectedTest(null);
    setSearchTerm("");
    setMode("list");
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.base_price) {
      alert("لطفا عنوان و قیمت پایه را وارد کنید");
      return;
    }

    const testData = {
      title: formData.title,
      code: formData.code || null,
      base_price: parseFloat(formData.base_price),
      measurement_unit: formData.measurement_unit || null,
      description: formData.description || null,
      financial_year: formData.financial_year,
      is_active: formData.is_active,
      standard_ids: formData.standard_ids,
    };

    try {
      if (mode === "create") {
        await dispatch(createTest(testData)).unwrap();
      } else if (mode === "edit") {
        await dispatch(
          updateTest({
            testId: selectedTest.id,
            updates: testData,
          }),
        ).unwrap();
      }

      resetForm();
      dispatch(fetchTests({ page: 1, limit: 50 }));
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedTest) return;

    if (
      window.confirm(`آیا از حذف آزمون "${selectedTest.title}" اطمینان دارید؟`)
    ) {
      try {
        await dispatch(deleteTest(selectedTest.id)).unwrap();
        resetForm();
        dispatch(fetchTests({ page: 1, limit: 50 }));
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {/* Action Buttons */}
      {mode === "list" && (
        <div className="flex gap-4">
          <button
            onClick={() => setMode("create")}
            className="flex items-center gap-2 px-6 py-3 bg-orange text-white rounded-lg transition-all font-medium"
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
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            افزودن آزمون جدید
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی آزمون..."
              className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {showSearchDropdown && searchResults.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-neutral-800 shadow-lg border border-white">
                {searchResults.map((test) => (
                  <li
                    key={test.id}
                    onClick={() => handleTestSelect(test)}
                    className="px-4 py-3 text-sm text-neutral-200 hover:bg-[#5271ff]/10 cursor-pointer border-b border-white last:border-0"
                  >
                    <div className="font-medium">{test.title}</div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {test.code} - {formatCurrency(test.base_price)} ریال
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      {(mode === "create" || mode === "edit") && (
        <form
          onSubmit={handleSubmit}
          className="bg-black border border-white rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-neutral-100">
              {mode === "create" ? "افزودن آزمون جدید" : "ویرایش آزمون"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Title */}
            <div className="relative">
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder=""
                required
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.title ? "top-0 -translate-y-1/2 text-xs text-white" : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"}`}
              >
                عنوان آزمون *
              </label>
            </div>

            {/* Code */}
            <div className="relative">
              <input
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder=""
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.code ? "top-0 -translate-y-1/2 text-xs text-white" : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"}`}
              >
                کد آزمون
              </label>
            </div>

            {/* Base Price */}
            <div className="relative">
              <input
                name="base_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.base_price}
                onChange={handleInputChange}
                placeholder=""
                required
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.base_price ? "top-0 -translate-y-1/2 text-xs text-white" : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"}`}
              >
                قیمت پایه (ریال) *
              </label>
            </div>

            {/* Measurement Unit */}
            <div className="relative">
              <input
                name="measurement_unit"
                value={formData.measurement_unit}
                onChange={handleInputChange}
                placeholder=""
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.measurement_unit ? "top-0 -translate-y-1/2 text-xs text-white" : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"}`}
              >
                واحد اندازه‌گیری
              </label>
            </div>

            {/* Financial Year */}
            <div className="relative">
              <input
                name="financial_year"
                value={formData.financial_year}
                onChange={handleInputChange}
                placeholder=""
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.financial_year ? "top-0 -translate-y-1/2 text-xs text-white" : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"}`}
              >
                سال مالی
              </label>
            </div>

            {/* Description */}
            <div className="relative md:col-span-2 lg:col-span-3">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder=""
                rows="3"
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.description ? "top-0 -translate-y-1/2 text-xs text-white" : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"}`}
              >
                توضیحات
              </label>
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-3 md:col-span-2 lg:col-span-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-[#5271ff]/20 bg-neutral-900 text-[#5271ff] focus:ring-[#5271ff] focus:ring-offset-0"
              />
              <label className="text-sm text-neutral-300">فعال</label>
            </div>
          </div>

          {/* Standards Selection */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-neutral-300 mb-3">
              استانداردهای مرتبط
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-3 bg-neutral-900/50 rounded-lg border border-[#5271ff]/10">
              {activeStandards.map((standard) => (
                <label
                  key={standard.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-neutral-800/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.standard_ids.includes(standard.id)}
                    onChange={() => toggleStandard(standard.id)}
                    className="w-4 h-4 rounded border-[#5271ff]/20 bg-neutral-900 text-white focus:ring-offset-0"
                  />
                  <span className="text-sm text-neutral-300">
                    {standard.code} - {standard.title}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-neutral-700/50">
            {mode === "edit" && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 bg-red-900/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-900/30 transition-colors font-medium"
              >
                حذف
              </button>
            )}
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-darkOrange text-neutral-200 rounded-lg font-medium"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-pink text-white rounded-lg hover:shadow-lg font-medium disabled:opacity-50"
            >
              {loading
                ? "در حال پردازش..."
                : mode === "create"
                  ? "افزودن"
                  : "بروزرسانی"}
            </button>
          </div>
        </form>
      )}

      {/* Tests List */}
      {mode === "list" && tests.length > 0 && (
        <div className="bg-black border border-orange/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black border-b border-white">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    عنوان
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    کد
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    قیمت پایه
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    مدت زمان
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    وضعیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700/50">
                {tests.map((test) => (
                  <tr
                    key={test.id}
                    className="hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {test.title}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {test.code || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {formatCurrency(test.base_price)} ریال
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${test.is_active ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}
                      >
                        {test.is_active ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTestSelect(test)}
                        className="text-pink text-sm font-medium"
                      >
                        ویرایش
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestsManagement;
