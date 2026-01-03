import React from "react";

const DataDisplay = ({ data, title, loading = false, error = null }) => {
  if (!data || (!loading && !error && (!data.data || data.data.length === 0))) {
    return null;
  }

  return (
    <div className="mt-6 bg-neutral-800/50 rounded-lg p-4 backdrop-blur-sm border border-neutral-700">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center text-[#5271ff]">در حال بارگذاری...</div>
        ) : error ? (
          <div className="text-center text-red-400">خطا: {error}</div>
        ) : (
          <div className="space-y-2">
            {data.data.map((item, index) => (
              <div
                key={index}
                className="bg-neutral-700/30 rounded p-3 text-sm hover:bg-neutral-700/50 transition-colors"
              >
                <pre className="text-neutral-300 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataDisplay;
