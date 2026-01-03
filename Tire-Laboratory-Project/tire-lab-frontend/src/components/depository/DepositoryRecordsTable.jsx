import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  // deleteDepositoryRecord,
  fetchDepositoryRecords,
  fetchAvailableEntries,
  updateDepositoryRecord
} from "../../features/depository/depositorythunks";
import {
  clearSelectedDepositoryRecord,
  setSelectedDepositoryRecord,
  clearError,
} from "../../features/depository/depositorySlice";
import { convertGregorianToJalali } from "../../utils/dateHelpers";
import BulkEditForm from "./BulkEditForm";

const DepositoryRecordsTable = ({ onEdit }) => {
  const dispatch = useDispatch();

  const {
    depositoryRecords,
    loading,
    error,
    selectedDepositoryRecord,
    lastInsertedEntryCode,
  } = useSelector((state) => state.depositoryRecords);

  const [highlightedEntryCode, setHighlightedEntryCode] = useState(null);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [isBulkEditFormOpen, setBulkEditFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDepositoryRecords());
  }, [dispatch]);

  useEffect(() => {
    if (lastInsertedEntryCode) {
      setHighlightedEntryCode(lastInsertedEntryCode);
      const timeout = setTimeout(() => setHighlightedEntryCode(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [lastInsertedEntryCode]);

  // Clear error when component unmounts or user interacts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleEdit = (depositoryRecord) => {
    dispatch(clearSelectedDepositoryRecord());
    dispatch(setSelectedDepositoryRecord(depositoryRecord));
    if (record.depository_confirmation === "yes") {
      setConfirmed(true);
    } else {
      setConfirmed(false);
    }
  };

  const handleCheckboxChange = (entryCode) => {
    setSelectedEntries((prev) => {
      if (prev.includes(entryCode)) {
        return prev.filter((code) => code !== entryCode);
      } else {
        return [...prev, entryCode];
      }
    });
  };

  const openBulkEditForm = () => {
    setBulkEditFormOpen(true);
  };

  const handleBulkEditSubmit = ({ entryCodes, depositoryRecord }) => {
    // Create a promise array to track all updates
    const updatePromises = entryCodes.map(entry_code => 
      dispatch(updateDepositoryRecord({ entry_code, depositoryRecord }))
    );

    // Wait for all updates to complete
    Promise.all(updatePromises)
      .then(() => {
        // After all updates succeed:
        dispatch(fetchDepositoryRecords()); // Refresh the list
        setSelectedEntries([]); // Clear selection
        setBulkEditFormOpen(false); // Close modal
        onEdit(null); // Close the single record form
        dispatch(clearSelectedDepositoryRecord()); // Clear selected record from Redux
      })
      .catch(error => {
        // If any update fails, show error and leave form open
        console.error("Error during bulk update:", error);
        // TODO: Show error toast/notification
      });
  };

  const getGradientRowColor = (index, total) => {
    const progress = index / (total - 1);
    const r = Math.round(31 + (75 - 31) * progress);
    const g = Math.round(41 + (85 - 41) * progress);
    const b = Math.round(55 + (99 - 55) * progress);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Loading state
  if (loading && depositoryRecords.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">در حال بارگذاری...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-400 bg-red-900/20 p-4 rounded-lg">
          خطا: {error}
          <button
            onClick={() => dispatch(fetchDepositoryRecords())}
            className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && depositoryRecords.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">هیچ رکوردی یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="col-span-12 w-full px-4">
        {loading && (
          <div className="mb-4 text-center text-gray-400">
            در حال بروزرسانی...
          </div>
        )}
        <button
          onClick={openBulkEditForm}
          disabled={selectedEntries.length === 0}
          className={`mb-4 px-4 py-2 rounded text-white ${
            selectedEntries.length === 0
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-red-800 hover:bg-red-900'
          }`}
        >
          ویرایش گروهی ({selectedEntries.length} مورد انتخاب شده)
        </button>
        <div className="scroll-wrapper relative mt-5">
          <div className="scroll-top overflow-x-auto custom-scrollbar">
            <table className="min-w-[1000px] table-auto text-gray-400 border-separate space-y-6 text-sm w-full">
              <thead className="bg-gray-800 text-gray-500">
                <tr>
                  <th className="p-3 text-center">انتخاب</th>
                  <th className="p-3 text-center">کنش</th>
                  <th className="p-3 text-center">کد ردیابی</th>
                  <th className="p-3 text-center">تاریخ ورود به شرکت</th>
                  <th className="p-3 text-center">دسته تایر ورودی</th>
                  <th className="p-3 text-center">سایز</th>
                  <th className="p-3 text-center">مارک تجاری</th>
                  <th className="p-3 text-center">کشور سازنده</th>
                  <th className="p-3 text-center">تعداد حلقه ورودی</th>
                  <th className="p-3 text-center">هفته_سال تولید</th>
                  <th className="p-3 text-center">تعداد برداشتی از انبار</th>
                  <th className="p-3 text-center">تاریخ برگشت به انبار</th>
                  <th className="p-3 text-center">(A)برگشتی</th>
                  <th className="p-3 text-center">(B)برگشتی</th>
                  <th className="p-3 text-center">(C)برگشتی</th>
                  <th className="p-3 text-center">تاریخ تحویل به صاحب کالا</th>
                  <th className="p-3 text-center">تعداد تحویلی به صاحب کالا</th>
                  <th className="p-3 text-center">(A) تحویلی نوع</th>
                  <th className="p-3 text-center">(B) تحویلی نوع</th>
                  <th className="p-3 text-center">(C) تحویلی نوع</th>
                  <th className="p-3 text-center">(A) مزایده نوع </th>
                  <th className="p-3 text-center">(B) مزایده نوع </th>
                  <th className="p-3 text-center">(C) مزایده نوع </th>
                  <th className="p-3 text-center">(A) باقیمانده نوع </th>
                  <th className="p-3 text-center">(B) باقیمانده نوع </th>
                  <th className="p-3 text-center">(C) باقیمانده نوع </th>
                  <th className="p-3 text-center">تایید انباردار</th>
                  <th className="p-3 text-center">توضیحات انباردار</th>
                </tr>
              </thead>
              <tbody>
                {depositoryRecords.map((depositoryRecord, index) => (
                  <tr
                    key={depositoryRecord.entry_code}
                    className={`bg-gray-800 hover:bg-gray-600 transition-all duration-300 relative ${
                      highlightedEntryCode === depositoryRecord.entry_code
                        ? "animate-pulse bg-green-800/30"
                        : ""
                    } ${
                      selectedDepositoryRecord?.entry_code ===
                      depositoryRecord.entry_code
                        ? "border-l-4 border-red-500 shadow-[inset_4px_0_8px_rgba(255,0,0,0.3)]"
                        : "border-l-4 border-transparent"
                    }`}
                    style={{
                      backgroundColor:
                        highlightedEntryCode === depositoryRecord.entry_code
                          ? undefined
                          : getGradientRowColor(
                              index,
                              depositoryRecords.length
                            ),
                    }}
                    onMouseEnter={(e) => {
                      if (
                        highlightedEntryCode !== depositoryRecord.entry_code
                      ) {
                        e.currentTarget.style.backgroundColor =
                          "rgb(99, 75, 75)"; // dark red
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (
                        highlightedEntryCode !== depositoryRecord.entry_code
                      ) {
                        e.currentTarget.style.backgroundColor =
                          getGradientRowColor(index, depositoryRecords.length);
                      }
                    }}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(depositoryRecord.entry_code)}
                        onChange={() => handleCheckboxChange(depositoryRecord.entry_code)}
                        className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-600 focus:ring-2"
                      />
                    </td>
                    {/* Confirmation status indicator */}
                    <td className="relative p-3 flex flex-col">
                      {/* Confirmation status indicator — wrapped inside TD */}
                      {!depositoryRecord.depository_confirmation && (
                        <div className="absolute -top-0 -left-0 z-10">
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-gray-800 shadow-lg">
                            <span className="text-gray-800 text-xs font-bold">
                              !
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        className="px-2 mb-1 sm:px-1 py-2.5 sm:py-3 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-[#6d1c1c] hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] bg-red-800 hover:bg-red-900 edit transition-all duration-300 text-center text-sm sm:text-base"
                        onClick={() => onEdit(depositoryRecord)}
                        disabled={loading}
                      >
                        افزودن اطلاعات
                      </button>
                    </td>
                    <td className="p-3 font-mono text-center">
                      {depositoryRecord.entry_code}
                    </td>
                    <td className="p-3 text-center">
                      {convertGregorianToJalali(
                        depositoryRecord.company_entry_date
                      ) || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.entry_category || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.size || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.brand || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.country || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.number_of_rings || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {Array.isArray(depositoryRecord.production_week_year) &&
                      depositoryRecord.production_week_year.length > 0
                        ? depositoryRecord.production_week_year.join(" | ")
                        : "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.depository_withdrawal_count || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {convertGregorianToJalali(
                        depositoryRecord.depository_return_date
                      ) || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.depository_return_a || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.depository_return_b || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.depository_return_c || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {convertGregorianToJalali(
                        depositoryRecord.owner_delivery_date
                      ) || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.owner_delivery_count || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.owner_delivery_type_a || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.owner_delivery_type_b || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.owner_delivery_type_c || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.auction_a || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.auction_b || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.auction_c || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.remained_a || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.remained_b || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.remained_c || "-"}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            depositoryRecord.depository_confirmation === "yes"
                              ? "bg-green-800 text-green-200"
                              : depositoryRecord.depository_confirmation ===
                                  "no"
                                ? "bg-red-800 text-red-200"
                                : "bg-gray-600 text-gray-300"
                          }`}
                        >
                          {depositoryRecord.depository_confirmation === "yes"
                            ? "✓ تایید شده"
                            : depositoryRecord.depository_confirmation === "no"
                              ? "✗ تایید نشده"
                              : "در انتظار"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {depositoryRecord.description || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {isBulkEditFormOpen && (
          <BulkEditForm
            selectedEntries={selectedEntries}
            onSubmit={handleBulkEditSubmit}
            onClose={() => setBulkEditFormOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DepositoryRecordsTable;
