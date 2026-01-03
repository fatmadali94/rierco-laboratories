import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  // deleteReceptoryRecord,
  fetchReceptoryRecords,
  fetchAvailableEntries,
  updateReceptoryRecord,
} from "../../features/receptory/receptoryThunks";
import {
  clearSelectedReceptoryRecord,
  setSelectedReceptoryRecord,
  clearError,
} from "../../features/receptory/receptorySlice";
import { convertGregorianToJalali } from "../../utils/dateHelpers";
import BulkEditForm from "./BulkEditForm";

const ReceptoryRecordsTable = ({ onEdit }) => {
  const dispatch = useDispatch();

  const {
    receptoryRecords,
    loading,
    error,
    selectedReceptoryRecord,
    lastInsertedEntryCode,
  } = useSelector((state) => state.receptoryRecords);

  const [highlightedEntryCode, setHighlightedEntryCode] = useState(null);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [isBulkEditFormOpen, setBulkEditFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchReceptoryRecords());
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

  const handleEdit = (receptoryRecord) => {
    dispatch(clearSelectedReceptoryRecord());
    dispatch(setSelectedReceptoryRecord(receptoryRecord));
  };

  const handleCheckboxChange = (entryCode) => {
    setSelectedEntries((prev) => {
      if (prev.includes(entryCode)) {
        const next = prev.filter((code) => code !== entryCode);
        // If nothing is selected anymore, close bulk form
        if (next.length === 0) setBulkEditFormOpen(false);
        return next;
      } else {
        const next = [...prev, entryCode];
        return next;
      }
    });
  };

  const openBulkEditForm = () => {
    setBulkEditFormOpen(true);
  };

  const handleBulkEditSubmit = ({ customers, standard, tests, receptory_confirmation }) => {
    const cleanedFormData = {
      customers,
      standard,
      tests,
      receptory_confirmation,
    };

    const updatePromises = selectedEntries.map((entry_code) =>
      dispatch(updateReceptoryRecord({ entry_code, receptoryRecord: cleanedFormData }))
    );

    Promise.all(updatePromises)
      .then(() => {
        dispatch(fetchReceptoryRecords());
        setSelectedEntries([]);
        setBulkEditFormOpen(false); // Fixed the state setter name
        // close any open single edit form
        onEdit(null);
        dispatch(clearSelectedReceptoryRecord());
      })
      .catch((error) => {
        console.error("Error during bulk update:", error);
        // Close forms even on error
        setBulkEditFormOpen(false);
        setSelectedEntries([]);
      });
  };

  const getGradientRowColor = (index, total) => {
    const progress = index / (total - 1);
    const r = Math.round(31 + (75 - 31) * progress);
    const g = Math.round(41 + (85 - 41) * progress);
    const b = Math.round(55 + (99 - 55) * progress);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // const handleDelete = async (entry_code) => {
  //   if (window.confirm("آیا از حذف این رکورد مطمئن هستید؟")) {
  //     try {
  //       await dispatch(deleteReceptoryRecord(entry_code)).unwrap();
  //       // No need to manually fetch records - the slice handles state update
  //     } catch (error) {
  //       console.error("Delete failed:", error);
  //     }
  //   }
  // };

  // Loading state
  if (loading && receptoryRecords.length === 0) {
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
            onClick={() => dispatch(fetchReceptoryRecords())}
            className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && receptoryRecords.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">هیچ رکوردی یافت نشد</div>
      </div>
    );
  }

  // // In your component, add this to see available entries:
  // const { availableEntries } = useSelector((state) => state.receptoryRecords);

  // useEffect(() => {
  //   dispatch(fetchAvailableEntries()); // This will show your 3 new_entries
  // }, [dispatch]);

  // // Then render available entries
  // {
  //   availableEntries.map((entry) => (
  //     <div key={entry.entry_code}>
  //       {entry.entry_code} - {entry.brand} - {entry.size}
  //       <button onClick={() => handleCreateReceptoryRecord(entry.entry_code)}>
  //         Create Receptory Record
  //       </button>
  //     </div>
  //   ));
  // }

  return (
    <div className="flex items-center justify-center">
      <div className="col-span-12 w-full px-4">
        {loading && (
          <div className="mb-4 text-center text-gray-400">
            در حال بروزرسانی...
          </div>
        )}
        <div className="flex justify-between items-center mb-2">
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
        </div>
        {/* Fixed position modal */}
        {isBulkEditFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-neutral-900 p-6 rounded-md shadow-md w-auto max-w-[90vw] max-h-[90vh] overflow-auto">
              <BulkEditForm
                selectedEntries={selectedEntries}
                onSubmit={handleBulkEditSubmit}
                onClose={() => setBulkEditFormOpen(false)}
              />
            </div>
          </div>
        )}

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
                  <th className="p-3 text-center">مشتری/متقاضی</th>
                  <th className="p-3 text-center">استاندارد</th>
                  <th className="p-3 text-center">تست درخواستی</th>
                  <th className="p-3 text-center">پذیرش شده</th>
                </tr>
              </thead>
              <tbody>
                {receptoryRecords.map((receptoryRecord, index) => (
                  <tr
                    key={receptoryRecord.entry_code}
                    className={`bg-gray-800 hover:bg-gray-600 transition-all duration-300 relative ${
                      highlightedEntryCode === receptoryRecord.entry_code
                        ? "animate-pulse bg-green-800/30"
                        : ""
                    } ${
                      selectedReceptoryRecord?.entry_code ===
                      receptoryRecord.entry_code
                        ? "border-l-4 border-red-500 shadow-[inset_4px_0_8px_rgba(168,85,247,0.3)]"
                        : "border-l-4 border-transparent"
                    }`}
                    style={{
                      backgroundColor:
                        highlightedEntryCode === receptoryRecord.entry_code
                          ? undefined
                          : getGradientRowColor(index, receptoryRecords.length),
                    }}
                    onMouseEnter={(e) => {
                      if (highlightedEntryCode !== receptoryRecord.entry_code) {
                        e.currentTarget.style.backgroundColor =
                          "rgb(93, 75, 99)"; // dark purple
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (highlightedEntryCode !== receptoryRecord.entry_code) {
                        e.currentTarget.style.backgroundColor =
                          getGradientRowColor(index, receptoryRecords.length);
                      }
                    }}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(receptoryRecord.entry_code)}
                        onChange={() => handleCheckboxChange(receptoryRecord.entry_code)}
                        className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-600 focus:ring-2"
                      />
                    </td>

                    <td className="relative p-3 flex flex-col">
                      {/* Confirmation status indicator — wrapped inside TD */}
                      {(!receptoryRecord.receptory_confirmation ||
                        receptoryRecord.receptory_confirmation === "no") && (
                        <div className="absolute -top-0 -left-0 z-10">
                          <div className="w-6 h-6 bg-[#83358F] rounded-full flex items-center justify-center border-2 border-gray-800 shadow-lg">
                            <span className="text-gray-800 text-xs font-bold">
                              !
                            </span>
                          </div>
                        </div>
                      )}
                      <button
                        className="px-2 mb-1 sm:px-1 py-2.5 sm:py-3 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-[#5271ff] hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] bg-blue-800 hover:bg-blue-900 edit transition-all duration-300 text-center text-sm sm:text-base"
                        onClick={() => onEdit(receptoryRecord)} // pass this prop from parent
                        disabled={loading}
                      >
                        پذیرش ورودی
                      </button>
                    </td>
                    <td className="p-3 font-mono text-center">
                      {receptoryRecord.entry_code}
                    </td>
                    <td className="p-3 text-center">
                      {convertGregorianToJalali(
                        receptoryRecord.company_entry_date
                      ) || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {receptoryRecord.entry_category || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {receptoryRecord.size || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {receptoryRecord.brand || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {receptoryRecord.country || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {receptoryRecord.number_of_rings || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {Array.isArray(receptoryRecord.production_week_year) &&
                      receptoryRecord.production_week_year.length > 0
                        ? receptoryRecord.production_week_year.join(" | ")
                        : "-"}
                    </td>

                    <td className="p-3 text-center">
                      {receptoryRecord.customers || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {receptoryRecord.standard || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {Array.isArray(receptoryRecord.tests) &&
                      receptoryRecord.tests.length > 0
                        ? receptoryRecord.tests.join(" | ")
                        : "-"}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            receptoryRecord.receptory_confirmation === "yes"
                              ? "bg-green-800 text-green-200"
                              : receptoryRecord.receptory_confirmation === "no"
                                ? "bg-red-800 text-red-200"
                                : "bg-gray-600 text-gray-300"
                          }`}
                        >
                          {receptoryRecord.receptory_confirmation === "yes"
                            ? "✓ بلی"
                            : receptoryRecord.receptory_confirmation === "no"
                              ? "✗ خیر"
                              : "در انتظار"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptoryRecordsTable;
