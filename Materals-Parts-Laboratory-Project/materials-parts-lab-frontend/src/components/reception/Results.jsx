import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRecords,
  searchRecords,
  selectRecords,
  selectSearchResults,
  selectPagination,
  selectRecordsLoading,
  fetchRecordsByCustomer,
  fetchRecordsByOrderer,
  updateRecordState,
} from "../../redux/records/recordsSlice";
import {
  fetchActiveTests,
  selectActiveTests,
  fetchActiveStandards,
  selectActiveStandards,
} from "../../redux/tests/testsSlice";
import {
  generateSingleRecordPDF,
  generateMultipleRecordsPDF,
  selectPdfLoading,
  selectPdfError,
  selectPdfSuccess,
  clearPdfError,
  clearPdfSuccess,
} from "../../redux/pdfGeneration/pdfSlice";
import ReceptionTestResults from "./ReceptionTestResults";

const Results = () => {
  const dispatch = useDispatch();

  const records = useSelector(selectRecords);
  const searchResults = useSelector(selectSearchResults);
  const searchByCustomerResult = useSelector(selectRecords);
  const searchByOrdererResult = useSelector(selectRecords);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectRecordsLoading);
  const activeTests = useSelector(selectActiveTests);
  const activeStandards = useSelector(selectActiveStandards);

  // PDF Redux state
  const pdfLoading = useSelector(selectPdfLoading);
  const pdfError = useSelector(selectPdfError);
  const pdfSuccess = useSelector(selectPdfSuccess);

  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [ordererSearchTerm, setOrdererSearchTerm] = useState("");
  console.log(records);

  const [filters, setFilters] = useState({
    state: ["invoiced", "completed"],
    page: 1,
    limit: 20,
  });

  // Dropdown edit state
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  const [activeTab, setActiveTab] = useState("results");
  const [editForm, setEditForm] = useState({
    test_id: null,
    standard_id: null,
    additional_charges: 0,
    discount: 0,
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Multi-select state
  const [selectedRecords, setSelectedRecords] = useState(new Set());

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

  // Handle PDF success/error notifications
  useEffect(() => {
    if (pdfSuccess) {
      // Show success notification (you can use a toast library here)
      console.log("Success:", pdfSuccess);

      // Clear selection after successful multiple PDF generation
      if (pdfSuccess.includes("record(s)")) {
        setSelectedRecords(new Set());
      }

      // Clear success message after 3 seconds
      const timer = setTimeout(() => {
        dispatch(clearPdfSuccess());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [pdfSuccess, dispatch]);

  useEffect(() => {
    if (pdfError) {
      // Show error notification (you can use a toast library here)
      alert(`خطا: ${pdfError}`);
      dispatch(clearPdfError());
    }
  }, [pdfError, dispatch]);

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

  const toggleExpand = (record) => {
    if (expandedRecordId === record.id) {
      setExpandedRecordId(null);
      setActiveTab("results");
    } else {
      setExpandedRecordId(record.id);
      setActiveTab("results");
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

  const handleRefreshRecords = () => {
    dispatch(fetchRecords(filters));
  };

  // Handle checkbox selection
  const handleSelectRecord = (recordId) => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRecords(new Set(displayRecords.map((r) => r.id)));
    } else {
      setSelectedRecords(new Set());
    }
  };

  // Generate PDF for single record using Redux
  const handleGenerateSinglePdf = (record) => {
    console.log("Dispatching generateSingleRecordPDF for record:", record);
    dispatch(generateSingleRecordPDF(record));
  };

  // Generate PDF for multiple selected records using Redux
  const handleGenerateMultiplePdf = () => {
    if (selectedRecords.size === 0) {
      alert("لطفاً حداقل یک رکورد را انتخاب کنید");
      return;
    }

    const selectedRecordsData = displayRecords.filter((r) =>
      selectedRecords.has(r.id),
    );

    console.log(
      "Dispatching generateMultipleRecordsPDF for records:",
      selectedRecordsData,
    );
    dispatch(generateMultipleRecordsPDF(selectedRecordsData));
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {pdfSuccess && (
        <div className="bg-green-900/30 border border-green-400 text-green-400 px-4 py-3 rounded-lg">
          {pdfSuccess}
        </div>
      )}

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

      {/* Generate PDF Button for Multiple Records */}
      {selectedRecords.size > 0 && (
        <div className="flex items-center justify-between bg-neutral-800/50 border border-[#5271ff]/20 rounded-lg p-4">
          <div className="text-white">
            {selectedRecords.size} رکورد انتخاب شده
          </div>
          <button
            onClick={handleGenerateMultiplePdf}
            disabled={pdfLoading}
            className="px-6 py-2 bg-[#5271ff] text-white rounded-lg hover:bg-[#5271ff]/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {pdfLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
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
                در حال ایجاد PDF...
              </>
            ) : (
              <>
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
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                ایجاد PDF
              </>
            )}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="space-y-6">
        <div className="bg-neutral-800/50 border border-[#5271ff]/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-black border-b border-[#5271ff]/20">
              <tr>
                <th className="px-4 py-3 text-center text-sm border-r border-black font-medium text-neutral-300">
                  <input
                    type="checkbox"
                    checked={
                      displayRecords.length > 0 &&
                      selectedRecords.size === displayRecords.length
                    }
                    onChange={handleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black font-medium text-neutral-300">
                  شماره رکورد
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black font-medium text-neutral-300">
                  مشتری/متقاضی
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  وضعیت
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  جواب آزمون‌ها
                </th>
                <th className="px-4 py-3 text-center text-sm border-r border-black  font-medium text-neutral-300">
                  PDF
                </th>
              </tr>
            </thead>
            <tbody>
              {displayRecords.map((record) => (
                <React.Fragment key={record.id}>
                  {/* Main Row */}
                  <tr className="hover:bg-neutral-800/30 border-b border-black/20">
                    <td className="px-4 py-3 text-center text-sm border-r border-black/20">
                      <input
                        type="checkbox"
                        checked={selectedRecords.has(record.id)}
                        onChange={() => handleSelectRecord(record.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-neutral-200 border-r border-black/20">
                      {record.record_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-neutral-200 border-r border-black/20">
                      {record.customer_name || record.orderer_name || "-"}
                    </td>

                    <td className="px-6 py-4 border-r border-black/20">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 text-center  py-1 text-xs font-medium rounded-full ${
                            record.record_state === "completed"
                              ? "bg-green-900/30 text-green-400"
                              : "bg-gray-900/30 text-gray-400"
                          }`}
                        >
                          {record.record_state === "completed"
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
                    <td className="px-4 py-3 text-center text-sm border-r border-black/20">
                      <button
                        onClick={() => handleGenerateSinglePdf(record)}
                        disabled={pdfLoading}
                        className="text-[#5271ff] hover:text-[#5271ff]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="ایجاد PDF"
                      >
                        {pdfLoading ? (
                          <svg
                            className="animate-spin h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
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
                        ) : (
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
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Section with Tabs */}
                  {expandedRecordId === record.id && (
                    <tr>
                      <td colSpan="9" className="px-0 py-0">
                        <div className="bg-neutral-900/80 border-t border-[#5271ff]/20 animate-slideDown">
                          <div className="p-6 space-y-6">
                            <ReceptionTestResults
                              record={record}
                              onRefresh={handleRefreshRecords}
                            />
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

export default Results;
