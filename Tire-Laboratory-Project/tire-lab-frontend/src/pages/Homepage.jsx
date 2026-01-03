import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import UserInfoCard from "../components/UserInfoCard";
import { useNavigate } from "react-router-dom";
import ActionButtons from "../components/homepage/ActionButtons";
import persianMonths from "../data/persianMonths";
import persianWeekdays from "../data/persianWeekdays";
import axios from "axios";
import { companyLogo } from "../assets/assets";

// Import your new components
import ChartContainer from "../components/homepage/ChartContainer";
import DataTable from "../components/homepage/DataTable";
import DataDisplay from "../components/homepage/DataDisplay";
import DashboardSection from "../components/homepage/DashboardSection";
import { toast } from "sonner";
import { TbAlertHexagon } from "react-icons/tb";
import {
  fetchEntryCountsByDate,
  fetchRingsSumByDate,
  fetchEntryCountsBySize,
  fetchEntryCountsByBrand,
  fetchEntryCountsByCustomer,
  fetchTestsByDate,
  fetchEntryCountsByTireType,
  fetchEntryCountsByTireGroup,
  fetchLabConfirmationStatus,
  fetchDepositorySums,
  fetchAllDashboardData,
  fetchDepositoryData,
} from "../features/dashboard/dashboardThunks";
import {
  selectEntryCountsByDate,
  selectRingsSumByDate,
  selectEntryCountsBySize,
  selectEntryCountsByBrand,
  selectEntryCountsByCustomer,
  selectTestsByDate,
  selectEntryCountsByTireType,
  selectEntryCountsByTireGroup,
  selectLabConfirmationStatus,
  selectAllDashboardData,
  selectDepositoryData,
  selectDepositorySums,
} from "../features/dashboard/dashboardSelectors";

// Import your date conversion functions
import {
  convertJalaliToGregorian,
  convertGregorianToJalali,
} from "../utils/dateHelpers";

//import chat parts:
import { Link } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { fetchUnreadCount } from "../features/chat/chatSlice";

// Utility functions (keep these as they are)
const groupCountsByJalaliMonth = (data = []) => {
  if (!Array.isArray(data)) return [];

  const result = {};

  data.forEach((item) => {
    const jalaliDate = convertGregorianToJalali(item.date);
    const [year, month] = jalaliDate.split("/");
    const key = `${year}/${month.padStart(2, "0")}`;

    const count = parseInt(item.count, 10);
    result[key] = (result[key] || 0) + count;
  });

  return Object.entries(result).map(([month, count]) => ({
    month,
    count,
  }));
};

const Homepage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyProgress, setMonthlyProgress] = useState({
    total: 0,
    completed: 0,
    monthName: "",
  });
  const monthlyTarget = 80;

  const BASE_URL = `${import.meta.env.VITE_BASE_URL}/dashboard`;

  // Dashboard data selectors
  const entryCountsByDate = useSelector(selectEntryCountsByDate);
  const ringsSumByDate = useSelector(selectRingsSumByDate);
  const entryCountsBySize = useSelector(selectEntryCountsBySize);
  const entryCountsByBrand = useSelector(selectEntryCountsByBrand);
  const entryCountsByCustomer = useSelector(selectEntryCountsByCustomer);
  const testsByDate = useSelector(selectTestsByDate);
  // console.log("Depository sums from Redux:", testsByDate);
  const entryCountsByTireType = useSelector(selectEntryCountsByTireType);
  const entryCountsByTireGroup = useSelector(selectEntryCountsByTireGroup);
  const labConfirmationStatus = useSelector(selectLabConfirmationStatus);
  const depositorySums = useSelector(selectDepositorySums);
  const allDashboardData = useSelector(selectAllDashboardData);
  const depositoryData = useSelector(selectDepositoryData);
  const [loading, setLoading] = useState({});

  //for time displaying
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10); // e.g. "2025-07-04"
  const jalaliDate = convertGregorianToJalali(todayIso); // e.g. "1404/04/13"
  const options = { hour: "numeric", hour12: false, timeZone: "Asia/Tehran" };
  const hourTehran = parseInt(new Date().toLocaleString("en-US", options), 10);
  const isDayTime = hourTehran >= 6 && hourTehran < 18;
  const [currentTime, setCurrentTime] = useState({
    jalaliDate: "",
    timeString: "",
    isDayTime: true,
    weekdayName: "",
  });

  const unreadCount = useSelector((state) => state.chat.unreadCount);

  useEffect(() => {
    // Fetch unread count on component mount
    dispatch(fetchUnreadCount());

    // Optionally refresh every minute
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const todayIso = now.toISOString().slice(0, 10);
      const jalali = convertGregorianToJalali(todayIso);

      const formatter = new Intl.DateTimeFormat("fa-IR", {
        timeZone: "Asia/Tehran",
        hour: "2-digit",
        minute: "2-digit",
      });
      const time = formatter.format(now);

      const options = {
        hour: "numeric",
        hour12: false,
        timeZone: "Asia/Tehran",
      };
      const hourTehran = parseInt(now.toLocaleString("en-US", options), 10);
      const isDay = hourTehran >= 6 && hourTehran < 18;

      const weekdayIndex = now.getDay();
      const weekdayName = persianWeekdays[weekdayIndex];

      setCurrentTime({
        jalaliDate: jalali,
        timeString: time,
        isDayTime: isDay,
        weekdayName,
      });
    };

    updateTime(); // show time immediately on mount

    const intervalId = setInterval(updateTime, 60 * 1000); // update once per minute

    return () => clearInterval(intervalId);
  }, []);

  //for progress bar
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const today = new Date();
        const todayIso = today.toISOString().slice(0, 10); // "YYYY-MM-DD"
        const jalaliDate = convertGregorianToJalali(todayIso);

        if (typeof jalaliDate !== "string") {
          console.error("Unexpected Jalali conversion result:", jalaliDate);
          return;
        }

        const [year, monthStr] = jalaliDate.split("/");
        const monthIndex = parseInt(monthStr, 10);
        const monthName = persianMonths[monthIndex];

        const startOfMonthJalali = `${year}/${monthStr}/01`;
        const endOfMonthJalali = `${year}/${monthStr}/31`;

        const startDate = convertJalaliToGregorian(startOfMonthJalali);
        const endDate = convertJalaliToGregorian(endOfMonthJalali);

        // ✅ Dispatch thunk instead of axios/fetch manually
        dispatch(fetchEntryCountsByDate({ startDate, endDate }));

        // The rest of progress calculation happens in another useEffect below
        setMonthlyProgress((prev) => ({
          ...prev,
          monthName,
        }));
      } catch (error) {
        console.error("Error fetching monthly progress:", error);
      }
    };

    fetchProgress();
  }, [dispatch]);

  useEffect(() => {
    if (!entryCountsByDate || entryCountsByDate.length === 0) return;

    const total = entryCountsByDate.reduce(
      (acc, day) => acc + parseInt(day.count, 10),
      0
    );

    const completed = total;
    const percentage = Math.min((completed / monthlyTarget) * 100, 100);

    setMonthlyProgress((prev) => ({
      ...prev,
      total,
      completed,
      percentage,
    }));
  }, [entryCountsByDate]);

  // Processed data for charts
  const groupedentryCountsData = useMemo(() => {
    if (Array.isArray(entryCountsByDate)) {
      return groupCountsByJalaliMonth(entryCountsByDate);
    }
    return [];
  }, [entryCountsByDate]);

  //for dashboard Items
  const preparedRingsData = useMemo(() => {
    return Array.isArray(ringsSumByDate)
      ? ringsSumByDate.map((item) => ({
          date: item.date,
          count: item.total_rings,
        }))
      : [];
  }, [ringsSumByDate]);

  const groupedRingsData = useMemo(() => {
    return groupCountsByJalaliMonth(preparedRingsData);
  }, [preparedRingsData]);

  const groupedTestData = useMemo(() => {
    if (!testsByDate) return [];

    return testsByDate.map((item) => ({
      standard: item.standard,
      label: item.test,
      value: Number(item.total),
    }));
  }, [testsByDate]);

  const groupedSizeData = useMemo(() => {
    if (!entryCountsBySize) return [];

    return entryCountsBySize.map((item) => ({
      label: item.size,
      value: Number(item.count),
    }));
  }, [entryCountsBySize]);

  const groupedBrandData = useMemo(() => {
    if (!entryCountsByBrand) return [];

    return entryCountsByBrand.map((item) => ({
      label: item.brand,
      value: Number(item.count),
    }));
  }, [entryCountsByBrand]);

  const groupedCustomerData = useMemo(() => {
    if (!entryCountsByCustomer) return [];

    return entryCountsByCustomer.map((item) => ({
      label: item.customer,
      value: Number(item.count),
    }));
  }, [entryCountsByCustomer]);

  const groupedTireTypeData = useMemo(() => {
    if (!entryCountsByTireType) return [];

    return entryCountsByTireType.map((item) => ({
      id: item.tire_type,
      value: Number(item.total),
    }));
  }, [entryCountsByTireType]);

  const pieChartTireTypeData = useMemo(() => {
    const tireTypeMap = {};

    groupedTireTypeData.forEach(({ tire_type, count }) => {
      if (!tireTypeMap[tire_type]) {
        tireTypeMap[tire_type] = 0;
      }
      tireTypeMap[tire_type] += parseInt(count, 10);
    });

    return Object.entries(tireTypeMap).map(([tire_type, count]) => ({
      id: tire_type,
      label: tire_type,
      value: count,
    }));
  }, [groupedTireTypeData]);

  const groupedTireGroupData = useMemo(() => {
    if (!entryCountsByTireGroup) return [];

    return entryCountsByTireGroup.map((item) => ({
      id: item.tire_group,
      value: Number(item.total),
    }));
  }, [entryCountsByTireGroup]);

  const pieChartTireGroupData = useMemo(() => {
    const tireGroupMap = {};

    groupedTireGroupData.forEach(({ tire_group, count }) => {
      if (!tireGroupMap[tire_group]) {
        tireGroupMap[tire_group] = 0;
      }
      tireGroupMap[tire_group] += parseInt(count, 10);
    });

    return Object.entries(tireGroupMap).map(([tire_group, count]) => ({
      id: tire_group,
      label: tire_group,
      value: count,
    }));
  }, [groupedTireGroupData]);

  const processedLabConfirmationStatus = useMemo(() => {
    if (!labConfirmationStatus) return [];

    return labConfirmationStatus.map((item) => ({
      label: item.confirmation_status === "yes" ? "تأیید شده" : "رد شده",
      value: Number(item.count),
    }));
  }, [labConfirmationStatus]);

  const groupedDipositorySumsData = useMemo(() => {
    if (!depositorySums) return [];

    const labelsMap = {
      total_remained_a: "باقیمانده A",
      total_remained_b: "باقیمانده B",
      total_remained_c: "باقیمانده C",
      total_delivery_type_a: "تحویل مشتری A",
      total_delivery_type_b: "تحویل مشتری B",
      total_delivery_type_c: "تحویل مشتری C",
      total_auction_a: "مزایده A",
      total_auction_b: "مزایده B",
      total_auction_c: "مزایده C",
    };

    return Object.entries(depositorySums).map(([key, value]) => ({
      label: labelsMap[key] || key, // fallback: original key if no mapping
      value: Number(value),
    }));
  }, [depositorySums]);

  // Dashboard states
  const [activeSection, setActiveSection] = useState("");

  const showInvalidToast = (msg = "تاریخ وارد شده معتبر نیست") =>
    toast.custom(
      () => (
        <div
          dir="rtl"
          className="flex items-center gap-2 px-4 py-3 text-orange-500"
        >
          <TbAlertHexagon className="w-6 h-6 animate-bounce motion-reduce:animate-none" />
          <span className="text-sm sm:text-base opacity-80">{msg}</span>
        </div>
      ),
      { duration: 3000 }
    );

  // Handle button clicks for queries without parameters
  const handleButtonClick = (section) => {
    if (!startDate || !endDate) {
      showInvalidToast("لطفاً هر دو تاریخ را وارد کنید");
      return;
    }

    let gregorianStartDate, gregorianEndDate;

    try {
      // 2) conversion may throw → catch it and toast
      gregorianStartDate = convertJalaliToGregorian(startDate);
      gregorianEndDate = convertJalaliToGregorian(endDate);
    } catch (err) {
      console.error(err);
      showInvalidToast("فرمت تاریخ جلالی نامعتبر است");
      return;
    }

    // 3) post-conversion validation (in case the function returns bad values instead of throwing)
    const isValidDate = (v) => {
      if (v instanceof Date) return !Number.isNaN(v.getTime());
      if (typeof v === "string" || typeof v === "number")
        return !Number.isNaN(Date.parse(v));
      return false;
    };

    if (!isValidDate(gregorianStartDate) || !isValidDate(gregorianEndDate)) {
      showInvalidToast("تاریخ تبدیل‌شده معتبر نیست");
      return;
    }

    setActiveSection(section);

    const thunkMap = {
      entryCountsByDate: fetchEntryCountsByDate,
      ringsSumByDate: fetchRingsSumByDate,
      testsByDate: fetchTestsByDate,
      entryCountsBySize: fetchEntryCountsBySize,
      entryCountsByBrand: fetchEntryCountsByBrand,
      entryCountsByCustomer: fetchEntryCountsByCustomer,
      entryCountsByTireType: fetchEntryCountsByTireType,
      entryCountsByTireGroup: fetchEntryCountsByTireGroup,
      labConfirmationStatus: fetchLabConfirmationStatus,
      depositorySums: fetchDepositorySums,
    };

    if (thunkMap[section]) {
      dispatch(
        thunkMap[section]({
          startDate: gregorianStartDate,
          endDate: gregorianEndDate,
        })
      );
    }
  };

  // Get data for current active section
  const getCurrentSectionData = () => {
    const dataMap = {
      entryCountsByDate: entryCountsByDate,
      ringsSumByDate: ringsSumByDate,
      testsByDate: testsByDate,
      entryCountsBySize: entryCountsBySize,
      entryCountsByBrand: entryCountsByBrand,
      entryCountsByCustomer: entryCountsByCustomer,
      entryCountsByTireType: entryCountsByTireType,
      entryCountsByTireGroup: entryCountsByTireGroup,
      labConfirmationStatus: labConfirmationStatus,
      depositorySums: groupedDipositorySumsData,
      allDashboardData: allDashboardData,
    };

    const titleMap = {
      entryCountsByDate: "تعداد ثبت‌ها بر اساس تاریخ",
      ringsSumByDate: "مجموع حلقه‌ها بر اساس تاریخ",
      testsByDate: "آزمایش‌ها بر اساس تاریخ",
      entryCountsBySize: "تعداد ثبت‌ها بر اساس سایز",
      entryCountsByBrand: "تعداد ثبت‌ها بر اساس برند",
      entryCountsByCustomer: "تعداد ثبت‌ها بر اساس مشتری",
      entryCountsByTireType: "تعداد ثبت‌ها بر اساس نوع لاستیک",
      entryCountsByTireGroup: "تعداد ثبت‌ها بر اساس گروه لاستیک",
      labConfirmationStatus: "وضعیت تأیید آزمایشگاه",
      depositorySums: "موجودی انبار",
      depositoryData: "اکسل اطلاعات انبار",
      allDashboardData: "تمام داده‌های داشبورد",
    };

    return {
      data: dataMap[activeSection],
      title: titleMap[activeSection] || "داده‌ها",
    };
  };

  const handleDownloadAllData = async () => {
    if (!startDate || !endDate) {
      toast.custom(() => (
        <div
          dir="rtl"
          className="flex items-center justify-center gap-2 px-4 py-3 text-orange-500"
        >
          <TbAlertHexagon className="w-6 h-6 animate-bounce motion-reduce:animate-none" />
          <span className="text-xl opacity-80">
            لطفاً هر دو تاریخ را وارد کنید
          </span>
        </div>
      ));
      return;
    }

    const gregorianStartDate = convertJalaliToGregorian(startDate);
    const gregorianEndDate = convertJalaliToGregorian(endDate);

    const url = `${BASE_URL}/download-all-data?startDate=${gregorianStartDate}&endDate=${gregorianEndDate}`;

    try {
      const response = await axios.get(url, { responseType: "blob" });
      // console.log("Raw response:", response);

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "all_data.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      toast.custom(() => (
        <div
          dir="rtl"
          className="flex items-center justify-center gap-2 px-4 py-3 text-orange-500"
        >
          <TbAlertHexagon className="w-6 h-6 animate-bounce motion-reduce:animate-none" />
          <span className="text-xl opacity-80">
            مشکلی در دانلود فایل وجود دارد
          </span>
        </div>
      ));
    }
  };

  const handleDownloadDepositoryData = async () => {
    if (!startDate || !endDate) {
      toast.custom(() => (
        <div
          dir="rtl"
          className="flex items-center justify-center gap-2 px-4 py-3 text-orange-500"
        >
          <TbAlertHexagon className="w-6 h-6 animate-bounce motion-reduce:animate-none" />
          <span className="text-xl opacity-80">
            لطفاً هر دو تاریخ را وارد کنید
          </span>
        </div>
      ));
      return;
    }

    const gregorianStartDate = convertJalaliToGregorian(startDate);
    const gregorianEndDate = convertJalaliToGregorian(endDate);

    const url = `${BASE_URL}/download-depository-data?startDate=${gregorianStartDate}&endDate=${gregorianEndDate}`;

    try {
      const response = await axios.get(url, { responseType: "blob" });
      // console.log("Raw response:", response);

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "depository_data.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      toast.custom(() => (
        <div
          dir="rtl"
          className="flex items-center justify-center gap-2 px-4 py-3 text-orange-500"
        >
          <TbAlertHexagon className="w-6 h-6 animate-bounce motion-reduce:animate-none" />
          <span className="text-xl opacity-80">
            مشکلی در دانلود فایل وجود دارد
          </span>
        </div>
      ));
    }
  };

  // Get chart data for current section
  const getChartData = () => {
    switch (activeSection) {
      case "entryCountsByDate":
        return groupedentryCountsData;
      case "ringsSumByDate":
        return groupedRingsData;
      case "entryCountsByTireType":
        return groupedTireTypeData;
      case "entryCountsByTireGroup":
        return groupedTireGroupData;
      default:
        return [];
    }
  };

  // Determine chart type for current section
  const getChartType = () => {
    switch (activeSection) {
      case "entryCountsByDate":
        return "bar";
      case "ringsSumByDate":
        return "bar";
      case "entryCountsByTireType":
        return "pie";
      case "entryCountsByTireGroup":
        return "pie";
      default:
        return "line";
    }
  };

  const getTableData = () => {
    switch (activeSection) {
      case "testsByDate":
        return groupedTestData;
      case "depositorySums":
        return groupedDipositorySumsData;
      case "entryCountsBySize":
        return groupedSizeData;
      case "entryCountsByBrand":
        return groupedBrandData;
      case "entryCountsByCustomer":
        return groupedCustomerData;
      default:
        return [];
    }
  };
  // console.log("Table data:", getTableData());
  // Get table headers for current section
  const getTableColumns = () => {
    switch (activeSection) {
      case "testsByDate":
        return [
          { header: "استاندارد", accessor: "standard" },
          { header: "نام تست", accessor: "label" },
          { header: "تعداد", accessor: "value" },
        ];
      case "depositorySums":
        return [
          { header: "نوع تایر", accessor: "label" },
          { header: "تعداد", accessor: "value" },
        ];
      case "entryCountsBySize":
        return [
          { header: "سایز تایر", accessor: "label" },
          { header: "تعداد", accessor: "value" },
        ];
      case "entryCountsByBrand":
        return [
          { header: "مارک تجاری تایر", accessor: "label" },
          { header: "تعداد", accessor: "value" },
        ];
      case "entryCountsByCustomer":
        return [
          { header: "درخواست دهنده آزمون", accessor: "label" },
          { header: "تعداد", accessor: "value" },
        ];
      default:
        return [];
    }
  };

  const currentSectionData = getCurrentSectionData();

  return (
    <div className="bg-neutral-950 min-h-[100dvh] relative p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
      <div className=" bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
      <header className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl mt-4 md:text-3xl font-bold text-white animate-neon-pulse-limited mb-2 text-center sm:text-left">
          آزمون تایر
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Progress Section */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm flex-wrap justify-center sm:justify-start">
            <span className="text-[#5271ff] whitespace-nowrap">
              {monthlyProgress.monthName || "ماه جاری"}
            </span>
            <div className="h-1.5 w-32 sm:w-48 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5271ff] rounded-full transition-all duration-300"
                style={{
                  width: `${monthlyProgress.percentage || 0}%`,
                }}
              ></div>
            </div>
            <span className="text-neutral-400 whitespace-nowrap">
              {monthlyProgress.total > 0
                ? `${Math.round(monthlyProgress.percentage)}% (${monthlyProgress.completed}/${monthlyTarget})`
                : `0% (0/${monthlyTarget})`}
            </span>
          </div>

          {/* Date/Time Section */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-white">
            <Link
              to="/chat"
              className="relative p-2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <FiMessageCircle className="w-12 h-12" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs rounded-full min-w-[20px] text-center shadow-lg shadow-cyan-500/50">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-1">
              <span>{currentTime.weekdayName}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{currentTime.jalaliDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{currentTime.timeString}</span>
            </div>

            <div className="flex items-center gap-1">
              <span
                className={
                  currentTime.isDayTime ? "text-yellow-400" : "text-blue-400"
                }
              >
                {currentTime.isDayTime ? (
                  "☀️"
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21.752 15.002A9 9 0 0112 3a9.003 9.003 0 00-8.752 12.002A9 9 0 1021.752 15.002z" />
                  </svg>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons and User Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-6">
          <ActionButtons />

          <UserInfoCard user={user} />
        </div>
      </header>{" "}
      <DashboardSection
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onButtonClick={handleButtonClick}
        handleDownloadAllData={handleDownloadAllData}
        handleDownloadDepositoryData={handleDownloadDepositoryData}
        loading={loading}
      />
      {/* Display Results */}
      {activeSection && currentSectionData.data && (
        <div className="mb-10">
          {/* Chart Display */}
          {[
            "entryCountsByDate",
            "ringsSumByDate",
            "entryCountsByTireType",
            "entryCountsByTireGroup",
          ].includes(activeSection) && (
            <ChartContainer
              data={getChartData()}
              type={getChartType()}
              title={currentSectionData.title}
            />
          )}

          {/* Data Table */}
          {[
            "testsByDate",
            "depositorySums",
            "entryCountsBySize",
            "entryCountsByBrand",
            "entryCountsByCustomer",
          ].includes(activeSection) && (
            <DataTable
              data={getTableData()} // ✅ call the function!
              title={currentSectionData.title}
              columns={getTableColumns()}
            />
          )}

          {activeSection === "labConfirmationStatus" &&
            processedLabConfirmationStatus && (
              <>
                <h2 className="text-xl font-bold mb-4 text-center text-white mt-10">
                  {currentSectionData.title}
                </h2>

                <div className="flex flex-wrap gap-4 justify-center mt-8">
                  {processedLabConfirmationStatus.map((status, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg w-40 ${
                        status.label === "تأیید شده"
                          ? "bg-green-700"
                          : "bg-red-700"
                      }`}
                    >
                      <div className="text-4xl font-bold text-white">
                        {status.value}
                      </div>
                      <div className="text-md text-white mt-2">
                        {status.label}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          {/* Raw Data Display */}
          <DataDisplay
            data={currentSectionData.data}
            loading={currentSectionData.data?.loading}
            error={currentSectionData.data?.error}
          />
        </div>
      )}
      <div>
        <img src={companyLogo} alt="companyLogo" className="w-32 mt-5" />
      </div>
    </div>
  );
};

export default Homepage;
