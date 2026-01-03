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

const RecordsList = () => {
  const dispatch = useDispatch();

  const records = useSelector(selectRecords);

  const searchResults = useSelector(selectSearchResults);
  const searchByCustomerResult = useSelector(selectRecords);
  const searchByOrdererResult = useSelector(selectRecords);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectRecordsLoading);
  const activeTests = useSelector(selectActiveTests);
  const activeStandards = useSelector(selectActiveStandards);

  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [ordererSearchTerm, setOrdererSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    state: "",
    page: 1,
    limit: 20,
  });

  // Dropdown edit state
  const [expandedRecordId, setExpandedRecordId] = useState(null);
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
          })
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
          })
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
  console.log(displayRecords);
  // Get current record being edited
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
          recordTestId: editingTest.id, // This is record_tests.id
          updates: {
            test_id: editForm.test_id,
            standard_id: editForm.standard_id || null,
            additional_charges: parseFloat(editForm.additional_charges) || 0,
            discount: parseFloat(editForm.discount) || 0,
          },
        })
      ).unwrap();

      // Refresh records to show updated data
      dispatch(fetchRecords(filters));

      // Close modal
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

  // ADD TEST HANDLERS
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
        })
      ).unwrap();

      // Refresh records
      dispatch(fetchRecords(filters));

      // Close modal
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

  // DELETE TEST HANDLER
  const handleDeleteTest = async (recordTestId) => {
    if (!window.confirm("آیا از حذف این آزمون اطمینان دارید؟")) {
      return;
    }

    try {
      await dispatch(removeTestFromRecord(recordTestId)).unwrap();

      // Refresh records
      dispatch(fetchRecords(filters));

      alert("آزمون با موفقیت حذف شد");
    } catch (err) {
      console.error("Error deleting test:", err);
      alert(err || "خطا در حذف آزمون");
    }
  };

  const handleDeleteRecord = async (recordId, recordState) => {
    // Frontend validation
    if (recordState === "completed" || recordState === "invoiced") {
      alert("رکورد تکمیل شده یا فاکتور شده قابل حذف نیست");
      return;
    }

    if (
      !window.confirm(
        "آیا از حذف این رکورد اطمینان دارید؟ این عملیات غیرقابل بازگشت است."
      )
    ) {
      return;
    }

    try {
      await dispatch(deleteRecord(recordId)).unwrap();
      alert("رکورد با موفقیت حذف شد");
      // Refresh records list
      dispatch(fetchRecords(filters));
    } catch (err) {
      console.error("Error deleting record:", err);
      alert(err || "خطا در حذف رکورد");
    }
  };

  // Calculate preview price for edit form
  const calculatePreviewPrice = () => {
    const selectedTest = activeTests.find((t) => t.id === editForm.test_id);
    if (!selectedTest) return 0;

    const basePrice = parseFloat(selectedTest.base_price) || 0;
    const additional = parseFloat(editForm.additional_charges) || 0;
    const discount = parseFloat(editForm.discount) || 0;

    return basePrice + additional - discount;
  };

  // Calculate preview price for new test form
  const calculateNewTestPrice = () => {
    const selectedTest = activeTests.find((t) => t.id === newTestForm.test_id);
    if (!selectedTest) return 0;

    const basePrice = parseFloat(selectedTest.base_price) || 0;
    const additional = parseFloat(newTestForm.additional_charges) || 0;
    const discount = parseFloat(newTestForm.discount) || 0;

    return basePrice + additional - discount;
  };

  // Toggle edit dropdown
  const toggleExpand = (record) => {
    if (expandedRecordId === record.id) {
      // Close if clicking same record
      setExpandedRecordId(null);
      resetEditForm();
    } else {
      // Open new record
      setExpandedRecordId(record.id);
      loadEditForm(record);
    }
  };

  // Load record data into edit form
  const loadEditForm = (record) => {
    setEditForm({
      test_id: record.test_id,
      standard_id: record.standard_id,
      additional_charges: record.additional_charges || 0,
      discount: record.discount || 0,
    });

    // Parse existing images
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

  // Reset edit form
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

  // Handle file selection
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

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove new file
  const removeNewFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Save changes
  const handleSaveEdit = async () => {
    if (!expandedRecordId) return;

    try {
      const formDataToSend = new FormData();

      const updateData = {
        test_id: editForm.test_id,
        standard_id: editForm.standard_id || null,
        additional_charges: parseFloat(editForm.additional_charges) || 0,
        discount: parseFloat(editForm.discount) || 0,
        existing_images: existingImages,
      };

      formDataToSend.append("updateData", JSON.stringify(updateData));

      selectedFiles.forEach((file) => {
        formDataToSend.append("sample_images", file);
      });

      await dispatch(
        updateRecord({
          recordId: expandedRecordId,
          updates: formDataToSend,
        })
      ).unwrap();

      setExpandedRecordId(null);
      resetEditForm();
      dispatch(fetchRecords(filters));
    } catch (err) {
      console.error("Failed to update:", err);
      alert(err.message || "خطا در بروزرسانی رکورد");
    }
  };

  // Send to lab
  const handleSendToLab = async (recordId) => {
    try {
      await dispatch(
        updateRecordState({
          recordId: recordId,
          state: "in_laboratory",
        })
      ).unwrap();
      dispatch(fetchRecords(filters));
    } catch (err) {
      console.error("Failed to send to lab:", err);
      alert("خطا در ارسال به آزمایشگاه");
    }
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

        <div className="relative flex-1 max-w-md">
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
        {/* Table */}
        <div className="bg-neutral-800/50 border border-[#5271ff]/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-900/50 border-b border-[#5271ff]/20">
              <tr>
                <th className="px-4 py-3 text-center text-sm border-r border-black font-medium text-neutral-300">
                  ارسال؟
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black font-medium text-neutral-300">
                  شماره رکورد
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  مشتری/متقاضی
                </th>
                <th className="px-4 py-3 text-center text-xs border-r border-black  font-medium text-neutral-300">
                  آزمایشگاه آزمون‌ها را تغییر داده؟
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  تعداد آزمون
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  قیمت کل(تومان)
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  وضعیت
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  تغییر
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  حذف
                </th>
              </tr>
            </thead>
            <tbody>
              {displayRecords.map((record) => (
                <React.Fragment key={record.id}>
                  {/* Main Row */}
                  <tr className="hover:bg-neutral-800/30 border-b border-black/20">
                    <td className="px-4 py-3 text-center text-sm border-r border-black/20">
                      <button
                        onClick={() => handleSendToLab(record.id)}
                        className="px-3 py-1.5 bg-orange text-center text-white text-sm rounded hover:bg-orange/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      ></button>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-neutral-200 border-r border-black/20">
                      {record.record_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-neutral-200 border-r border-black/20">
                      {record.customer_name || record.orderer_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-neutral-400 border-r border-black/20">
                      {record.modified_by_lab === false
                        ? "نداده"
                        : record.modified_by_lab === true
                          ? "!داده"
                          : "؟!"}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-neutral-200 border-r border-black/20">
                      <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs">
                        {record.test_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-medium text-green-400 border-r border-black/20">
                      {record.total_price?.toLocaleString()}
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
                    <td className="px-4 py-3 text-center text-sm">
                      <button
                        onClick={() =>
                          handleDeleteRecord(record.id, record.record_state)
                        }
                        disabled={
                          record.record_state === "completed" ||
                          record.record_state === "invoiced"
                        }
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      ></button>
                    </td>
                  </tr>
                  {/* // RecordsList.jsx - UPDATED Edit Section for Junction Table */}
                  {expandedRecordId === record.id && (
                    <tr>
                      <td colSpan="8" className="px-0 py-0">
                        <div className="bg-neutral-900/80 border-t border-[#5271ff]/20 animate-slideDown">
                          <div className="p-6 space-y-6">
                            {/* Display All Tests in This Record */}
                            <div className="bg-neutral-800/50 border border-[#5271ff]/20 rounded-lg p-4">
                              <div className="flex items-left justify-between mb-4">
                                <h4 className="text-base font-medium text-neutral-100 flex items-left gap-2">
                                  <span className="text-lg">📋</span>
                                  آزمون‌های رکورد {record.record_number}
                                </h4>
                                <button
                                  onClick={() => handleAddTest(record.id)}
                                  disabled={record.invoice_finalized}
                                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  + افزودن آزمون
                                </button>
                              </div>

                              {/* Tests List */}
                              {record.tests && record.tests.length > 0 ? (
                                <div className="space-y-3">
                                  {record.tests.map((test, idx) => (
                                    <div
                                      key={test.id}
                                      className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-4"
                                    >
                                      <div className="flex items-start justify-between">
                                        {/* Test Info */}
                                        <div className="flex-1">
                                          <div className="flex items-left gap-2 mb-2">
                                            <span className="text-neutral-400 text-sm">
                                              #{idx + 1}
                                            </span>
                                            <h5 className="font-medium text-neutral-100">
                                              {test.test_title}
                                            </h5>
                                            {test.test_code && (
                                              <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded">
                                                {test.test_code}
                                              </span>
                                            )}
                                          </div>

                                          {test.standard_code && (
                                            <div className="text-sm text-neutral-400 mb-2">
                                              استاندارد: {test.standard_code}
                                              {test.standard_title &&
                                                ` - ${test.standard_title}`}
                                            </div>
                                          )}

                                          {/* Price Breakdown */}
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                            <div className="text-neutral-400">
                                              قیمت پایه:{" "}
                                              <span className="text-neutral-200">
                                                {test.test_price?.toLocaleString()}{" "}
                                                تومان
                                              </span>
                                            </div>
                                            {test.additional_charges > 0 && (
                                              <div className="text-green-400">
                                                + هزینه اضافی:{" "}
                                                {test.additional_charges?.toLocaleString()}{" "}
                                                تومان
                                              </div>
                                            )}
                                            {test.discount > 0 && (
                                              <div className="text-red-400">
                                                - تخفیف:{" "}
                                                {test.discount?.toLocaleString()}{" "}
                                                تومان
                                              </div>
                                            )}
                                            <div className="font-bold text-neutral-100">
                                              قیمت نهایی:{" "}
                                              {test.final_price?.toLocaleString()}{" "}
                                              تومان
                                            </div>
                                          </div>

                                          {/* Test State */}
                                          <div className="mt-2">
                                            <span
                                              className={`px-2 py-1 rounded text-xs ${
                                                test.state === "pending"
                                                  ? "bg-yellow-900/30 text-yellow-400"
                                                  : test.state === "in_progress"
                                                    ? "bg-blue-900/30 text-blue-400"
                                                    : test.state === "completed"
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
                                            <div className="mt-2 text-xs text-neutral-500 italic">
                                              📝 {test.reception_notes}
                                            </div>
                                          )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col text-center gap-2 ml-4">
                                          {record.invoice_finalized ? (
                                            <div className="text-xs  text-yellow-500 flex items-left gap-1">
                                              🔒 قفل شده
                                            </div>
                                          ) : (
                                            <>
                                              <button
                                                onClick={() =>
                                                  handleEditTest(test)
                                                }
                                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
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

                            {/* Warning if invoiced */}
                            {record.is_invoiced &&
                              !record.invoice_finalized && (
                                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
                                  <div className="flex items-left gap-2 text-yellow-400 text-sm">
                                    <span className="text-lg">⚠️</span>
                                    <div>
                                      <div className="font-medium">
                                        توجه: این رکورد فاکتور شده است
                                      </div>
                                      <div className="text-xs text-yellow-500 mt-1">
                                        تغییرات در این رکورد، فاکتور مربوطه را
                                        به‌روز می‌کند
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                            {/* Lock warning if finalized */}
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

                            {/* Sample Images */}
                            <div className="bg-neutral-800/50 border border-[#5271ff]/20 rounded-lg p-4">
                              <h4 className="text-base font-medium text-neutral-100 mb-3 flex items-left gap-2">
                                <span className="text-lg">🖼️</span>
                                تصاویر نمونه
                              </h4>

                              {/* Existing Images */}
                              {existingImages.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs text-neutral-400 mb-2">
                                    تصاویر موجود:
                                  </div>
                                  <div className="grid grid-cols-5 gap-2">
                                    {existingImages.map((imageUrl, index) => (
                                      <div
                                        key={index}
                                        className="relative group"
                                      >
                                        <img
                                          src={imageUrl}
                                          alt={`Sample ${index + 1}`}
                                          className="w-full h-16 object-cover rounded border border-[#5271ff]/20"
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeExistingImage(index)
                                          }
                                          className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <svg
                                            className="w-3 h-3"
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
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* File Upload */}
                              <div>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="hidden"
                                  id={`file-upload-${record.id}`}
                                />
                                <label
                                  htmlFor={`file-upload-${record.id}`}
                                  className="flex items-left justify-left w-full h-20 px-4 transition bg-neutral-900 border-2 border-[#5271ff]/30 border-dashed rounded-md cursor-pointer hover:border-[#5271ff]/50"
                                >
                                  <span className="flex items-left gap-2 text-xs text-neutral-400">
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
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                      />
                                    </svg>
                                    افزودن عکس‌های جدید (حداکثر{" "}
                                    {10 - existingImages.length} عکس)
                                  </span>
                                </label>

                                {/* New Files Preview */}
                                {filePreviews.length > 0 && (
                                  <div className="grid grid-cols-5 gap-2 mt-3">
                                    {filePreviews.map((preview, index) => (
                                      <div
                                        key={index}
                                        className="relative group"
                                      >
                                        <img
                                          src={preview.url}
                                          alt={preview.name}
                                          className="w-full h-16 object-cover rounded border-2 border-green-500/50"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeNewFile(index)}
                                          className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <svg
                                            className="w-3 h-3"
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
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Warning if Invoiced */}
                            {currentRecord?.state === "invoiced" &&
                              !currentRecord?.invoice_finalized && (
                                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
                                  <div className="flex items-left gap-2 text-yellow-400 text-sm">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                      />
                                    </svg>
                                    <span className="font-medium">
                                      توجه: این رکورد فاکتور شده است
                                    </span>
                                  </div>
                                  <div className="text-xs text-yellow-300 mt-1">
                                    تغییرات شما در فاکتور مربوطه نیز اعمال خواهد
                                    شد.
                                  </div>
                                </div>
                              )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-700/50">
                              <button
                                onClick={() => {
                                  setExpandedRecordId(null);
                                }}
                                className="px-6 py-2 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600 transition-colors"
                              >
                                بستن
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                disabled={loading || !editForm.test_id}
                                className="px-6 py-2 bg-gradient-to-r from-[#5271ff] to-[#4158d0] text-white rounded-lg hover:shadow-lg hover:shadow-[#5271ff]/30 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-left gap-2"
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
                                ) : (
                                  <>
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    ذخیره تغییرات
                                  </>
                                )}
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
          <div className="fixed inset-0 bg-black/50 flex items-left justify-left z-50">
            <div className="bg-neutral-900 border border-[#5271ff]/20 rounded-lg p-6 max-w-2xl w-full mx-4">
              <h3 className="text-xl font-semibold text-neutral-100 mb-4">
                ویرایش آزمون
              </h3>

              <div className="space-y-4">
                {/* Test Selection */}
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
                    className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                  >
                    <option value="">انتخاب آزمون</option>
                    {activeTests.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.title} ({test.base_price?.toLocaleString()} تومان)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Standard Selection */}
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">
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

                {/* Pricing */}
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

                {/* Price Preview */}
                <div className="bg-neutral-800/50 border border-[#5271ff]/20 rounded p-3">
                  <div className="text-sm text-neutral-400">
                    قیمت نهایی پیش‌بینی:
                  </div>
                  <div className="text-xl font-bold text-green-400 mt-1">
                    {calculatePreviewPrice().toLocaleString()} تومان
                  </div>
                </div>
              </div>

              {/* Buttons */}
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
                  className="px-4 py-2 bg-[#5271ff] text-white rounded hover:bg-[#5271ff]/80 disabled:opacity-50"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Test Modal */}
        {showAddTestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-left justify-left z-50">
            <div className="bg-neutral-900 border border-[#5271ff]/20 rounded-lg p-6 max-w-2xl w-full mx-4">
              <h3 className="text-xl font-semibold text-neutral-100 mb-4">
                افزودن آزمون جدید
              </h3>

              <div className="space-y-4">
                {/* Test Selection */}
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
                    className="w-full h-11 px-3 bg-neutral-800 border border-[#5271ff]/20 rounded text-sm text-neutral-200"
                  >
                    <option value="">انتخاب آزمون</option>
                    {activeTests.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.title} ({test.base_price?.toLocaleString()} تومان)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Standard Selection */}
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

                {/* Pricing */}
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

                {/* Reception Notes */}
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">
                    یادداشت پذیرش
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

                {/* Price Preview */}
                <div className="bg-neutral-800/50 border border-[#5271ff]/20 rounded p-3">
                  <div className="text-sm text-neutral-400">
                    قیمت نهایی پیش‌بینی:
                  </div>
                  <div className="text-xl font-bold text-green-400 mt-1">
                    {calculateNewTestPrice().toLocaleString()} تومان
                  </div>
                </div>
              </div>

              {/* Buttons */}
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
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
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
          <div className="text-sm text-neutral-600">
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

export default RecordsList;
