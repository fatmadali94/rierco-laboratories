import React from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";

const ChartContainer = ({
  type,
  data,
  title,
  keys = ["count"],
  indexBy = "month",
  height = 400,
}) => {
  const commonBarTheme = {
    textColor: "#ffffff",
    fontSize: 14,
    axis: {
      ticks: { text: { fill: "#ffffff" } },
      legend: { text: { fill: "#ffffff" } },
    },
    grid: { line: { stroke: "#ffffff22" } },
    tooltip: {
      container: {
        background: "#ffffff",
        color: "#1e293b",
        fontSize: 13,
        borderRadius: "6px",
        boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
        padding: "8px 10px",
      },
    },
  };

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveBar
            data={data}
            keys={keys}
            indexBy={indexBy}
            margin={{ top: 30, right: 30, bottom: 50, left: 40 }}
            padding={0.3}
            colors={["#5271ff"]}
            borderRadius={6}
            theme={commonBarTheme}
            axisBottom={{
              tickRotation: -45,
              legend: "ماه شمسی",
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisLeft={{
              legend: keys[0] === "count" ? "تعداد" : "مجموع",
              legendPosition: "middle",
              legendOffset: -30,
            }}
            tooltip={({ indexValue, value }) => (
              <div className="bg-white text-gray-800 p-2 w-28 rounded shadow text-sm">
                {indexValue}: <strong>{value}</strong>
              </div>
            )}
            labelSkipHeight={12}
            labelTextColor="#facc15"
          />
        );

      case "pie":
        return (
          <ResponsivePie
            data={data}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.4}
            padAngle={1}
            cornerRadius={6}
            activeOuterRadiusOffset={8}
            colors={{ scheme: "nivo" }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#ffffff"
            arcLinkLabelsTextColor="#ffffff"
            arcLinkLabelsThickness={1}
            arcLinkLabelsColor={{ from: "color" }}
            tooltip={({ datum }) => (
              <div className="bg-white text-black text-sm px-2 py-1 rounded shadow">
                {datum.label}: {datum.value}
              </div>
            )}
            theme={{
              labels: { text: { fill: "#ffffff" } },
              legends: { text: { fill: "#ffffff" } },
            }}
          />
        );

      default:
        return (
          <div className="text-center text-neutral-400">
            نوع نمودار پشتیبانی نمی‌شود
          </div>
        );
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] mt-10 flex items-center justify-center">
        <p className="text-center text-gray-500">در حال بارگذاری داده‌ها...</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-[${height}px] mt-10`}>
      <h2 className="text-xl font-bold mb-4 text-center text-white">{title}</h2>
      {renderChart()}
    </div>
  );
};

export default ChartContainer;
