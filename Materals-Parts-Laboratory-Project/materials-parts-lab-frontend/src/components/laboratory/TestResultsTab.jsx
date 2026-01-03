// src/components/reception/TestResultsTab.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTestResult,
  updateTestResult,
  deleteTestResult,
  clearError,
  clearSuccess,
  selectTestResultsLoading,
  selectTestResultsError,
  selectTestResultsSuccess,
  selectTestResults,
  fetchResultsByRecord,
} from "../../redux/tests/testResultsSlice";

const TestResultsTab = ({ record, onRefresh }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectTestResultsLoading);
  const error = useSelector(selectTestResultsError);
  const success = useSelector(selectTestResultsSuccess);
  const allResults = useSelector(selectTestResults);

  const [showResultModal, setShowResultModal] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [resultForm, setResultForm] = useState({
    result_value: "",
    result_unit: "",
    uncertainty: "",
    acceptance_range: "",
    declaration_of_conformity: "",
    test_method_description: "",
    observations: "",
    environmental_conditions: "",
    is_final: false,
    test_date: new Date().toISOString().split("T")[0],
  });
  const [resultFiles, setResultFiles] = useState([]);
  const [resultFilePreviews, setResultFilePreviews] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    if (record?.id) {
      dispatch(fetchResultsByRecord(record.id));
    }
  }, [dispatch, record?.id]);

  // Handle success/error notifications
  useEffect(() => {
    if (success) {
      setShowResultModal(false);
      setEditingResult(null);
      if (onRefresh) {
        onRefresh();
      }
      dispatch(clearSuccess());
    }
  }, [success, dispatch, onRefresh]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Groups results by test ID
  const getResultsForTest = (testId) => {
    if (!Array.isArray(allResults)) return [];
    return allResults.filter((result) => result.record_test_id === testId);
  };

  const handleAddResult = (test) => {
    setEditingResult(null);
    setResultForm({
      result_value: "",
      result_unit: "",
      uncertainty: "",
      acceptance_range: "",
      declaration_of_conformity: "",
      test_method_description: "",
      observations: "",
      environmental_conditions: "",
      is_final: false,
      test_date: new Date().toISOString().split("T")[0],
    });
    setResultFiles([]);
    setResultFilePreviews([]);
    setExistingFiles([]);
    setShowResultModal(true);
    setEditingResult({ record_test_id: test.id, test_title: test.test_title });
  };

  const handleEditResult = (result, test) => {
    setEditingResult({
      ...result,
      record_test_id: test.id,
      test_title: test.test_title,
    });
    setResultForm({
      result_value: result.result_value || "",
      result_unit: result.result_unit || "",
      uncertainty: result.uncertainty || "",
      acceptance_range: result.acceptance_range || "",
      declaration_of_conformity: result.declaration_of_conformity || "",
      test_method_description: result.test_method_description || "",
      observations: result.observations || "",
      environmental_conditions: result.environmental_conditions || "",
      is_final: result.is_final || false,
      test_date: result.test_date
        ? result.test_date.split("T")[0]
        : new Date().toISOString().split("T")[0],
    });

    // Handle existing files
    try {
      const files = Array.isArray(result.result_files)
        ? result.result_files
        : result.result_files
          ? JSON.parse(result.result_files)
          : [];
      setExistingFiles(files);
    } catch (e) {
      setExistingFiles([]);
    }

    setResultFiles([]);
    setResultFilePreviews([]);
    setShowResultModal(true);
  };

  const handleSaveResult = async () => {
    if (!resultForm.result_value || !resultForm.test_date) {
      alert("لطفاً مقدار جواب و تاریخ آزمون را وارد کنید");
      return;
    }

    try {
      const resultData = {
        record_id: record.id,
        record_test_id: editingResult.record_test_id,
        ...resultForm,
        result_files: resultFiles.length > 0 ? resultFiles : null,
      };

      if (editingResult.id) {
        // Update existing result
        const result = await dispatch(
          updateTestResult({
            resultId: editingResult.id,
            data: {
              ...resultForm,
              existing_files: existingFiles,
              result_files: resultFiles.length > 0 ? resultFiles : null,
            },
          })
        ).unwrap();

        console.log("✅ Updated:", result);
        alert("جواب با موفقیت بروزرسانی شد");
      } else {
        // Create new result
        const result = await dispatch(createTestResult(resultData)).unwrap();

        console.log("✅ Created:", result);
        alert("جواب با موفقیت ذخیره شد");
      }

      setShowResultModal(false);
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("❌ Full error:", err);
      alert(`خطا: ${err}`);
    }
  };

  const handleResultFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + existingFiles.length > 10) {
      alert("حداکثر 10 فایل می‌توانید داشته باشید");
      return;
    }

    setResultFiles(files);

    const previews = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          resolve({ name: file.name, url: e.target.result });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(setResultFilePreviews);
  };

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm("آیا از حذف این جواب اطمینان دارید؟")) {
      return;
    }

    try {
      await dispatch(deleteTestResult(resultId)).unwrap();
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error deleting result:", err);
    }
  };

  const removeExistingFile = (index) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index) => {
    setResultFiles((prev) => prev.filter((_, i) => i !== index));
    setResultFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="bg-nblack border border-pink rounded-lg p-4">
        <h4 className="text-base font-medium text-orange mb-4 flex items-center justify-center gap-2">
          <span className="text-lg">📊</span>
          جواب آزمون‌ها
        </h4>

        {record.tests && record.tests.length > 0 ? (
          <div className="space-y-4">
            {record.tests.map((test, idx) => {
              const testResults = getResultsForTest(test.id);

              return (
                <div
                  key={test.id}
                  className="bg-neutral-900/50 border border-white rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-left gap-2 mb-1">
                        <span className="text-neutral-400 text-sm">
                          #{idx + 1}
                        </span>
                        <h5 className="font-medium text-white">
                          {test.test_title}
                        </h5>
                      </div>
                      {test.standard_code && (
                        <div className="text-xs text-white ">
                          {test.standard_code}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddResult(test)}
                      disabled={record.invoice_finalized}
                      className="px-3 py-1.5 bg-pink border border-black text-white text-sm rounded hover:border hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + افزودن جواب
                    </button>
                  </div>

                  {/* Display existing results for this test */}
                  {testResults && testResults.length > 0 ? (
                    <div className="space-y-2 mt-3 border-t border-neutral-700 pt-3">
                      {testResults.map((result) => (
                        <div
                          key={result.id}
                          className="bg-neutral-800/50 border border-pink rounded p-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-white">
                                  {result.result_value} {result.result_unit}
                                </span>
                                <span className="text-neutral-500">
                                  {" "}
                                  :جواب{" "}
                                </span>
                              </div>
                              {result.uncertainty && (
                                <div>
                                  <span className="text-neutral-500">
                                    عدم قطعیت:{" "}
                                  </span>
                                  <span className="text-white">
                                    {result.uncertainty}
                                  </span>
                                </div>
                              )}
                              {result.acceptance_range && (
                                <div>
                                  <span className="text-neutral-500">
                                    محدوده:{" "}
                                  </span>
                                  <span className="text-white">
                                    {result.acceptance_range}
                                  </span>
                                </div>
                              )}
                              {result.declaration_of_conformity && (
                                <div className="col-span-2">
                                  <span className="text-neutral-500">
                                    انطباق:{" "}
                                  </span>
                                  <span className="text-white">
                                    {result.declaration_of_conformity}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="text-neutral-500">
                                  تاریخ:{" "}
                                </span>
                                <span className="text-white">
                                  {new Date(
                                    result.test_date
                                  ).toLocaleDateString("fa-IR")}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs ${
                                    result.is_final
                                      ? "bg-green-900/30 text-green-400"
                                      : "bg-gray-700 text-black"
                                  }`}
                                >
                                  {result.is_final ? "نهایی" : "پیش‌نویس"}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-2">
                              <button
                                onClick={() => handleEditResult(result, test)}
                                disabled={record.invoice_finalized}
                                className="px-3 py-1.5 bg-orange text-white text-sm rounded hover:bg-orange/90"
                              >
                                ویرایش
                              </button>
                              <button
                                onClick={() => handleDeleteResult(result.id)}
                                disabled={record.invoice_finalized}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                          {result.observations && (
                            <div className="mt-2 text-xs text-neutral-400 italic">
                              💬 {result.observations}
                            </div>
                          )}
                          {result.test_method_description && (
                            <div className="mt-2 text-xs text-neutral-400">
                              <span className="text-neutral-500">روش: </span>
                              {result.test_method_description}
                            </div>
                          )}
                          {result.environmental_conditions && (
                            <div className="mt-1 text-xs text-neutral-400">
                              <span className="text-neutral-500">شرایط: </span>
                              {result.environmental_conditions}
                            </div>
                          )}
                          {result.result_files &&
                            result.result_files.length > 0 && (
                              <div className="mt-2 flex gap-2 flex-wrap">
                                {result.result_files.map((fileUrl, fileIdx) => (
                                  <a
                                    key={fileIdx}
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 bg-neutral-700/50 px-2 py-1 rounded"
                                  >
                                    📎 فایل {fileIdx + 1}
                                  </a>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-neutral-500 text-sm py-4 border-t border-neutral-700 mt-3">
                      هنوز جوابی ثبت نشده است
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-neutral-500 py-8">
            هیچ آزمونی یافت نشد
          </div>
        )}
      </div>

      {/* Test Result Modal */}
      {showResultModal && editingResult && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-[#5271ff]/20 rounded-lg p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-neutral-100 mb-4 sticky top-0 bg-neutral-900 pb-2 border-b border-neutral-700">
              {editingResult.id ? "ویرایش" : "افزودن"} جواب آزمون:{" "}
              {editingResult.test_title}
            </h3>

            <div className="space-y-4">
              {/* Row 1: Result Value, Unit, Test Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">
                    مقدار جواب *
                  </label>
                  <input
                    type="text"
                    value={resultForm.result_value}
                    onChange={(e) =>
                      setResultForm((prev) => ({
                        ...prev,
                        result_value: e.target.value,
                      }))
                    }
                    className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                    placeholder="مثال: 25.5"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">
                    واحد
                  </label>
                  <input
                    type="text"
                    value={resultForm.result_unit}
                    onChange={(e) =>
                      setResultForm((prev) => ({
                        ...prev,
                        result_unit: e.target.value,
                      }))
                    }
                    className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                    placeholder="مثال: °C, MPa, %"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">
                    تاریخ آزمون *
                  </label>
                  <input
                    type="date"
                    value={resultForm.test_date}
                    onChange={(e) =>
                      setResultForm((prev) => ({
                        ...prev,
                        test_date: e.target.value,
                      }))
                    }
                    className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                  />
                </div>
              </div>

              {/* Row 2: Uncertainty, Acceptance Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">
                    عدم قطعیت
                  </label>
                  <input
                    type="text"
                    value={resultForm.uncertainty}
                    onChange={(e) =>
                      setResultForm((prev) => ({
                        ...prev,
                        uncertainty: e.target.value,
                      }))
                    }
                    className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                    placeholder="مثال: ±0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">
                    محدوده پذیرش
                  </label>
                  <input
                    type="text"
                    value={resultForm.acceptance_range}
                    onChange={(e) =>
                      setResultForm((prev) => ({
                        ...prev,
                        acceptance_range: e.target.value,
                      }))
                    }
                    className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                    placeholder="مثال: 20-30"
                  />
                </div>
              </div>

              {/* Row 3: Declaration of Conformity */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">
                  اظهار انطباق
                </label>
                <input
                  type="text"
                  value={resultForm.declaration_of_conformity}
                  onChange={(e) =>
                    setResultForm((prev) => ({
                      ...prev,
                      declaration_of_conformity: e.target.value,
                    }))
                  }
                  className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                  placeholder="مثال: منطبق، غیرمنطبق"
                />
              </div>

              {/* Row 4: Test Method Description */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">
                  شرح روش آزمون
                </label>
                <textarea
                  value={resultForm.test_method_description}
                  onChange={(e) =>
                    setResultForm((prev) => ({
                      ...prev,
                      test_method_description: e.target.value,
                    }))
                  }
                  rows="3"
                  className="w-full px-3 py-2 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                  placeholder="توضیحات روش آزمون..."
                />
              </div>

              {/* Row 5: Environmental Conditions */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">
                  شرایط محیطی
                </label>
                <input
                  type="text"
                  value={resultForm.environmental_conditions}
                  onChange={(e) =>
                    setResultForm((prev) => ({
                      ...prev,
                      environmental_conditions: e.target.value,
                    }))
                  }
                  className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                  placeholder="مثال: دمای 23°C، رطوبت 50%"
                />
              </div>

              {/* Row 6: Observations */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">
                  مشاهدات و یادداشت‌ها
                </label>
                <textarea
                  value={resultForm.observations}
                  onChange={(e) =>
                    setResultForm((prev) => ({
                      ...prev,
                      observations: e.target.value,
                    }))
                  }
                  rows="3"
                  className="w-full px-3 py-2 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                  placeholder="یادداشت‌های اضافی..."
                />
              </div>

              {/* Row 7: File Upload */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">
                  فایل‌های ضمیمه (اختیاری)
                </label>

                {/* Existing files */}
                {existingFiles.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-neutral-400 mb-1">
                      فایل‌های موجود:
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {existingFiles.map((fileUrl, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 bg-neutral-700/50 px-2 py-1 rounded text-xs"
                        >
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            📎 فایل {idx + 1}
                          </a>
                          <button
                            onClick={() => removeExistingFile(idx)}
                            className="text-red-400 hover:text-red-300 ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  onChange={handleResultFileChange}
                  className="w-full px-3 py-2 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                />
                {resultFilePreviews.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {resultFilePreviews.map((preview, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 bg-neutral-700/50 px-2 py-1 rounded text-xs"
                      >
                        <span className="text-neutral-400">
                          📎 {preview.name}
                        </span>
                        <button
                          onClick={() => removeNewFile(idx)}
                          className="text-red-400 hover:text-red-300 ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 8: Is Final Checkbox */}
              <div className="flex items-center gap-3 bg-neutral-800/50 border border-[#5271ff]/20 rounded p-3">
                <input
                  type="checkbox"
                  id="is_final"
                  checked={resultForm.is_final}
                  onChange={(e) =>
                    setResultForm((prev) => ({
                      ...prev,
                      is_final: e.target.checked,
                    }))
                  }
                  className="w-5 h-5"
                />
                <label
                  htmlFor="is_final"
                  className="text-sm text-neutral-300 cursor-pointer"
                >
                  نهایی کردن{" "}
                </label>
              </div>

              {/* Info Box */}
              <div className="bg-blue-900/20 border border-blue-500/50 rounded p-3">
                <div className="text-xs text-blue-300">
                  💡 تمام فیلدها اختیاری هستند به جز <strong>مقدار جواب</strong>{" "}
                  و <strong>تاریخ آزمون</strong>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-700 sticky bottom-0 bg-neutral-900">
              <button
                onClick={() => {
                  setShowResultModal(false);
                  setEditingResult(null);
                }}
                disabled={loading}
                className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveResult}
                disabled={
                  loading || !resultForm.result_value || !resultForm.test_date
                }
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    در حال ذخیره...
                  </>
                ) : editingResult.id ? (
                  "ذخیره تغییرات"
                ) : (
                  "افزودن جواب"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TestResultsTab;
