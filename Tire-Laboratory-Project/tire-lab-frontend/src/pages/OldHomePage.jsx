// import React, { useState, useEffect, useMemo } from "react";
// import { useDispatch } from "react-redux";
// import { useSelector } from "react-redux";
// import UserInfoCard from "../components/UserInfoCard";
// import { useNavigate } from "react-router-dom";
// import ActionButtons from "../components/homepage/ActionButtons";
// import { ResponsiveBar } from "@nivo/bar";
// import { ResponsivePie } from "@nivo/pie";
// import {
//   fetchEntryCountsByDate,
//   fetchRingsSumByDate,
//   fetchEntryCountsBySize,
//   fetchEntryCountsByBrand,
//   fetchEntryCountsByCustomer,
//   fetchTestsByDate,
//   fetchEntryCountsByTireType,
//   fetchEntryCountsByTireGroup,
//   fetchLabConfirmationStatus,
//   fetchDepositorySums,
//   fetchAllDashboardData,
// } from "../features/dashboard/dashboardThunks";
// import {
//   selectEntryCountsByDate,
//   selectRingsSumByDate,
//   selectEntryCountsBySize,
//   selectEntryCountsByBrand,
//   selectEntryCountsByCustomer,
//   selectTestsByDate,
//   selectEntryCountsByTireType,
//   selectEntryCountsByTireGroup,
//   selectLabConfirmationStatus,
//   selectAllDashboardData,
//   selectDepositorySums,
// } from "../features/dashboard/dashboardSelectors";

// // Import your date conversion functions
// import {
//   convertJalaliToGregorian,
//   convertGregorianToJalali,
// } from "../utils/dateHelpers";

// const groupCountsByJalaliMonth = (data = []) => {
//   if (!Array.isArray(data)) return [];

//   const result = {};

//   data.forEach((item) => {
//     const jalaliDate = convertGregorianToJalali(item.date); // ✅ FIXED
//     const [year, month] = jalaliDate.split("/");
//     const key = `${year}/${month.padStart(2, "0")}`;

//     const count = parseInt(item.count, 10);
//     result[key] = (result[key] || 0) + count;
//   });

//   return Object.entries(result).map(([month, count]) => ({
//     month,
//     count,
//   }));
// };

// const groupTestsByMonth = (data = []) => {
//   const result = {};

//   data.forEach(({ date, tests }) => {
//     const jalaliDate = convertGregorianToJalali(date); // e.g. "1404/01/18"
//     const [year, month] = jalaliDate.split("/");
//     const monthKey = `${year}/${month.padStart(2, "0")}`;

//     tests.forEach((test) => {
//       const key = `${monthKey}__${test}`; // composite key
//       result[key] = (result[key] || 0) + 1;
//     });
//   });

//   // Convert back to array format for table display
//   return Object.entries(result).map(([key, count]) => {
//     const [month, test] = key.split("__");
//     return { month, test, count };
//   });
// };

// const groupSizesByMonth = (data = []) => {
//   const result = {};

//   data.forEach(({ date, size, count }) => {
//     const jalaliDate = convertGregorianToJalali(date);

//     if (!jalaliDate || typeof jalaliDate !== "string") return;

//     const [year, month] = jalaliDate.split("/");

//     if (!year || !month) return;

//     const monthKey = `${year}/${month.padStart(2, "0")}`;
//     const key = `${monthKey}__${size}`;

//     result[key] = (result[key] || 0) + parseInt(count, 10);
//   });

//   return Object.entries(result).map(([key, count]) => {
//     const [month, size] = key.split("__");
//     return { month, size, count };
//   });
// };

// const Homepage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const user = useSelector((state) => state.auth.user);

//   // Dashboard data selectors
//   const entryCountsByDate = useSelector(selectEntryCountsByDate);
//   const ringsSumByDate = useSelector(selectRingsSumByDate);
//   const entryCountsBySize = useSelector(selectEntryCountsBySize);
//   console.log("📊 Entry Counts By Size:", { entryCountsBySize });
//   const entryCountsByBrand = useSelector(selectEntryCountsByBrand);
//   const entryCountsByCustomer = useSelector(selectEntryCountsByCustomer);
//   const testsByDate = useSelector(selectTestsByDate);
//   const entryCountsByTireType = useSelector(selectEntryCountsByTireType);
//   const entryCountsByTireGroup = useSelector(selectEntryCountsByTireGroup);
//   const labConfirmationStatus = useSelector(selectLabConfirmationStatus);
//   const depositorySums = useSelector(selectDepositorySums);
//   const allDashboardData = useSelector(selectAllDashboardData);

//   const groupedentryCountsData = useMemo(() => {
//     if (Array.isArray(entryCountsByDate)) {
//       return groupCountsByJalaliMonth(entryCountsByDate);
//     }
//     return [];
//   }, [entryCountsByDate]);

//   // Adapt structure: total_rings → count
//   const preparedRingsData = useMemo(() => {
//     return Array.isArray(ringsSumByDate)
//       ? ringsSumByDate.map((item) => ({
//           date: item.date,
//           count: item.total_rings,
//         }))
//       : [];
//   }, [ringsSumByDate]);

//   const groupedRingsData = useMemo(() => {
//     return groupCountsByJalaliMonth(preparedRingsData);
//   }, [preparedRingsData]);

//   const groupedTestData = useMemo(() => {
//     return groupTestsByMonth(testsByDate); // your selector or prop
//   }, [testsByDate]);

//   const groupedSizeData = useMemo(() => {
//     return groupSizesByMonth(entryCountsBySize); // your selector or prop
//   }, [entryCountsBySize]);

//   // Dashboard states
//   const [activeSection, setActiveSection] = useState("");
//   const [dateRanges, setDateRanges] = useState({
//     entryCountsByDate: { startDate: "", endDate: "" },
//     ringsSumByDate: { startDate: "", endDate: "" },
//     testsByDate: { startDate: "", endDate: "" },
//     entryCountsBySize: { startDate: "", endDate: "" },
//   });

//   //using pichart
//   const pieChartData = useMemo(() => {
//     const sizeMap = {};

//     groupedSizeData.forEach(({ size, count }) => {
//       if (!sizeMap[size]) {
//         sizeMap[size] = 0;
//       }
//       sizeMap[size] += parseInt(count, 10);
//     });

//     return Object.entries(sizeMap).map(([size, count]) => ({
//       id: size,
//       label: size,
//       value: count,
//     }));
//   }, [groupedSizeData]);

//   // Handle date range input changes
//   const handleDateChange = (section, field, value) => {
//     setDateRanges((prev) => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [field]: value,
//       },
//     }));
//   };

//   // Handle date range submissions
//   const handleDateRangeSubmit = (section) => {
//     const { startDate, endDate } = dateRanges[section];

//     if (!startDate || !endDate) {
//       alert("لطفاً هر دو تاریخ را وارد کنید");
//       return;
//     }

//     // Convert Jalali dates to Gregorian
//     const gregorianStartDate = convertJalaliToGregorian(startDate);
//     const gregorianEndDate = convertJalaliToGregorian(endDate);
//     console.log("Dispatching with:", gregorianStartDate, gregorianEndDate);
//     if (!gregorianStartDate || !gregorianEndDate) {
//       alert("تاریخ وارد شده معتبر نیست");
//       return;
//     }

//     setActiveSection(section);

//     switch (section) {
//       case "entryCountsByDate":
//         dispatch(
//           fetchEntryCountsByDate({
//             startDate: gregorianStartDate,
//             endDate: gregorianEndDate,
//           })
//         );
//         break;
//       case "ringsSumByDate":
//         dispatch(
//           fetchRingsSumByDate({
//             startDate: gregorianStartDate,
//             endDate: gregorianEndDate,
//           })
//         );
//         break;
//       case "testsByDate":
//         dispatch(
//           fetchTestsByDate({
//             startDate: gregorianStartDate,
//             endDate: gregorianEndDate,
//           })
//         );
//         break;
//       case "entryCountsBySize":
//         dispatch(
//           fetchEntryCountsBySize({
//             startDate: gregorianStartDate,
//             endDate: gregorianEndDate,
//           })
//         );
//         break;
//     }
//   };

//   // Handle button clicks for queries without parameters
//   const handleButtonClick = (section) => {
//     setActiveSection(section);

//     switch (section) {
//       case "entryCountsBySize":
//         dispatch(fetchEntryCountsBySize());
//         break;
//       case "entryCountsByBrand":
//         dispatch(fetchEntryCountsByBrand());
//         break;
//       case "entryCountsByCustomer":
//         dispatch(fetchEntryCountsByCustomer());
//         break;
//       case "entryCountsByTireType":
//         dispatch(fetchEntryCountsByTireType());
//         break;
//       case "entryCountsByTireGroup":
//         dispatch(fetchEntryCountsByTireGroup());
//         break;
//       case "labConfirmationStatus":
//         dispatch(fetchLabConfirmationStatus());
//         break;
//       case "depositorySums":
//         // Just dispatch the action - don't try to format data here
//         dispatch(fetchDepositorySums());
//         break;
//       case "allDashboardData":
//         dispatch(fetchAllDashboardData());
//         break;
//     }
//   };

//   // Update your renderData function to handle depositorySums properly:
//   const renderData = () => {
//     let data = null;
//     let title = "";

//     switch (activeSection) {
//       case "entryCountsByDate":
//         data = entryCountsByDate;
//         title = "تعداد ثبت‌ها بر اساس تاریخ";
//         break;
//       case "ringsSumByDate":
//         data = ringsSumByDate;
//         title = "مجموع حلقه‌ها بر اساس تاریخ";
//         break;
//       case "testsByDate":
//         data = testsByDate;
//         title = "آزمون‌ها بر اساس تاریخ";
//         break;
//       case "entryCountsBySize":
//         data = entryCountsBySize;
//         title = "تعداد ثبت‌ها بر اساس سایز";
//         break;
//       case "entryCountsByBrand":
//         data = entryCountsByBrand;
//         title = "تعداد ثبت‌ها بر اساس برند";
//         break;
//       case "entryCountsByCustomer":
//         data = entryCountsByCustomer;
//         title = "تعداد ثبت‌ها بر اساس مشتری";
//         break;
//       case "entryCountsByTireType":
//         data = entryCountsByTireType;
//         title = "تعداد ثبت‌ها بر اساس نوع تایر";
//         break;
//       case "entryCountsByTireGroup":
//         data = entryCountsByTireGroup;
//         title = "تعداد ثبت‌ها بر اساس گروه تایر";
//         break;
//       case "labConfirmationStatus":
//         data = labConfirmationStatus;
//         title = "وضعیت تأیید آزمایشگاه";
//         break;
//       case "depositorySums":
//         // Handle depositorySums data formatting here
//         if (depositorySums && depositorySums.data) {
//           const formattedData = [
//             {
//               label: "باقیمانده نوع A",
//               value: depositorySums.data.total_remained_a || 0,
//             },
//             {
//               label: "باقیمانده نوع B",
//               value: depositorySums.data.total_remained_b || 0,
//             },
//             {
//               label: "باقیمانده نوع C",
//               value: depositorySums.data.total_remained_c || 0,
//             },
//             {
//               label: "تحویل مالک نوع A",
//               value: depositorySums.data.total_delivery_type_a || 0,
//             },
//             {
//               label: "تحویل مالک نوع B",
//               value: depositorySums.data.total_delivery_type_b || 0,
//             },
//             {
//               label: "تحویل مالک نوع C",
//               value: depositorySums.data.total_delivery_type_c || 0,
//             },
//             {
//               label: "مزایده نوع A",
//               value: depositorySums.data.total_auction_a || 0,
//             },
//             {
//               label: "مزایده نوع B",
//               value: depositorySums.data.total_auction_b || 0,
//             },
//             {
//               label: "مزایده نوع C",
//               value: depositorySums.data.total_auction_c || 0,
//             },
//           ];

//           // Create a structure similar to other data
//           data = {
//             loading: depositorySums.loading,
//             error: depositorySums.error,
//             data: formattedData,
//           };
//         } else {
//           data = depositorySums;
//         }
//         title = "مجموع انبارها";
//         break;
//       case "allDashboardData":
//         data = allDashboardData;
//         title = "تمام داده‌های داشبورد";
//         break;
//     }

//     if (!data) return null;

//     return (
//       <div className="mt-6 bg-neutral-800/50 rounded-lg p-4 backdrop-blur-sm border border-neutral-700">
//         <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
//         <div className="max-h-96 overflow-y-auto">
//           {data.loading ? (
//             <div className="text-center text-[#5271ff]">در حال بارگذاری...</div>
//           ) : data.error ? (
//             <div className="text-center text-red-400">خطا: {data.error}</div>
//           ) : data.data && data.data.length > 0 ? (
//             <div className="space-y-2">
//               {data.data.map((item, index) => (
//                 <div
//                   key={index}
//                   className="bg-neutral-700/30 rounded p-3 text-sm"
//                 >
//                   <pre className="text-neutral-300 whitespace-pre-wrap">
//                     {JSON.stringify(item, null, 2)}
//                   </pre>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center text-neutral-400">داده‌ای یافت نشد</div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="bg-neutral-950 min-h-[100dvh] relative p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
//       <div className="fixed inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

//       <div className="relative mx-auto w-full flex-1 flex flex-col">
//         <header className="mb-4 sm:mb-6">
//           <h1 className="text-xl sm:text-2xl mt-4 md:text-3xl font-bold text-white animate-neon-pulse mb-2 text-center sm:text-left">
//             آزمون تایر
//           </h1>
//           <ActionButtons />
//           <UserInfoCard user={user} />
//           <div className="flex items-center gap-2 sm:gap-4 text-sm flex-wrap justify-center sm:justify-start">
//             <span className="text-[#5271ff] whitespace-nowrap">Level 23</span>
//             <div className="h-1.5 w-32 sm:w-48 bg-neutral-800 rounded-full overflow-hidden">
//               <div className="h-full w-3/4 bg-[#5271ff] rounded-full"></div>
//             </div>
//             <span className="text-neutral-400">75%</span>
//           </div>
//         </header>

//         <>
//           {activeSection === "entryCountsByDate" && (
//             <div className="w-full h-[400px] mt-10">
//               <h2 className="text-xl font-bold mb-4 text-center text-white">
//                 تعداد ثبت‌ها در هر ماه (شمسی)
//               </h2>
//               {groupedentryCountsData.length > 0 ? (
//                 <ResponsiveBar
//                   data={groupedentryCountsData}
//                   keys={["count"]}
//                   indexBy="month"
//                   margin={{ top: 30, right: 30, bottom: 50, left: 40 }}
//                   padding={0.3}
//                   colors={["#5271ff"]}
//                   borderRadius={6}
//                   theme={{
//                     textColor: "#ffffff", // white text
//                     fontSize: 14,
//                     axis: {
//                       ticks: {
//                         text: {
//                           fill: "#ffffff", // white axis labels
//                         },
//                       },
//                       legend: {
//                         text: {
//                           fill: "#ffffff",
//                         },
//                       },
//                     },
//                     grid: {
//                       line: {
//                         stroke: "#ffffff22", // faint white grid
//                       },
//                     },
//                     tooltip: {
//                       container: {
//                         background: "#ffffff",
//                         color: "#1e293b", // slate-800
//                         fontSize: 13,
//                         borderRadius: "6px",
//                         boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
//                         padding: "8px 10px",
//                       },
//                     },
//                   }}
//                   axisBottom={{
//                     tickRotation: -45,
//                     legend: "ماه شمسی",
//                     legendPosition: "middle",
//                     legendOffset: 40,
//                   }}
//                   axisLeft={{
//                     legend: "تعداد ثبت",
//                     legendPosition: "middle",
//                     legendOffset: -25,
//                   }}
//                   tooltip={({ indexValue, value }) => (
//                     <div className="bg-white text-gray-800 p-2 rounded shadow text-sm">
//                       <strong>{indexValue}:</strong> {value}
//                     </div>
//                   )}
//                 />
//               ) : (
//                 <p className="text-center mt-4 text-gray-500">
//                   در حال بارگذاری داده‌ها...
//                 </p>
//               )}
//             </div>
//           )}
//         </>
//         {activeSection === "ringsSumByDate" && groupedRingsData.length > 0 && (
//           <div className="w-full h-[400px] mt-10">
//             <h2 className="text-xl font-bold mb-4 text-center text-white">
//               تعداد حلقه ورودی بر حسب ماه
//             </h2>
//             <ResponsiveBar
//               data={groupedRingsData}
//               keys={["count"]}
//               indexBy="month"
//               margin={{ top: 30, right: 30, bottom: 50, left: 40 }}
//               padding={0.3}
//               colors={["#5271ff"]}
//               borderRadius={6}
//               theme={{
//                 textColor: "#ffffff",
//                 fontSize: 14,
//                 axis: {
//                   ticks: { text: { fill: "#ffffff" } },
//                   legend: { text: { fill: "#ffffff" } },
//                 },
//                 grid: { line: { stroke: "#ffffff22" } },
//                 tooltip: {
//                   container: {
//                     background: "#ffffff",
//                     color: "#1e293b",
//                     fontSize: 13,
//                     borderRadius: "6px",
//                     boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
//                     padding: "8px 10px",
//                   },
//                 },
//               }}
//               axisBottom={{
//                 tickRotation: -45,
//                 legend: "ماه شمسی",
//                 legendPosition: "middle",
//                 legendOffset: 40,
//               }}
//               axisLeft={{
//                 legend: "مجموع رینگ‌ها",
//                 legendPosition: "middle",
//                 legendOffset: -25,
//               }}
//               tooltip={({ indexValue, value }) => (
//                 <div className="bg-white text-gray-800 p-2 rounded shadow text-sm">
//                   <strong>{indexValue}:</strong> {value}
//                 </div>
//               )}
//             />
//           </div>
//         )}

//         {activeSection === "testsByDate" && groupedTestData.length > 0 && (
//           <div className="w-full h-[400px] mt-10">
//             <h2 className="text-xl font-bold mb-4 text-center text-white">
//               تست‌ها و تعداد آن بر حسب زمان
//             </h2>
//             <table className="w-full text-sm text-left border text-white border-neutral-700 mt-10">
//               <thead className="bg-[#5271ff] text-white text-center text-xs uppercase">
//                 <tr>
//                   <th scope="col" className="text-white px-4 py-3">
//                     ماه شمسی
//                   </th>
//                   <th scope="col" className="text-white px-4 py-3">
//                     نام تست
//                   </th>
//                   <th scope="col" className="text-white px-4 py-3">
//                     تعداد دفعات اجرا
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {groupedTestData.map((item, idx) => (
//                   <tr
//                     key={idx}
//                     className="bg-neutral-600 text-center border-b border-neutral-700"
//                   >
//                     <td className="px-4 py-2">{item.month}</td>
//                     <td className="px-4 py-2">{item.test}</td>
//                     <td className="px-4 py-2">{item.count}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {activeSection === "entryCountsBySize" && pieChartData.length > 0 && (
//           <div className="w-full h-[400px] mt-10">
//             <h2 className="text-xl font-bold mb-4 text-center text-white">
//               توزیع سایز تایرها (مجموع همه ماه‌ها)
//             </h2>
//             <ResponsivePie
//               data={pieChartData}
//               margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
//               innerRadius={0.4}
//               padAngle={1}
//               cornerRadius={6}
//               activeOuterRadiusOffset={8}
//               colors={{ scheme: "nivo" }}
//               borderWidth={1}
//               borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
//               arcLabelsSkipAngle={10}
//               arcLabelsTextColor="#ffffff"
//               arcLinkLabelsTextColor="#ffffff"
//               arcLinkLabelsThickness={1}
//               arcLinkLabelsColor={{ from: "color" }}
//               tooltip={({ datum }) => (
//                 <div className="bg-white text-black text-sm px-2 py-1 rounded shadow">
//                   {datum.label}: {datum.value}
//                 </div>
//               )}
//               theme={{
//                 labels: { text: { fill: "#ffffff" } },
//                 legends: { text: { fill: "#ffffff" } },
//               }}
//             />
//           </div>
//         )}

//         {/* Dashboard Section */}
//         <div className="mt-10 bg-neutral-900/70 rounded-xl p-6 backdrop-blur-sm border border-neutral-700">
//           <h2 className="text-2xl font-bold text-white mb-6 text-center">
//             داشبورد
//           </h2>

//           {/* Date Range Queries */}
//           <div className="mb-8">
//             <h3 className="text-lg font-semibold text-white mb-4">
//               گزارش‌های بر اساس بازه تاریخ
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {/* Entry Counts by Date */}
//               <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
//                 <h4 className="text-white font-medium mb-3">
//                   تعداد ثبت‌ها بر اساس تاریخ
//                 </h4>
//                 <div className="space-y-3">
//                   <input
//                     type="text"
//                     placeholder="تاریخ شروع (1403/01/01)"
//                     value={dateRanges.entryCountsByDate.startDate}
//                     onChange={(e) =>
//                       handleDateChange(
//                         "entryCountsByDate",
//                         "startDate",
//                         e.target.value
//                       )
//                     }
//                     className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-[#5271ff] focus:outline-none text-sm"
//                     dir="ltr"
//                   />
//                   <input
//                     type="text"
//                     placeholder="تاریخ پایان (1403/12/29)"
//                     value={dateRanges.entryCountsByDate.endDate}
//                     onChange={(e) =>
//                       handleDateChange(
//                         "entryCountsByDate",
//                         "endDate",
//                         e.target.value
//                       )
//                     }
//                     className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-[#5271ff] focus:outline-none text-sm"
//                     dir="ltr"
//                   />
//                   <button
//                     onClick={() => handleDateRangeSubmit("entryCountsByDate")}
//                     className="w-full bg-[#5271ff] hover:bg-[#4461ee] text-white py-2 px-4 rounded transition-colors text-sm"
//                   >
//                     نمایش داده‌ها
//                   </button>
//                 </div>
//               </div>

//               {/* Rings Sum by Date */}
//               <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
//                 <h4 className="text-white font-medium mb-3">
//                   مجموع حلقه‌ها بر اساس تاریخ
//                 </h4>
//                 <div className="space-y-3">
//                   <input
//                     type="text"
//                     placeholder="تاریخ شروع (1403/01/01)"
//                     value={dateRanges.ringsSumByDate.startDate}
//                     onChange={(e) =>
//                       handleDateChange(
//                         "ringsSumByDate",
//                         "startDate",
//                         e.target.value
//                       )
//                     }
//                     className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-[#5271ff] focus:outline-none text-sm"
//                     dir="ltr"
//                   />
//                   <input
//                     type="text"
//                     placeholder="تاریخ پایان (1403/12/29)"
//                     value={dateRanges.ringsSumByDate.endDate}
//                     onChange={(e) =>
//                       handleDateChange(
//                         "ringsSumByDate",
//                         "endDate",
//                         e.target.value
//                       )
//                     }
//                     className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-[#5271ff] focus:outline-none text-sm"
//                     dir="ltr"
//                   />
//                   <button
//                     onClick={() => handleDateRangeSubmit("ringsSumByDate")}
//                     className="w-full bg-[#5271ff] hover:bg-[#4461ee] text-white py-2 px-4 rounded transition-colors text-sm"
//                   >
//                     نمایش داده‌ها
//                   </button>
//                 </div>
//               </div>

//               {/* Tests by Date */}
//               <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
//                 <h4 className="text-white font-medium mb-3">
//                   آزمون‌ها بر اساس تاریخ
//                 </h4>
//                 <div className="space-y-3">
//                   <input
//                     type="text"
//                     placeholder="تاریخ شروع (1403/01/01)"
//                     value={dateRanges.testsByDate.startDate}
//                     onChange={(e) =>
//                       handleDateChange(
//                         "testsByDate",
//                         "startDate",
//                         e.target.value
//                       )
//                     }
//                     className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-[#5271ff] focus:outline-none text-sm"
//                     dir="ltr"
//                   />
//                   <input
//                     type="text"
//                     placeholder="تاریخ پایان (1403/12/29)"
//                     value={dateRanges.testsByDate.endDate}
//                     onChange={(e) =>
//                       handleDateChange("testsByDate", "endDate", e.target.value)
//                     }
//                     className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-[#5271ff] focus:outline-none text-sm"
//                     dir="ltr"
//                   />
//                   <button
//                     onClick={() => handleDateRangeSubmit("testsByDate")}
//                     className="w-full bg-[#5271ff] hover:bg-[#4461ee] text-white py-2 px-4 rounded transition-colors text-sm"
//                   >
//                     نمایش داده‌ها
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Button Queries */}
//           <div className="mb-6">
//             <h3 className="text-lg font-semibold text-white mb-4">
//               گزارش‌های عمومی
//             </h3>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//               <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
//                 <h4 className="text-white font-medium mb-3">
//                   تعداد ثبت‌ها بر اساس سایز
//                 </h4>
//                 <div className="space-y-3">
//                   <input
//                     type="text"
//                     placeholder="تاریخ شروع (1403/01/01)"
//                     value={dateRanges.entryCountsBySize.startDate}
//                     onChange={(e) =>
//                       handleDateChange(
//                         "entryCountsBySize",
//                         "startDate",
//                         e.target.value
//                       )
//                     }
//                     className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-[#5271ff] focus:outline-none text-sm"
//                     dir="ltr"
//                   />
//                   <input
//                     type="text"
//                     placeholder="تاریخ پایان (1403/12/29)"
//                     value={dateRanges.entryCountsBySize.endDate}
//                     onChange={(e) =>
//                       handleDateChange(
//                         "entryCountsBySize",
//                         "endDate",
//                         e.target.value
//                       )
//                     }
//                     className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-[#5271ff] focus:outline-none text-sm"
//                     dir="ltr"
//                   />
//                   <button
//                     onClick={() => handleDateRangeSubmit("entryCountsBySize")}
//                     className="w-full bg-[#5271ff] hover:bg-[#4461ee] text-white py-2 px-4 rounded transition-colors text-sm"
//                   >
//                     نمایش داده‌ها
//                   </button>
//                 </div>
//               </div>
//               <button
//                 onClick={() => handleButtonClick("entryCountsByBrand")}
//                 className="bg-gradient-to-r from-[#5271ff] to-[#4461ee] hover:from-[#4461ee] hover:to-[#3451dd] text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105 text-sm font-medium"
//               >
//                 ثبت‌ها بر اساس برند
//               </button>
//               <button
//                 onClick={() => handleButtonClick("entryCountsByCustomer")}
//                 className="bg-gradient-to-r from-[#5271ff] to-[#4461ee] hover:from-[#4461ee] hover:to-[#3451dd] text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105 text-sm font-medium"
//               >
//                 ثبت‌ها بر اساس مشتری
//               </button>
//               <button
//                 onClick={() => handleButtonClick("entryCountsByTireType")}
//                 className="bg-gradient-to-r from-[#5271ff] to-[#4461ee] hover:from-[#4461ee] hover:to-[#3451dd] text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105 text-sm font-medium"
//               >
//                 ثبت‌ها بر اساس نوع تایر
//               </button>
//               <button
//                 onClick={() => handleButtonClick("entryCountsByTireGroup")}
//                 className="bg-gradient-to-r from-[#5271ff] to-[#4461ee] hover:from-[#4461ee] hover:to-[#3451dd] text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105 text-sm font-medium"
//               >
//                 ثبت‌ها بر اساس گروه تایر
//               </button>
//               <button
//                 onClick={() => handleButtonClick("labConfirmationStatus")}
//                 className="bg-gradient-to-r from-[#5271ff] to-[#4461ee] hover:from-[#4461ee] hover:to-[#3451dd] text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105 text-sm font-medium"
//               >
//                 وضعیت تأیید آزمایشگاه
//               </button>
//               <button
//                 onClick={() => handleButtonClick("depositorySums")}
//                 className="bg-gradient-to-r from-[#5271ff] to-[#4461ee] hover:from-[#4461ee] hover:to-[#3451dd] text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105 text-sm font-medium"
//               >
//                 مجموع انبارها
//               </button>
//               <button
//                 onClick={() => handleButtonClick("allDashboardData")}
//                 className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105 text-sm font-medium"
//               >
//                 تمام داده‌ها
//               </button>
//             </div>
//           </div>

//           {/* Data Display */}
//           {renderData()}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Homepage;
