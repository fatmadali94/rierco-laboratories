import React, { useState, useEffect } from "react";

const SearchBox = ({ onSearch, placeholder = "Search by entry_code" }) => {
  const [entryCode, setEntryCode] = useState("");

  // Debounced search - searches automatically as user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(entryCode); // Will search even with empty string
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [entryCode, onSearch]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(entryCode);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="top-0 left-0 right-0 mt-4 sm:mt-6 bg-neutral-950/90 backdrop-blur-lg p-2 sm:p-3 border-t border-[#5271ff]/20">
      <div className="max-w-xl mx-auto">
        <div className="bg-neutral-900/90 backdrop-blur border-2 border-[#5271ff]/30 rounded-lg p-3 sm:p-4 shadow-[0_0_15px_rgba(82,113,255,0.15)]">
          <div className="flex items-center gap-3">
            <span className="text-[#5271ff] text-lg sm:text-xl animate-text-flicker-limited">
              |
            </span>
            <input
              type="text"
              placeholder={placeholder}
              value={entryCode}
              onChange={(e) => setEntryCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent border-none text-white focus:outline-none text-base sm:text-lg placeholder-neutral-500 focus:placeholder-neutral-600"
            />
            <span className="text-[#5271ff] text-lg sm:text-xl font-mono animate-terminal-blink-limited">
              &gt;
            </span>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#5271ff]/20 scrollbar-track-transparent">
            <button
              className="px-2 py-1 w-full bg-neutral-800/50 rounded text-xs text-neutral-400 hover:text-white hover:bg-[#5271ff]/20 whitespace-nowrap transition-colors"
              onClick={handleSearch}
            >
              پیدا کن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
