import React from "react";

export default function Showcase2() {
  return (
    <div className="bg-neutral-950 min-h-[100dvh] relative p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
      <div className="relative max-w-5xl mx-auto w-full flex-1 flex flex-col">
        <header className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white animate-neon-pulse mb-2 text-center sm:text-left">
            Cyber Chronicles
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 text-sm flex-wrap justify-center sm:justify-start">
            <span className="text-[#5271ff] whitespace-nowrap">Level 23</span>
            <div className="h-1.5 w-32 sm:w-48 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-[#5271ff] rounded-full"></div>
            </div>
            <span className="text-neutral-400">75%</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1">
          <div className="lg:col-span-8 space-y-4 sm:space-y-6 order-2 lg:order-1">
            <div className="bg-neutral-900/80 backdrop-blur border border-[#5271ff]/20 rounded-lg p-3 sm:p-4 md:p-6">
              <div className="space-y-3 sm:space-y-4 text-neutral-300 text-sm sm:text-base">
                <p className="animate-fade-in">
                  The neon-lit streets of Neo-Tokyo stretch before you, a maze
                  of holographic advertisements and steam-filled alleyways.
                </p>
                <p
                  className="animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  A mysterious figure approaches from the shadows, their
                  cybernetic enhancements glowing softly in the darkness.
                </p>
                <p className="animate-text-flicker text-[#5271ff]">
                  &gt; What do you do?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {[
                "Approach cautiously",
                "Hide in the shadows",
                "Ready your weapon",
                "Call for backup",
              ].map((text, i) => (
                <button
                  key={i}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-900 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-[#5271ff] hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] transition-all duration-300 text-left text-sm sm:text-base"
                >
                  <span className="text-[#5271ff]">{i + 1}.</span> {text}
                </button>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-4 sm:space-y-6 order-1 lg:order-2">
            <div className="bg-neutral-900/80 backdrop-blur border border-[#5271ff]/20 rounded-lg p-3 sm:p-4">
              <h2 className="text-white font-bold mb-3 sm:mb-4 relative inline-block text-sm sm:text-base">
                Character Stats
                <span className="absolute -right-4 top-0 text-[#5271ff] animate-pixel-shift">
                  _
                </span>
              </h2>
              {[
                { label: "Health", value: 85 },
                { label: "Energy", value: 60 },
                { label: "Shield", value: 40 },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-neutral-400">{stat.label}</span>
                    <span className="text-[#5271ff]">{stat.value}/100</span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5271ff] rounded-full"
                      style={{ width: `${stat.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-neutral-900/80 backdrop-blur border border-[#5271ff]/20 rounded-lg p-3 sm:p-4">
              <h2 className="text-white font-bold mb-3 sm:mb-4 relative inline-block text-sm sm:text-base">
                Inventory
                <span className="absolute -right-4 top-0 text-[#5271ff] animate-pixel-shift">
                  _
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {["Plasma Pistol", "Med Kit", "Neural Hack", "Shield Cell"].map(
                  (item, i) => (
                    <div
                      key={i}
                      className="p-2 bg-neutral-900 border border-[#5271ff]/20 rounded text-xs sm:text-sm text-neutral-400 hover:text-white hover:border-[#5271ff] transition-colors"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {["Save Game", "Menu"].map((action, i) => (
                <button
                  key={i}
                  className="px-3 py-2 bg-neutral-900 border border-[#5271ff]/20 rounded-lg text-neutral-400 hover:text-white hover:border-[#5271ff] hover:shadow-[0_0_15px_rgba(82,113,255,0.3)] transition-all duration-300 text-xs sm:text-sm"
                >
                  {action}
                </button>
              ))}
            </div>
          </aside>
        </div>

        <div className="sticky bottom-0 left-0 right-0 mt-4 sm:mt-6 bg-neutral-950/90 backdrop-blur-lg p-2 sm:p-3 border-t border-[#5271ff]/20">
          <div className="max-w-5xl mx-auto">
            <div className="bg-neutral-900/90 backdrop-blur border-2 border-[#5271ff]/30 rounded-lg p-3 sm:p-4 shadow-[0_0_15px_rgba(82,113,255,0.15)]">
              <div className="flex items-center gap-3">
                <span className="text-[#5271ff] text-lg sm:text-xl animate-pulse">
                  &gt;
                </span>
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none text-white focus:outline-none text-base sm:text-lg placeholder-neutral-500 focus:placeholder-neutral-600"
                  placeholder="Type your command..."
                  aria-label="Command input"
                />
                <span className="text-[#5271ff] text-lg sm:text-xl font-mono animate-terminal-blink">
                  |
                </span>
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#5271ff]/20 scrollbar-track-transparent">
                {["/help", "/inventory", "/stats", "/map"].map((cmd, i) => (
                  <button
                    key={i}
                    className="px-2 py-1 bg-neutral-800/50 rounded text-xs text-neutral-400 hover:text-white hover:bg-[#5271ff]/20 whitespace-nowrap transition-colors"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
