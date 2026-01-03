import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  // deleteLaboratoryRecord,
  fetchLaboratoryRecords,
  fetchAvailableEntries,
  fetchLaboratoryRecordByEntryCode,
} from "../../features/laboratory/laboratoryThunks";
import {
  clearSelectedLaboratoryRecord,
  setSelectedLaboratoryRecord,
  clearError,
} from "../../features/laboratory/laboratorySlice";
import { convertGregorianToJalali } from "../../utils/dateHelpers";

const LaboratoryRecordsTable = ({ onEdit }) => {
  const dispatch = useDispatch();

  const {
    laboratoryRecords,
    loading,
    error,
    selectedLaboratoryRecord,
    lastInsertedEntryCode,
  } = useSelector((state) => state.laboratoryRecords);

  const [highlightedEntryCode, setHighlightedEntryCode] = useState(null);

  useEffect(() => {
    dispatch(fetchLaboratoryRecords());
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

  const handleEdit = (laboratoryRecord) => {
    dispatch(clearSelectedLaboratoryRecord());
    dispatch(fetchLaboratoryRecordByEntryCode(laboratoryRecord.entry_code));
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
  //       await dispatch(deleteLaboratoryRecord(entry_code)).unwrap();
  //       // No need to manually fetch records - the slice handles state update
  //     } catch (error) {
  //       console.error("Delete failed:", error);
  //     }
  //   }
  // };

  // Loading state
  if (loading && laboratoryRecords.length === 0) {
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
            onClick={() => dispatch(fetchLaboratoryRecords())}
            className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && laboratoryRecords.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">هیچ رکوردی یافت نشد</div>
      </div>
    );
  }

  // // In your component, add this to see available entries:
  // const { availableEntries } = useSelector((state) => state.laboratoryRecords);

  // useEffect(() => {
  //   dispatch(fetchAvailableEntries()); // This will show your 3 new_entries
  // }, [dispatch]);

  // // Then render available entries
  // {
  //   availableEntries.map((entry) => (
  //     <div key={entry.entry_code}>
  //       {entry.entry_code} - {entry.brand} - {entry.size}
  //       <button onClick={() => handleCreateLaboratoryRecord(entry.entry_code)}>
  //         Create Laboratory Record
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
        <div className="scroll-wrapper relative mt-5">
          <div className="scroll-top overflow-x-auto custom-scrollbar">
            <table className="min-w-[1000px] table-auto text-gray-400 border-separate space-y-6 text-sm w-full">
              <thead className="bg-gray-800 text-gray-500">
                <tr>
                  <th className="p-3 text-center">کنش</th>
                  <th className="p-3 text-center">کد ردیابی</th>
                  <th className="p-3 text-center">مشتری</th>
                  <th className="p-3 text-center">استاندارد</th>
                  <th className="p-3 text-center">تست درخواستی</th>
                  <th className="p-3 text-center">دسته</th>
                  <th className="p-3 text-center">مارک تجاری</th>
                  <th className="p-3 text-center">کشور سازنده</th>
                  <th className="p-3 text-center">تعداد حلقه ورودی</th>
                  <th className="p-3 text-center">سایز</th>
                  <th className="p-3 text-center">هفته_سال تولید</th>
                  <th className="p-3 text-center">پذیرش شده</th>
                  <th className="p-3 text-center">تعداد برداشتی از انبار</th>
                  <th className="p-3 text-center">تاریخ برگشت به انبار</th>
                  <th className="p-3 text-center">(A)برگشتی</th>
                  <th className="p-3 text-center">(B)برگشتی</th>
                  <th className="p-3 text-center">(C)برگشتی</th>
                  {/* <th className="p-3 text-center">کد تست درخواستی</th> */}
                  <th className="p-3 text-center">نوع تایر</th>
                  <th className="p-3 text-center">رادیال/بایاس</th>
                  <th className="p-3 text-center">گروه</th>
                  <th className="p-3 text-center">طرح آج</th>
                  <th className="p-3 text-center">شاخص بار</th>
                  <th className="p-3 text-center">شاخص سرعت</th>
                  <th className="p-3 text-center">تعداد لایه</th>
                  <th className="p-3 text-center">دامنه بار</th>
                  <th className="p-3 text-center">E_mark</th>
                  <th className="p-3 text-center">شاخص صدا</th>
                  <th className="p-3 text-center">شاخص چسبندگی</th>
                  <th className="p-3 text-center">شاخص مصرف سوخت</th>
                  <th className="p-3 text-center">سایش تایر</th>
                  <th className="p-3 text-center">چنگ‌زنی تایر</th>
                  <th className="p-3 text-center">دما</th>
                  <th className="p-3 text-center">وزن</th>
                  <th className="p-3 text-center">سختی</th>
                  <th className="p-3 text-center">عرض مقطع</th>
                  <th className="p-3 text-center">قطر خارجی</th>
                  <th className="p-3 text-center">عمق آج</th>
                  <th className="p-3 text-center">تست انجام شده</th>
                  <th className="p-3 text-center">plunger_5</th>
                  <th className="p-3 text-center">آزمون طوقه</th>
                  <th className="p-3 text-center">نتیجه رولینگ</th>
                  <th className="p-3 text-center">گروه رولینگ</th>
                  <th className="p-3 text-center">نتیجه نویز</th>
                  <th className="p-3 text-center">نتیجه چسبندگی</th>
                  <th className="p-3 text-center">گروه چسبندگی</th>
                  <th className="p-3 text-center">توضیح خرابی تایر</th>
                  <th className="p-3 text-center">آزمون‌های خارج از درخواست</th>
                  <th className="p-3 text-center">نتیجه آزمون</th>
                </tr>
              </thead>
              <tbody>
                {laboratoryRecords.map((laboratoryRecord, index) => (
                  <tr
                    key={laboratoryRecord.entry_code}
                    className={`bg-gray-800 hover:bg-gray-600 transition-all duration-300 relative ${
                      highlightedEntryCode === laboratoryRecord.entry_code
                        ? "animate-pulse bg-green-800/30"
                        : ""
                    } ${
                      selectedLaboratoryRecord?.entry_code ===
                      laboratoryRecord.entry_code
                        ? "border-l-4 border-red-500 shadow-[inset_0_0_8px_rgba(255,255,0,0.3)]"
                        : "border-l-4 border-transparent"
                    }`}
                    style={{
                      backgroundColor:
                        highlightedEntryCode === laboratoryRecord.entry_code
                          ? undefined
                          : getGradientRowColor(
                              index,
                              laboratoryRecords.length
                            ),
                    }}
                    onMouseEnter={(e) => {
                      if (
                        highlightedEntryCode !== laboratoryRecord.entry_code
                      ) {
                        e.currentTarget.style.backgroundColor =
                          "rgb(99, 99, 75)"; // dark yellow
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (
                        highlightedEntryCode !== laboratoryRecord.entry_code
                      ) {
                        e.currentTarget.style.backgroundColor =
                          getGradientRowColor(index, laboratoryRecords.length);
                      }
                    }}
                  >
                    <td className="relative p-3 flex flex-col">
                      {/* Confirmation status indicator */}
                      {(!laboratoryRecord.laboratory_confirmation ||
                        laboratoryRecord.laboratory_confirmation === "no") && (
                        <div className="absolute -top-0 -left-0 z-10">
                          <div className="w-6 h-6 bg-[#d1aa11] rounded-full flex items-center justify-center border-2 border-gray-800 shadow-lg">
                            <span className="text-gray-800 text-xs font-bold">
                              !
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        className="px-2 mb-1 sm:px-1 py-2.5 sm:py-3 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-[#5271ff] hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] bg-blue-800 hover:bg-blue-900 edit transition-all duration-300 text-center text-sm sm:text-base"
                        onClick={() => onEdit(laboratoryRecord)} // pass this prop from parent
                        disabled={loading}
                      >
                        ثبت آزمون تایر
                      </button>
                    </td>
                    <td className="p-3 font-mono text-center">
                      {laboratoryRecord.entry_code}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.customers || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.standard || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {Array.isArray(laboratoryRecord.tests) &&
                      laboratoryRecord.tests.length > 0
                        ? laboratoryRecord.tests.join(" | ")
                        : "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.entry_category || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.brand || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.country || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.number_of_rings || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.size || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {Array.isArray(laboratoryRecord.production_week_year) &&
                      laboratoryRecord.production_week_year.length > 0
                        ? laboratoryRecord.production_week_year.join(" | ")
                        : "-"}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            laboratoryRecord.receptory_confirmation === "yes"
                              ? "bg-green-800 text-green-200"
                              : laboratoryRecord.receptory_confirmation === "no"
                                ? "bg-red-800 text-red-200"
                                : "bg-gray-600 text-gray-300"
                          }`}
                        >
                          {laboratoryRecord.receptory_confirmation === "yes"
                            ? "✓ بلی"
                            : laboratoryRecord.receptory_confirmation === "no"
                              ? "✗ خیر"
                              : "در انتظار"}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      {laboratoryRecord.depository_withdrawal_count || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {convertGregorianToJalali(
                        laboratoryRecord.depository_return_date
                      ) || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.depository_return_a || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.depository_return_b || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.depository_return_c || "-"}
                    </td>
                    {/* <td className="p-3 text-center">
                      {laboratoryRecord.requested_test_code || "-"}
                    </td> */}
                    <td className="p-3 text-center">
                      {laboratoryRecord.tire_type || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.radial_bias || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.tire_group || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.tire_pattern || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.load_index || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.speed_index || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.layer_count || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.load_range || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.e_mark || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.noise || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.wet_grip || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.energy_label || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.tire_wear_indicator || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.traction_index || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.tire_temperature_index || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.tire_weight || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.tire_hardness || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.section_width || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.external_diameter || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.tread_depth || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.performed_tests || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.plunger_5 || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.rim_test || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.rolling_result || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.rolling_grade || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.noise_result || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.wet_grip_result || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.wet_grip_grade || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.tire_failure_description || "-"}
                    </td>
                    <td className="p-3 text-center">
                      {laboratoryRecord.out_of_demand_tests || "-"}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            laboratoryRecord.laboratory_confirmation === "yes"
                              ? "bg-green-800 text-green-200"
                              : laboratoryRecord.laboratory_confirmation ===
                                  "no"
                                ? "bg-red-800 text-red-200"
                                : "bg-gray-600 text-gray-300"
                          }`}
                        >
                          {laboratoryRecord.laboratory_confirmation === "yes"
                            ? "✓ بلی"
                            : laboratoryRecord.laboratory_confirmation === "no"
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

export default LaboratoryRecordsTable;
