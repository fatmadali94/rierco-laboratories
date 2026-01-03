import React from "react";

const DataTable = ({
  data,
  title,
  columns = [],
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <div className="w-full h-[400px] mt-10 flex items-center justify-center">
        <div className="text-center text-[#5271ff]">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] mt-10 flex items-center justify-center">
        <div className="text-center text-red-400">خطا: {error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] mt-10 flex items-center justify-center">
        <div className="text-center text-neutral-400">داده‌ای یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="w-full mt-10">
      <h2 className="text-xl font-bold mb-4 text-center text-white">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border text-white border-neutral-700">
          <thead className="bg-[#5271ff] text-white text-center text-xs uppercase">
            <tr>
              {columns.map((column, index) => (
                <th key={index} scope="col" className="text-white px-4 py-3">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr
                key={idx}
                className="bg-neutral-600 text-center border-b border-neutral-700 hover:bg-neutral-500 transition-colors"
              >
                {columns.map((column, colIdx) => (
                  <td key={colIdx} className="px-4 py-2">
                    {column.accessor ? item[column.accessor] : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
