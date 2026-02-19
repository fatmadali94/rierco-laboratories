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

function PassFailToggle({ value, onChange }) {
  const options = [
    {
      label: "قبول",
      value: true,
      color: "#22c55e",
      glow: "rgba(34,197,94,0.4)",
    },
    {
      label: "خالی",
      value: "",
      color: "#6b7280",
      glow: "rgba(107,114,128,0.3)",
    },
    {
      label: "رد",
      value: false,
      color: "#ef4444",
      glow: "rgba(239,68,68,0.4)",
    },
  ];

  return (
    <div style={{ direction: "rtl" }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          color: "#a3a3a3",
          marginBottom: 10,
          fontFamily: "'Vazirmatn', sans-serif",
        }}
      >
        نتیجه آزمون
      </label>
      <div
        style={{
          display: "inline-flex",
          background: "linear-gradient(145deg, #0f0f0f, #1a1a1a)",
          borderRadius: 16,
          padding: 5,
          gap: 4,
          boxShadow:
            "inset 0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              onClick={() => onChange(opt.value)}
              style={{
                position: "relative",
                padding: "10px 22px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontFamily: "'Vazirmatn', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: 0.5,
                transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                background: active
                  ? `linear-gradient(145deg, ${opt.color}dd, ${opt.color}99)`
                  : "transparent",
                color: active ? "#fff" : "#6b7280",
                boxShadow: active
                  ? `0 6px 20px ${opt.glow}, 0 2px 0 rgba(255,255,255,0.15) inset, 0 -2px 0 rgba(0,0,0,0.4) inset`
                  : "none",
                transform: active
                  ? "translateY(-2px) scale(1.03)"
                  : "translateY(0) scale(1)",
                textShadow: active ? `0 1px 8px ${opt.glow}` : "none",
              }}
            >
              {active && (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 12,
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)",
                    pointerEvents: "none",
                  }}
                />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Beveled Input
function BevelInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ direction: "rtl" }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          color: focused ? "#818cf8" : "#9ca3af",
          marginBottom: 7,
          fontFamily: "'Vazirmatn', sans-serif",
          letterSpacing: 0.3,
          transition: "color 0.2s",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#f87171", marginRight: 4 }}>*</span>
        )}
      </label>
      <div
        style={{
          position: "relative",
          borderRadius: 12,
          background: "linear-gradient(145deg, #111, #1c1c1c)",
          boxShadow: focused
            ? "0 0 0 2px #5271ff66, 4px 4px 10px rgba(0,0,0,0.5), -1px -1px 0 rgba(255,255,255,0.07) inset, 2px 2px 4px rgba(0,0,0,0.6) inset"
            : "4px 4px 10px rgba(0,0,0,0.5), -1px -1px 0 rgba(255,255,255,0.06) inset, 2px 2px 4px rgba(0,0,0,0.5) inset",
          border: focused
            ? "1.5px solid #5271ff55"
            : "1.5px solid rgba(255,255,255,0.07)",
          transition: "all 0.2s",
        }}
      >
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: 44,
            padding: "0 14px",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#f3f4f6",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Vazirmatn', sans-serif",
            textAlign: "right",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}

// Beveled Textarea
function BevelTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ direction: "rtl" }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          color: focused ? "#818cf8" : "#9ca3af",
          marginBottom: 7,
          fontFamily: "'Vazirmatn', sans-serif",
          letterSpacing: 0.3,
          transition: "color 0.2s",
        }}
      >
        {label}
      </label>
      <div
        style={{
          borderRadius: 12,
          background: "linear-gradient(145deg, #111, #1c1c1c)",
          boxShadow: focused
            ? "0 0 0 2px #5271ff66, 4px 4px 10px rgba(0,0,0,0.5), -1px -1px 0 rgba(255,255,255,0.07) inset, 2px 2px 4px rgba(0,0,0,0.6) inset"
            : "4px 4px 10px rgba(0,0,0,0.5), -1px -1px 0 rgba(255,255,255,0.06) inset, 2px 2px 4px rgba(0,0,0,0.5) inset",
          border: focused
            ? "1.5px solid #5271ff55"
            : "1.5px solid rgba(255,255,255,0.07)",
          transition: "all 0.2s",
        }}
      >
        <textarea
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: "100%",
            padding: "12px 14px",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#f3f4f6",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Vazirmatn', sans-serif",
            textAlign: "right",
            resize: "vertical",
            boxSizing: "border-box",
            lineHeight: 1.7,
          }}
        />
      </div>
    </div>
  );
}

// Info Chip (for pre-fetched data)
function InfoChip({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#6b7280",
          fontFamily: "'Vazirmatn', sans-serif",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </span>
      {value ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "linear-gradient(135deg, #1e2540, #1a1f38)",
            border: "1px solid #5271ff33",
            borderRadius: 10,
            padding: "7px 14px",
            boxShadow:
              "0 2px 8px rgba(82,113,255,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#a5b4fc",
              fontFamily: "'Vazirmatn', sans-serif",
              letterSpacing: 0.5,
            }}
          >
            {value}
          </span>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#5271ff",
              boxShadow: "0 0 6px #5271ff",
            }}
          />
        </div>
      ) : (
        <span
          style={{
            fontSize: 13,
            color: "#374151",
            fontFamily: "'Vazirmatn', sans-serif",
          }}
        >
          —
        </span>
      )}
    </div>
  );
}

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
    uncertainty: "",
    acceptance_range: "",
    declaration_of_conformity: "",
    // test_method_description: "",
    observations: "",
    environmental_conditions: "",
    passed: "",
    test_date: new Date().toISOString().split("T")[0],
  });
  const [resultFiles, setResultFiles] = useState([]);
  const [resultFilePreviews, setResultFilePreviews] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  console.log(editingResult);

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
    console.log("test object:", test);
    setResultForm({
      result_value: "",
      uncertainty: "",
      acceptance_range: "",
      declaration_of_conformity: "",
      // test_method_description: "",
      observations: "",
      environmental_conditions: "",
      passed: "",
      test_date: new Date().toISOString().split("T")[0],
    });
    setResultFiles([]);
    setResultFilePreviews([]);
    setExistingFiles([]);
    setShowResultModal(true);
    setEditingResult({
      record_test_id: test.id,
      test_title: test.test_title,
      standard_title: test.standard_title,
      test_measurement_unit: test.test_measurement_unit,
    });
  };

  const handleEditResult = (result, test) => {
    setEditingResult({
      ...result,
      record_test_id: test.id,
      test_title: test.test_title,
    });
    setResultForm({
      result_value: result.result_value || "",
      uncertainty: result.uncertainty || "",
      acceptance_range: result.acceptance_range || "",
      declaration_of_conformity: result.declaration_of_conformity || "",
      // test_method_description: result.test_method_description || "",
      observations: result.observations || "",
      environmental_conditions: result.environmental_conditions || "",
      passed: result.passed || "",
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
          }),
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
                                  {result.result_value}{" "}
                                  {result.test_measurement_unit}
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
                                    result.test_date,
                                  ).toLocaleDateString("fa-IR")}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs ${
                                    result.passed
                                      ? "bg-green-900/30 text-green-400"
                                      : "bg-gray-700 text-black"
                                  }`}
                                >
                                  {result.passed ? "Pass" : ""}
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
                          {/* {result.test_method_description && (
                            <div className="mt-2 text-xs text-neutral-400">
                              <span className="text-neutral-500">روش: </span>
                              {result.test_method_description}
                            </div>
                          )} */}
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
        <>
          <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f0f0f; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #5271ff44; }
        input::placeholder, textarea::placeholder { color: #374151; font-weight: 500; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: 16,
              overflowY: "auto",
              fontFamily: "'Vazirmatn', sans-serif",
            }}
          >
            {/* Modal */}
            <div
              style={{
                background:
                  "linear-gradient(160deg, #141418 0%, #0f0f13 50%, #12121a 100%)",
                border: "1px solid rgba(82,113,255,0.2)",
                borderRadius: 20,
                width: "100%",
                maxWidth: 760,
                margin: "auto",
                overflow: "hidden",
                boxShadow:
                  "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(82,113,255,0.3) inset",
                animation:
                  "fadeSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                direction: "rtl",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "22px 28px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background:
                    "linear-gradient(90deg, rgba(82,113,255,0.08), transparent)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    left: 0,
                    height: 1,
                    background:
                      "linear-gradient(90deg, transparent, rgba(82,113,255,0.6), transparent)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background:
                          "linear-gradient(135deg, #5271ff22, #5271ff44)",
                        border: "1px solid #5271ff44",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        boxShadow: "0 4px 12px rgba(82,113,255,0.2)",
                      }}
                    >
                      🧪
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#5271ff",
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          marginBottom: 3,
                        }}
                      >
                        {editingResult.id ? "ویرایش نتیجه" : "افزودن نتیجه"}
                      </div>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 800,
                          color: "#f3f4f6",
                        }}
                      >
                        {editingResult.test_title}
                      </div>
                    </div>
                  </div>
                  {/* Pre-fetched info chips in header area */}
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                    }}
                  >
                    <InfoChip
                      label="واحد اندازه‌گیری"
                      value={editingResult.test_measurement_unit}
                    />
                    <InfoChip
                      label="استاندارد"
                      value={editingResult.standard_title}
                    />
                    <InfoChip
                      label="تاریخ آزمون"
                      value={new Date(resultForm.test_date).toLocaleDateString(
                        "fa-IR",
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Body */}
              <div
                style={{
                  padding: "24px 28px",
                  overflowY: "auto",
                  maxHeight: "calc(90vh - 180px)",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}
                >
                  {/* Row 1: Main fields */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <BevelInput
                      label="مقدار جواب"
                      required
                      value={resultForm.result_value}
                      onChange={(e) =>
                        setResultForm((p) => ({
                          ...p,
                          result_value: e.target.value,
                        }))
                      }
                      placeholder="مثال: 25.5"
                    />
                    <BevelInput
                      label="عدم قطعیت"
                      value={resultForm.uncertainty}
                      onChange={(e) =>
                        setResultForm((p) => ({
                          ...p,
                          uncertainty: e.target.value,
                        }))
                      }
                      placeholder="مثال: ±0.5"
                    />
                  </div>

                  {/* Row 2 */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <BevelInput
                      label="محدوده پذیرش"
                      value={resultForm.acceptance_range}
                      onChange={(e) =>
                        setResultForm((p) => ({
                          ...p,
                          acceptance_range: e.target.value,
                        }))
                      }
                      placeholder="مثال: 20-30"
                    />
                    <BevelInput
                      label="اظهار انطباق"
                      value={resultForm.declaration_of_conformity}
                      onChange={(e) =>
                        setResultForm((p) => ({
                          ...p,
                          declaration_of_conformity: e.target.value,
                        }))
                      }
                      placeholder="مثال: منطبق، غیرمنطبق"
                    />
                  </div>

                  {/* Row 3: Textareas */}
                  <BevelTextarea
                    label="شرح مشاهدات"
                    value={resultForm.observations}
                    onChange={(e) =>
                      setResultForm((p) => ({
                        ...p,
                        observations: e.target.value,
                      }))
                    }
                    placeholder="توضیحات ..."
                    rows={3}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <BevelInput
                      label="شرایط محیطی"
                      value={resultForm.environmental_conditions}
                      onChange={(e) =>
                        setResultForm((p) => ({
                          ...p,
                          environmental_conditions: e.target.value,
                        }))
                      }
                      placeholder="مثال: دمای ۲۳°C، رطوبت ۵۰٪"
                    />
                    {/* <BevelInput
                      label="توضیحات"
                      value={resultForm.observations}
                      onChange={(e) =>
                        setResultForm((p) => ({
                          ...p,
                          observations: e.target.value,
                        }))
                      }
                      placeholder="یادداشت‌های اضافی..."
                    /> */}
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: 1,
                      background:
                        "linear-gradient(90deg, transparent, rgba(82,113,255,0.2), transparent)",
                    }}
                  />

                  {/* Pass/Fail Toggle */}
                  <PassFailToggle
                    value={resultForm.passed}
                    onChange={(v) =>
                      setResultForm((p) => ({ ...p, passed: v }))
                    }
                  />

                  {/* Divider */}
                  <div
                    style={{
                      height: 1,
                      background:
                        "linear-gradient(90deg, transparent, rgba(82,113,255,0.2), transparent)",
                    }}
                  />

                  {/* File Upload */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#9ca3af",
                        marginBottom: 10,
                        fontFamily: "'Vazirmatn', sans-serif",
                      }}
                    >
                      فایل‌های ضمیمه
                      <span
                        style={{
                          fontSize: 11,
                          color: "#4b5563",
                          fontWeight: 500,
                          marginRight: 6,
                        }}
                      >
                        (اختیاری)
                      </span>
                    </label>

                    {existingFiles.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#4b5563",
                            marginBottom: 6,
                            fontFamily: "'Vazirmatn', sans-serif",
                          }}
                        >
                          فایل‌های موجود:
                        </div>
                        <div
                          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                        >
                          {existingFiles.map((f, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                background: "rgba(82,113,255,0.08)",
                                border: "1px solid rgba(82,113,255,0.2)",
                                borderRadius: 8,
                                padding: "6px 12px",
                              }}
                            >
                              <a
                                href={f}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#818cf8",
                                  fontSize: 12,
                                  fontFamily: "'Vazirmatn', sans-serif",
                                  textDecoration: "none",
                                }}
                              >
                                📎 فایل {i + 1}
                              </a>
                              <button
                                onClick={() => removeExistingFile(idx)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#ef4444",
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        borderRadius: 12,
                        background: "linear-gradient(145deg, #111, #1c1c1c)",
                        border: "1.5px dashed rgba(82,113,255,0.25)",
                        boxShadow:
                          "4px 4px 10px rgba(0,0,0,0.4), -1px -1px 0 rgba(255,255,255,0.04) inset",
                        overflow: "hidden",
                      }}
                    >
                      <input
                        type="file"
                        multiple
                        onChange={handleResultFileChange}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          background: "transparent",
                          border: "none",
                          color: "#6b7280",
                          fontSize: 13,
                          fontFamily: "'Vazirmatn', sans-serif",
                          cursor: "pointer",
                        }}
                      />
                    </div>

                    {resultFilePreviews.length > 0 && (
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        {resultFilePreviews.map((f, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              background: "rgba(34,197,94,0.08)",
                              border: "1px solid rgba(34,197,94,0.2)",
                              borderRadius: 8,
                              padding: "6px 12px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                color: "#86efac",
                                fontFamily: "'Vazirmatn', sans-serif",
                              }}
                            >
                              📎 {f.name}
                            </span>
                            <button
                              onClick={() => removeNewFile(i)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: 12,
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info box */}
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(82,113,255,0.06), rgba(82,113,255,0.02))",
                      border: "1px solid rgba(82,113,255,0.15)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>💡</span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        fontFamily: "'Vazirmatn', sans-serif",
                      }}
                    >
                      تمام فیلدها اختیاری هستند به جز{" "}
                      <strong style={{ color: "#818cf8" }}>مقدار جواب</strong> و{" "}
                      <strong style={{ color: "#818cf8" }}>تاریخ آزمون</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "16px 28px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  background:
                    "linear-gradient(90deg, rgba(82,113,255,0.04), transparent)",
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: 12,
                }}
              >
                <button
                  onClick={handleSaveResult}
                  disabled={loading || !resultForm.result_value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 28px",
                    borderRadius: 12,
                    border: "none",
                    cursor:
                      loading || !resultForm.result_value
                        ? "not-allowed"
                        : "pointer",
                    background:
                      loading || !resultForm.result_value
                        ? "linear-gradient(135deg, #1f2937, #111827)"
                        : "linear-gradient(135deg, #22c55e, #16a34a)",
                    color:
                      loading || !resultForm.result_value ? "#4b5563" : "#fff",
                    fontSize: 14,
                    fontWeight: 800,
                    fontFamily: "'Vazirmatn', sans-serif",
                    boxShadow:
                      loading || !resultForm.result_value
                        ? "none"
                        : "0 6px 20px rgba(34,197,94,0.35), 0 1px 0 rgba(255,255,255,0.2) inset, 0 -2px 0 rgba(0,0,0,0.3) inset",
                    transform:
                      loading || !resultForm.result_value
                        ? "none"
                        : "translateY(0)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && resultForm.result_value)
                      e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  {loading ? (
                    <>
                      <svg
                        style={{
                          animation: "spin 1s linear infinite",
                          width: 16,
                          height: 16,
                        }}
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          style={{ opacity: 0.25 }}
                        />
                        <path
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          style={{ opacity: 0.75 }}
                        />
                      </svg>
                      در حال ذخیره...
                    </>
                  ) : editingResult.id ? (
                    "ذخیره تغییرات"
                  ) : (
                    "افزودن جواب"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setEditingResult(null);
                  }}
                  disabled={loading}
                  style={{
                    padding: "11px 22px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    background: "linear-gradient(145deg, #1a1a1a, #141414)",
                    color: "#9ca3af",
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "'Vazirmatn', sans-serif",
                    boxShadow:
                      "4px 4px 10px rgba(0,0,0,0.4), -1px -1px 0 rgba(255,255,255,0.04) inset",
                    transition: "all 0.2s",
                  }}
                >
                  انصراف
                </button>
              </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </>
      )}
    </>
  );
};

export default TestResultsTab;
