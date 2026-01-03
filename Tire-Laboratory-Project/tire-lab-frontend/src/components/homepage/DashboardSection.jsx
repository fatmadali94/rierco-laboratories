import React from "react";
import DateRangeCard from "./DateRangeCard";
import { useSelector } from "react-redux";

const roleAccess = {
  admin: ["ورودی_جدید", "انبار", "پذیرش", "مرکز_آزمون"],
  depository: ["ورودی_جدید", "انبار"],
  receptor: ["پذیرش"],
  tireLabrator: ["مرکز_آزمون"],
};

const DashboardSection = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onButtonClick,
  handleDownloadAllData,
  handleDownloadDepositoryData,
  loading = {},
}) => {
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.position?.toLowerCase();
  const access = roleAccess[userRole] || [];
  const restrictedKeys = ["depositorySums", "allDepositoryData"];
  const isRestrictedRole = ["receptor", "tireLabrator"].includes(userRole);

  const allDateBasedQueries = [
    { key: "entryCountsByDate", title: "ثبت‌ها بر اساس تاریخ" },
    { key: "ringsSumByDate", title: "مجموع حلقه‌ها بر اساس تاریخ" },
    { key: "testsByDate", title: "آزمون‌ها بر اساس تاریخ" },
    { key: "entryCountsBySize", title: "ثبت‌ها بر اساس سایز" },
    { key: "entryCountsByBrand", title: "ثبت‌ها بر اساس برند" },
    { key: "entryCountsByCustomer", title: "ثبت‌ها بر اساس مشتری" },
    { key: "entryCountsByTireType", title: "ثبت‌ها بر اساس نوع تایر" },
    { key: "entryCountsByTireGroup", title: "ثبت‌ها بر اساس گروه تایر" },
    { key: "labConfirmationStatus", title: "وضعیت تأیید آزمایشگاه" },
    { key: "depositorySums", title: "موجودی انبار" },
    { key: "allDepositoryData", title: "فایل اکسل انبار آزمون تایر" },
    { key: "allDashboardData", title: "فایل اکسل تمامی داده‌ها" },
  ];

  return (
    <div className="mt-10 bg-neutral-900/70 rounded-xl p-6 backdrop-blur-sm border border-neutral-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        گزارش‌های آزمون تایر
      </h2>

      {/* ✅ Global date inputs */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9۰-۹/-]*"
          placeholder="تاریخ شروع (1404/01/01)"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full md:w-60 px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-[#5271ff] focus:outline-none text-sm"
          dir="ltr"
        />
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9۰-۹/-]*"
          placeholder="تاریخ پایان (1404/12/29)"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full md:w-60 px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-[#5271ff] focus:outline-none text-sm"
          dir="ltr"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allDateBasedQueries.map((query) => {
          const isDisabled =
            isRestrictedRole && restrictedKeys.includes(query.key);

          return (
            <DateRangeCard
              key={query.key}
              title={query.title}
              disabled={isRestrictedRole && restrictedKeys.includes(query.key)} // ✅ pass disabled to DateRangeCard
              onSubmit={() => {
                if (isRestrictedRole && restrictedKeys.includes(query.key))
                  return; // ✅ prevent click
                if (query.key === "allDashboardData") {
                  handleDownloadAllData();
                } else if (query.key === "allDepositoryData") {
                  handleDownloadDepositoryData();
                } else {
                  onButtonClick(query.key);
                }
              }}
              loading={loading[query.key]}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DashboardSection;
