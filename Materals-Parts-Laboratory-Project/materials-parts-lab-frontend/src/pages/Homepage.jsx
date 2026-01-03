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
import { toast } from "sonner";
import { TbAlertHexagon } from "react-icons/tb";

// Import your date conversion functions
import {
  convertJalaliToGregorian,
  convertGregorianToJalali,
} from "../utils/dateHelpers";

//import chat parts:
import { Link } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { fetchUnreadCount } from "../redux/chat/chatSlice";

const Homepage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [monthlyProgress, setMonthlyProgress] = useState({
    total: 0,
    completed: 0,
    monthName: "",
  });
  const monthlyTarget = 80;

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

  return (
    <div className="bg-bg cursor-big min-h-[100dvh] relative p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
      <header className="mb-4 sm:mb-6 mx-auto">
        <div className="grid grid-cols-3 items-center gap-4">
          {/* LEFT COLUMN - Link and time info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Link
              to="/chat"
              className="relative p-2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <FiMessageCircle className="w-10 h-10 text-black" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-darkOrange to-orange text-black text-xs rounded-full min-w-[20px] text-center shadow-lg">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-bold text-black">
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
                      className="w-5 h-5 text-transparent stroke-black stroke-2"
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

          {/* CENTER COLUMN - Title */}
          <div className="flex justify-center">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-shadow-triple-stroke text-center">
              آزمایشگاه مواد و قطعات
            </h1>
          </div>

          {/* RIGHT COLUMN - User Info */}
          <div className="flex justify-end">
            <UserInfoCard user={user} />
          </div>
        </div>
      </header>
      <hr className="w-full h-0.5 bg-black mb-10"></hr>
      {/* Buttons and User Info */}
      <div className="">
        <ActionButtons />
      </div>
    </div>
  );
};
<div>
  <img src={companyLogo} alt="companyLogo" className="w-32 mt-5" />
</div>;
export default Homepage;
