const TireTypeSelector = ({ form, handleChange }) => {
  const options = [
    "موتوری",
    "سواری",
    "وانتی",
    "باری",
    "کشاورزی",
    "معدنی",
    "دوچرخه",
  ];

  const handleSelect = (value) => {
    const syntheticEvent = {
      target: {
        name: "tire_type",
        value: value,
      },
    };
    handleChange(syntheticEvent);
  };

  return (
    <div className="relative">
      <div className="w-35 h-20 bg-neutral-900 border border-[#5271ff]/20 rounded flex">
        {options.map((option, index) => (
          <div
            key={option}
            className={`w-5 h-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
              index === 0 ? "rounded-l" : ""
            } ${index === options.length - 1 ? "rounded-r" : ""} ${
              form.tire_type === option
                ? "bg-[#5271ff]/30 text-[#5271ff]"
                : "text-neutral-200 hover:bg-neutral-800 hover:text-[#5271ff]"
            } ${
              index < options.length - 1 ? "border-r border-neutral-700" : ""
            }`}
            onClick={() => handleSelect(option)}
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            <span className="text-xs sm:text-sm whitespace-nowrap transform rotate-180">
              {option}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TireTypeSelector;
