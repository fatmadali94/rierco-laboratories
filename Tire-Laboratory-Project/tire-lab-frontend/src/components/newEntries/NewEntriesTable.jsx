import React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelectedNewEntry,
  setSelectedNewEntry,
} from "../../features/newEntires/newEntiresSlice";
import {
  deleteNewEntry,
  fetchNewEntries,
} from "../../features/newEntires/newEntriesThunks";
import { convertGregorianToJalali } from "../../utils/dateHelpers";

const NewEntriesTable = () => {
  const newEntries = useSelector((state) => state.newEntries.NewEntries);

  const dispatch = useDispatch();
  const lastInsertedEntryCode = useSelector(
    (state) => state.newEntries.lastInsertedEntryCode
  );
  const [highlightedCode, setHighlightedCode] = useState(null);
  const selectedNewEntry = useSelector(
    (state) => state.newEntries.selectedNewEntry
  );

  const handleEdit = (newEntry) => {
    dispatch(setSelectedNewEntry(newEntry));
    dispatch(fetchNewEntries());
  };

  const getGradientRowColor = (index, total) => {
    const progress = index / (total - 1);
    const r = Math.round(31 + (75 - 31) * progress);
    const g = Math.round(41 + (85 - 41) * progress);
    const b = Math.round(55 + (99 - 55) * progress);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // const handleDelete = (entry_code) => {
  //   if (!entry_code) {
  //     console.error("entry_code is missing in handleDelete");
  //     return;
  //   }
  //   dispatch(deleteNewEntry(entry_code)).then(() =>
  //     dispatch(fetchNewEntries())
  //   );
  // };

  useEffect(() => {
    if (lastInsertedEntryCode) {
      setHighlightedCode(lastInsertedEntryCode);
      const timeout = setTimeout(() => setHighlightedCode(null), 1500);
      return () => clearTimeout(timeout);
    }
  }, [lastInsertedEntryCode]);

  return (
    <div className="flex items-center justify-center">
      <div className="col-span-12 w-full px-4">
        <div className="scroll-wrapper relative mt-5">
          <div className="scroll-top overflow-x-auto custom-scrollbar">
            <table className="min-w-[1000px] table-auto text-gray-400 border-separate space-y-6 text-sm w-full">
              <thead className="bg-gray-800 text-gray-500">
                <tr>
                  <th className="p-3 text-center">کنش</th>
                  <th className="p-3 text-center">کد ردیابی</th>
                  <th className="p-3 text-center">کاربر</th>
                  <th className="p-3 text-center">تاریخ ورود به شرکت</th>
                  <th className="p-3 text-center">دسته تایر ورودی</th>
                  <th className="p-3 text-center">سایز</th>
                  <th className="p-3 text-center">مارک تجاری</th>
                  <th className="p-3 text-center">کشور سازنده</th>
                  <th className="p-3 text-center">تعداد حلقه ورودی</th>
                  <th className="p-3 text-center">هفته_سال تولید</th>
                  <th className="p-3 text-center">شماره پلمپ</th>
                  <th className="p-3 text-center">توضیحات</th>
                </tr>
              </thead>
              <tbody>
                {newEntries.map((newEntry, index) => (
                  <tr
                    key={newEntry.entry_code}
                    className={`bg-gray-800 hover:bg-gray-600 transition-all duration-300 ${
                      highlightedCode === newEntry.entry_code
                        ? "animate-fade-in"
                        : ""
                    } ${selectedNewEntry?.entry_code === newEntry.entry_code ? "border-l-4 border-yellow-300 shadow-[inset_0_0_4px_rgba(0,255,0,0.3)]" : "border-l-4 border-transparent"}

  `}
                    style={{
                      backgroundColor:
                        highlightedCode === newEntry.entry_code
                          ? undefined
                          : getGradientRowColor(index, newEntries.length),
                    }}
                    onMouseEnter={(e) => {
                      if (highlightedCode !== newEntry.entry_code) {
                        e.currentTarget.style.backgroundColor =
                          "rgb(75, 99, 77)"; // dark green
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (highlightedCode !== newEntry.entry_code) {
                        e.currentTarget.style.backgroundColor =
                          getGradientRowColor(index, newEntries.length);
                      }
                    }}
                  >
                    <td className="p-3 flex flex-col">
                      <button
                        className="px-2 mb-1 sm:px-1 py-2.5 sm:py-3 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-[#5271ff] hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] bg-blue-800 hover:bg-blue-900 edit transition-all duration-300 text-center text-sm sm:text-base"
                        onClick={() => handleEdit(newEntry)}
                      >
                        ویرایش اطلاعات ورودی
                      </button>
                      {/* <button
                      className="px-3 mt-1 sm:px-4 py-2.5 sm:py-3 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-[#ff5271] hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] bg-red-800 hover:bg-red-900 edit transition-all duration-300 text-left text-sm sm:text-base"
                      onClick={() => handleDelete(newEntry.entry_code)}
                    >
                      حذف
                    </button> */}
                    </td>
                    <td className="p-3 text-center">{newEntry.entry_code}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center text-center gap-2">
                        <img
                          src={newEntry.created_by_image || "/default-user.png"}
                          alt="User"
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <span>{newEntry.created_by_name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {convertGregorianToJalali(newEntry.company_entry_date)}
                    </td>

                    <td className="p-3 text-center">
                      {newEntry.entry_category}
                    </td>
                    <td className="p-3 text-center">{newEntry.size}</td>
                    <td className="p-3 text-center">{newEntry.brand}</td>
                    <td className="p-3 text-center">{newEntry.country}</td>
                    <td className="p-3 text-center">
                      {newEntry.number_of_rings}
                    </td>
                    <td className="p-3 text-center">
                      {Array.isArray(newEntry.production_week_year) &&
                      newEntry.production_week_year.length > 0
                        ? newEntry.production_week_year.join(" | ")
                        : "-"}
                    </td>
                    <td className="p-3 text-center">{newEntry.seal_number}</td>
                    <td className="p-3 text-center">{newEntry.description}</td>
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

export default NewEntriesTable;
