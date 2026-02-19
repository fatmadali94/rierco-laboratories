// src/components/reception/RecordsList.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRecords,
  updateRecord,
  updateRecordTest,
  searchRecords,
  selectRecords,
  selectSearchResults,
  selectPagination,
  selectRecordsLoading,
  removeTestFromRecord,
  addTestToRecord,
  fetchRecordsByCustomer,
  fetchRecordsByOrderer,
  deleteRecord,
  updateRecordState,
} from "../../redux/records/recordsSlice";
import {
  fetchActiveTests,
  selectActiveTests,
  fetchActiveStandards,
  selectActiveStandards,
} from "../../redux/tests/testsSlice";
import TestResultsTab from "./TestResultsTab";
import AutoConfirmToast from "../AutoConfirmToast";

const RecordsResult = () => {
  const dispatch = useDispatch();

  const records = useSelector(selectRecords);
  const searchResults = useSelector(selectSearchResults);
  const searchByCustomerResult = useSelector(selectRecords);
  const searchByOrdererResult = useSelector(selectRecords);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectRecordsLoading);
  const activeTests = useSelector(selectActiveTests);
  const activeStandards = useSelector(selectActiveStandards);
  const [activeRecordId, setActiveRecordId] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [ordererSearchTerm, setOrdererSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    state: ["in_laboratory", "testing", "completed"],
    page: 1,
    limit: 20,
  });

  // Dropdown edit state
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  const [activeTab, setActiveTab] = useState("tests"); // 'tests' or 'results'
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [editForm, setEditForm] = useState({
    test_id: null,
    standard_id: null,
    additional_charges: 0,
    discount: 0,
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [addingToRecord, setAddingToRecord] = useState(null);
  const [newTestForm, setNewTestForm] = useState({
    test_id: null,
    standard_id: null,
    additional_charges: 0,
    discount: 0,
    reception_notes: "",
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

  useEffect(() => {
    if (!searchTerm) {
      dispatch(fetchRecords(filters));
    }
  }, [dispatch, filters, searchTerm]);

  useEffect(() => {
    if (!customerSearchTerm) {
      dispatch(fetchRecords(filters));
    }
  }, [dispatch, filters, customerSearchTerm]);

  useEffect(() => {
    if (!ordererSearchTerm) {
      dispatch(fetchRecords(filters));
    }
  }, [dispatch, filters, ordererSearchTerm]);

  useEffect(() => {
    dispatch(fetchActiveTests());
    dispatch(fetchActiveStandards());
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(searchRecords({ searchTerm, state: filters.state }));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, dispatch, filters.state]);

  useEffect(() => {
    if (customerSearchTerm.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(
          fetchRecordsByCustomer({
            customerName: customerSearchTerm,
            state: filters.state,
          }),
        );
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [customerSearchTerm, dispatch, filters.state]);

  useEffect(() => {
    if (ordererSearchTerm.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(
          fetchRecordsByOrderer({
            ordererName: ordererSearchTerm,
            state: filters.state,
          }),
        );
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [ordererSearchTerm, dispatch, filters.state]);

  const displayRecords = searchTerm
    ? searchResults
    : customerSearchTerm
      ? searchByCustomerResult
      : ordererSearchTerm
        ? searchByOrdererResult
        : records;

  const getCurrentRecord = () => {
    const displayRecords = searchTerm
      ? searchResults
      : customerSearchTerm
        ? searchByCustomerResult
        : ordererSearchTerm
          ? searchByOrdererResult
          : records;
    return displayRecords.find((r) => r.id === expandedRecordId);
  };

  const currentRecord = getCurrentRecord();

  const handleEditTest = (test) => {
    setEditingTest(test);
    setEditForm({
      test_id: test.test_id,
      standard_id: test.standard_id,
      additional_charges: test.additional_charges,
      discount: test.discount,
    });
    setShowEditModal(true);
  };

  const handleSaveTestEdit = async () => {
    if (!editForm.test_id) {
      alert("لطفاً آزمون را انتخاب کنید");
      return;
    }

    try {
      await dispatch(
        updateRecordTest({
          recordTestId: editingTest.id,
          updates: {
            test_id: editForm.test_id,
            standard_id: editForm.standard_id || null,
            additional_charges: parseFloat(editForm.additional_charges) || 0,
            discount: parseFloat(editForm.discount) || 0,
          },
        }),
      ).unwrap();
      await dispatch(
        updateRecord({
          recordId: expandedRecordId,
          updates: { modified_by_lab: true },
        }),
      ).unwrap();

      dispatch(fetchRecords(filters));
      setShowEditModal(false);
      setEditingTest(null);
      setEditForm({
        test_id: null,
        standard_id: null,
        additional_charges: 0,
        discount: 0,
      });

      alert("آزمون با موفقیت بروزرسانی شد");
    } catch (err) {
      console.error("Error updating test:", err);
      alert(err || "خطا در بروزرسانی آزمون");
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingTest(null);
    setEditForm({
      test_id: null,
      standard_id: null,
      additional_charges: 0,
      discount: 0,
    });
  };

  const handleAddTest = (recordId) => {
    setAddingToRecord(recordId);
    setNewTestForm({
      test_id: null,
      standard_id: null,
      additional_charges: 0,
      discount: 0,
      reception_notes: "",
    });
    setShowAddTestModal(true);
  };

  const handleSaveNewTest = async () => {
    if (!newTestForm.test_id) {
      alert("لطفاً آزمون را انتخاب کنید");
      return;
    }

    try {
      await dispatch(
        addTestToRecord({
          recordId: addingToRecord,
          testData: {
            test_id: newTestForm.test_id,
            standard_id: newTestForm.standard_id || null,
            additional_charges: parseFloat(newTestForm.additional_charges) || 0,
            discount: parseFloat(newTestForm.discount) || 0,
            reception_notes: newTestForm.reception_notes || null,
          },
        }),
      ).unwrap();
      await dispatch(
        updateRecord({
          recordId: addingToRecord,
          updates: { modified_by_lab: true },
        }),
      ).unwrap();

      dispatch(fetchRecords(filters));
      setShowAddTestModal(false);
      setAddingToRecord(null);
      setNewTestForm({
        test_id: null,
        standard_id: null,
        additional_charges: 0,
        discount: 0,
        reception_notes: "",
      });

      alert("آزمون جدید با موفقیت اضافه شد");
    } catch (err) {
      console.error("Error adding test:", err);
      alert(err || "خطا در افزودن آزمون");
    }
  };

  const handleCancelAddTest = () => {
    setShowAddTestModal(false);
    setAddingToRecord(null);
    setNewTestForm({
      test_id: null,
      standard_id: null,
      additional_charges: 0,
      discount: 0,
      reception_notes: "",
    });
  };

  const handleDeleteTest = async (recordTestId) => {
    if (!window.confirm("آیا از حذف این آزمون اطمینان دارید؟")) {
      return;
    }

    try {
      await dispatch(removeTestFromRecord(recordTestId)).unwrap();
      await dispatch(
        updateRecord({
          recordId: expandedRecordId,
          updates: { modified_by_lab: true },
        }),
      ).unwrap();
      dispatch(fetchRecords(filters));
      alert("آزمون با موفقیت حذف شد");
    } catch (err) {
      console.error("Error deleting test:", err);
      alert(err || "خطا در حذف آزمون");
    }
  };

  const calculatePreviewPrice = () => {
    const selectedTest = activeTests.find((t) => t.id === editForm.test_id);
    if (!selectedTest) return 0;

    const basePrice = parseFloat(selectedTest.base_price) || 0;
    const additional = parseFloat(editForm.additional_charges) || 0;
    const discount = parseFloat(editForm.discount) || 0;

    return basePrice + additional - discount;
  };

  const calculateNewTestPrice = () => {
    const selectedTest = activeTests.find((t) => t.id === newTestForm.test_id);
    if (!selectedTest) return 0;

    const basePrice = parseFloat(selectedTest.base_price) || 0;
    const additional = parseFloat(newTestForm.additional_charges) || 0;
    const discount = parseFloat(newTestForm.discount) || 0;

    return basePrice + additional - discount;
  };

  const toggleExpand = (record) => {
    if (expandedRecordId === record.id) {
      setExpandedRecordId(null);
      setActiveTab("tests");
      resetEditForm();
    } else {
      setExpandedRecordId(record.id);
      setActiveTab("tests");
      loadEditForm(record);
    }
  };

  const loadEditForm = (record) => {
    setEditForm({
      test_id: record.test_id,
      standard_id: record.standard_id,
      additional_charges: record.additional_charges || 0,
      discount: record.discount || 0,
    });

    try {
      const images =
        typeof record.sample_images === "string"
          ? JSON.parse(record.sample_images)
          : Array.isArray(record.sample_images)
            ? record.sample_images
            : [];
      setExistingImages(images);
    } catch (e) {
      setExistingImages([]);
    }

    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const resetEditForm = () => {
    setEditForm({
      test_id: null,
      standard_id: null,
      additional_charges: 0,
      discount: 0,
    });
    setExistingImages([]);
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length > 10) {
      alert("حداکثر 10 فایل می‌توانید داشته باشید");
      return;
    }

    setSelectedFiles(files);

    const previews = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          resolve({ name: file.name, url: e.target.result });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(setFilePreviews);
  };

  const handleSendToReception = (recordId) => {
    setActiveRecordId(recordId);
    setShowToast(true);
  };

  const handleConfirm = async () => {
    const recordId = activeRecordId; // capture before clearing
    setActiveRecordId(null); // ← clear FIRST
    setShowToast(false);

    try {
      await dispatch(
        updateRecordState({ recordId, state: "completed" }),
      ).unwrap();
      dispatch(fetchRecords(filters));
    } catch (err) {
      console.error("Failed to send to reception:", err);
    }
  };

  const handleCancel = () => {
    setActiveRecordId(null); // ← make sure this is here
    setShowToast(false);
  };
  const handleRefreshRecords = () => {
    dispatch(fetchRecords(filters));
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-left justify-between">
        <div className="relative w-80">
          <select
            value={filters.state}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                state: e.target.value,
                page: 1,
              }))
            }
            className="w-auto h-12 px-4 bg-neutral-900 border border-[#5271ff]/20 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="received">دریافت شده</option>
            <option value="in_laboratory">در آزمایشگاه</option>
            <option value="testing">در حال آزمون</option>
            <option value="completed">تکمیل شده</option>
            <option value="invoiced">فاکتور شده</option>
          </select>
        </div>

        <div className="relative w-80">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی شماره رکورد..."
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
        </div>

        <div className="relative w-80">
          <input
            value={customerSearchTerm}
            onChange={(e) => setCustomerSearchTerm(e.target.value)}
            placeholder="جستجوی مشتری حقوقی..."
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
        </div>

        <div className="relative w-80">
          <input
            value={ordererSearchTerm}
            onChange={(e) => setOrdererSearchTerm(e.target.value)}
            placeholder="جستجوی  متقاضی..."
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
        </div>
      </div>

      {/* Table */}
      <div className="space-y-6">
        <div className="bg-neutral-800/50 border border-[#5271ff]/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-black border-b border-[#5271ff]/20">
              <tr>
                <th className="px-4 py-3 text-center text-sm border-r border-black font-medium text-neutral-300">
                  تکمیل؟
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black font-medium text-neutral-300">
                  شماره رکورد
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black font-medium text-neutral-300">
                  مشتری/متقاضی
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  تعداد آزمون
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  قیمت کل(ریال)
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  وضعیت
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  جواب
                </th>
              </tr>
            </thead>
            <tbody>
              {displayRecords.map((record) => (
                <React.Fragment key={record.id}>
                  {/* Main Row */}
                  <tr className="hover:bg-neutral-800/30 border-b border-black/20">
                    <td className="px-4 py-3 text-center text-sm border-r border-black/20">
                      <div>
                        <button
                          onClick={() => handleSendToReception(record.id)}
                          className="px-3 py-1.5 bg-orange text-center text-white text-sm rounded hover:bg-orange/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={record.record_state === "completed"}
                        ></button>
                        {showToast && (
                          <AutoConfirmToast
                            key={activeRecordId} // ← forces fresh mount for each record
                            message="پرونده به پذیرش برمی‌گردد"
                            onConfirm={handleConfirm}
                            onCancel={handleCancel}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-neutral-200 border-r border-black/20">
                      {record.record_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-neutral-200 border-r border-black/20">
                      {record.customer_name || record.orderer_name || "-"}
                    </td>

                    <td className="px-4 py-3 text-sm text-center text-neutral-200 border-r border-black/20">
                      <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs">
                        {record.test_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-medium text-green-400 border-r border-black/20">
                      {formatCurrency(record.total_price)}
                    </td>
                    <td className="px-6 py-4 border-r border-black/20">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 text-center  py-1 text-xs font-medium rounded-full ${
                            record.record_state === "received"
                              ? "bg-blue-900/30 text-blue-400"
                              : record.record_state === "in_laboratory"
                                ? "bg-yellow text-darkOrange"
                                : record.record_state === "testing"
                                  ? "bg-purple-900/30 text-purple-400"
                                  : record.record_state === "completed"
                                    ? "bg-green-900/30 text-green-400"
                                    : "bg-gray-900/30 text-gray-400"
                          }`}
                        >
                          {record.record_state === "received"
                            ? "دریافت شده"
                            : record.record_state === "in_laboratory"
                              ? "در آزمایشگاه"
                              : record.record_state === "testing"
                                ? "در حال آزمون"
                                : record.record_state === "completed"
                                  ? "تکمیل شده"
                                  : "فاکتور شده"}
                        </span>
                        {record.invoice_finalized && (
                          <span className="px-2 py-1 text-xs font-medium text-center rounded-full bg-red-900/30 text-red-400">
                            🔒 قفل شده
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-black/20">
                      <button
                        onClick={() => toggleExpand(record)}
                        className="text-pink"
                      >
                        {expandedRecordId === record.id ? "▲ " : "▼ "}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Section with Tabs */}
                  {expandedRecordId === record.id && (
                    <tr>
                      <td colSpan="9" className="px-0 py-0">
                        <div className="bg-neutral-900/80 border-t border-[#5271ff]/20 animate-slideDown">
                          <div className="p-6 space-y-6">
                            {/* Tab Navigation */}
                            <div className="flex gap-2 border-b border-neutral-700 pb-2">
                              <button
                                onClick={() => setActiveTab("tests")}
                                className={`px-6 py-2 rounded-t-lg font-medium transition-colors ${
                                  activeTab === "tests"
                                    ? "bg-darkOrange text-white"
                                    : "bg-yellow text-white hover:bg-orange"
                                }`}
                              >
                                📋 آزمون‌ها
                              </button>
                              <button
                                onClick={() => {
                                  setActiveTab("results");
                                  // Update record state to "testing"
                                  dispatch(
                                    updateRecord({
                                      recordId: record.id,
                                      updates: { state: "testing" },
                                    }),
                                  ).unwrap();
                                }}
                                className={`px-6 py-2 rounded-t-lg font-medium transition-colors ${
                                  activeTab === "results"
                                    ? "bg-darkOrange text-white"
                                    : "bg-yellow text-white hover:bg-orange"
                                }`}
                              >
                                📊 نتایج آزمون‌ها
                              </button>
                            </div>

                            {/* Tests Tab Content */}
                            {activeTab === "tests" && (
                              <div className="bg-black border border-darkOrange rounded-lg p-4">
                                <h4 className="text-center text-orange mb-4">
                                  در صورت نیاز آزمون‌ها را اصلاح کنید
                                </h4>
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-base font-medium text-neutral-100 flex items-left gap-2">
                                    <span className="text-lg">📋</span>
                                    آزمون‌های رکورد {record.record_number}
                                  </h4>

                                  <button
                                    onClick={() => handleAddTest(record.id)}
                                    disabled={record.invoice_finalized}
                                    className="px-3 py-1.5 bg-pink border border-black text-white text-sm rounded hover:border hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    + افزودن آزمون
                                  </button>
                                </div>

                                {record.tests && record.tests.length > 0 ? (
                                  <div className="space-y-3">
                                    {record.tests.map((test, idx) => (
                                      <div
                                        key={test.id}
                                        className="bg-neutral-900 border border-yellow rounded-lg p-4"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-left gap-2 mb-2">
                                              <span className="text-white/30 text-sm">
                                                #{idx + 1}
                                              </span>
                                              <h5 className="font-medium text-white">
                                                {test.test_title}
                                              </h5>
                                              {test.test_code && (
                                                <span className="text-xs text-neutral-200 bg-yellow/50 p-1 rounded">
                                                  {test.test_code}
                                                </span>
                                              )}
                                            </div>

                                            {test.standard_code && (
                                              <div className="text-sm text-white mb-2">
                                                استاندارد: {test.standard_code}
                                                {test.standard_title &&
                                                  ` - ${test.standard_title}`}
                                              </div>
                                            )}

                                            <div className="mt-2">
                                              <span
                                                className={`px-2 py-1 rounded text-xs ${
                                                  test.state === "pending"
                                                    ? "bg-yellow/20 text-yellow/40"
                                                    : test.state ===
                                                        "in_progress"
                                                      ? "bg-blue-900/30 text-blue-400"
                                                      : test.state ===
                                                          "completed"
                                                        ? "bg-green-900/30 text-green-400"
                                                        : "bg-gray-900/30 text-gray-400"
                                                }`}
                                              >
                                                {test.state === "pending"
                                                  ? "در انتظار"
                                                  : test.state === "in_progress"
                                                    ? "در حال انجام"
                                                    : test.state === "completed"
                                                      ? "تکمیل شده"
                                                      : test.state}
                                              </span>
                                            </div>

                                            {test.reception_notes && (
                                              <div className="mt-2 text-xs text-white italic">
                                                📝 {test.reception_notes}
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex flex-col text-center gap-2 ml-4">
                                            {record.invoice_finalized ? (
                                              <div className="text-xs  text-yellow/25 flex items-left gap-1">
                                                🔒 قفل شده
                                              </div>
                                            ) : (
                                              <>
                                                <button
                                                  onClick={() =>
                                                    handleEditTest(test)
                                                  }
                                                  className="px-3 py-1.5 bg-orange text-white text-sm rounded hover:bg-orange/90"
                                                >
                                                  ویرایش
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    handleDeleteTest(test.id)
                                                  }
                                                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                >
                                                  حذف
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center text-neutral-500 py-8">
                                    هیچ آزمونی یافت نشد
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Results Tab Content - Using the new component */}
                            {activeTab === "results" && (
                              <TestResultsTab
                                record={record}
                                onRefresh={handleRefreshRecords}
                              />
                            )}

                            {record.invoice_finalized && (
                              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                                <div className="flex items-left gap-2 text-red-400 text-sm">
                                  <span className="text-lg">🔒</span>
                                  <div>
                                    <div className="font-medium">
                                      فاکتور نهایی شده است
                                    </div>
                                    <div className="text-xs text-red-500 mt-1">
                                      این رکورد قابل ویرایش نیست
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-700">
                              <button
                                onClick={() => {
                                  setExpandedRecordId(null);
                                  setActiveTab("tests");
                                }}
                                className="w-full px-6 py-2 bg-neutral-700 text-black rounded-lg hover:bg-neutral-600 transition-colors"
                              >
                                ▲ بستن
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="text-center py-8 text-neutral-400">
              در حال بارگذاری...
            </div>
          )}

          {!loading && records.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              هیچ رکوردی یافت نشد
            </div>
          )}
        </div>
        {/* Edit Test Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-black border border-orange rounded-lg p-6 max-w-2xl w-full mx-4">
              <h3 className="text-xl text-center font-semibold text-neutral-100 mb-4">
                ویرایش آزمون
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">
                    آزمون *
                  </label>
                  <select
                    value={editForm.test_id || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        test_id: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-11 px-3 bg-black border border-orange rounded text-sm text-white"
                  >
                    <option value="">انتخاب آزمون</option>
                    {activeTests.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.title} ({test.code} کد)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-white mb-2">
                    استاندارد (اختیاری)
                  </label>
                  <select
                    value={editForm.standard_id || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        standard_id: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      }))
                    }
                    className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                  >
                    <option value="">بدون استاندارد</option>
                    {activeStandards.map((standard) => (
                      <option key={standard.id} value={standard.id}>
                        {standard.code} - {standard.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-300 mb-2">
                      هزینه اضافی
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.additional_charges}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          additional_charges: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-300 mb-2">
                      تخفیف
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.discount}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          discount: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                    />
                  </div>
                </div>

                <div className="bg-neutral-800/50 justify-center text-center border border-[#5271ff]/20 rounded p-3">
                  <div className="text-sm text-neutral-400 ">
                    :قیمت نهایی پیش‌بینی شده
                  </div>
                  <div className="text-xl font-bold text-green-400 mt-1">
                    {formatCurrency(calculatePreviewPrice())}
                    ریال
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSaveTestEdit}
                  disabled={!editForm.test_id}
                  className="px-4 py-2 bg-pink border border-black text-white rounded hover:border hover:border-white disabled:opacity-50"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </div>
          </div>
        )}
        {/* <ConfirmDialog
          isOpen={confirmDialog.open}
          onConfirm={handleConfirmSend}
          onCancel={() => setConfirmDialog({ open: false, recordId: null })}
        /> */}

        {/* Add Test Modal */}
        {showAddTestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-black border border-orange rounded-lg p-6 max-w-2xl w-full mx-4">
              <h3 className="text-xl text-center font-semibold text-neutral-100 mb-4">
                افزودن آزمون جدید
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">
                    آزمون *
                  </label>
                  <select
                    value={newTestForm.test_id || ""}
                    onChange={(e) =>
                      setNewTestForm((prev) => ({
                        ...prev,
                        test_id: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-11 px-3 bg-black border border-orange rounded text-sm text-white"
                  >
                    <option value="">انتخاب آزمون</option>
                    {activeTests.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.title} {formatCurrency(test.base_price)} ریال
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">
                    استاندارد (اختیاری)
                  </label>
                  <select
                    value={newTestForm.standard_id || ""}
                    onChange={(e) =>
                      setNewTestForm((prev) => ({
                        ...prev,
                        standard_id: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      }))
                    }
                    className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                  >
                    <option value="">بدون استاندارد</option>
                    {activeStandards.map((standard) => (
                      <option key={standard.id} value={standard.id}>
                        {standard.code} - {standard.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-300 mb-2">
                      هزینه اضافی
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newTestForm.additional_charges}
                      onChange={(e) =>
                        setNewTestForm((prev) => ({
                          ...prev,
                          additional_charges: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-300 mb-2">
                      تخفیف
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newTestForm.discount}
                      onChange={(e) =>
                        setNewTestForm((prev) => ({
                          ...prev,
                          discount: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">
                    یادداشت برای پذیرش
                  </label>
                  <textarea
                    value={newTestForm.reception_notes}
                    onChange={(e) =>
                      setNewTestForm((prev) => ({
                        ...prev,
                        reception_notes: e.target.value,
                      }))
                    }
                    rows="3"
                    className="w-full px-3 py-2 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                  />
                </div>

                <div className="bg-neutral-800/50 justify-center text-center border border-[#5271ff]/20 rounded p-3">
                  <div className="text-sm text-neutral-400">
                    :قیمت نهایی پیش‌بینی شده
                  </div>
                  <div className="text-xl font-bold text-green-400 mt-1">
                    {formatCurrency(calculateNewTestPrice())}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleCancelAddTest}
                  className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSaveNewTest}
                  disabled={!newTestForm.test_id}
                  className="px-4 py-2 bg-pink border border-black text-white rounded hover:border hover:border-white disabled:opacity-50"
                >
                  افزودن آزمون
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!searchTerm && pagination && (
        <div className="flex items-left justify-between">
          <div className="text-sm text-black">
            صفحه {pagination.page} از {pagination.totalPages} (
            {pagination.total} رکورد)
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              قبلی
            </button>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsResult;
