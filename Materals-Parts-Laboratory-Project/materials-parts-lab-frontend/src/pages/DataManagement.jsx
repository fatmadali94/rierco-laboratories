// src/pages/DataManagement.jsx
import React, { useState } from "react";
import UserInfoCard from "../components/UserInfoCard";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import TestsManagement from "../components/dataManagement/TestsManagement";
import StandardsManagement from "../components/dataManagement/StandardsManagement";
import CustomersManagement from "../components/dataManagement/CustomersManagement";
import OrderersManagement from "../components/dataManagement/OrderersManagement";
import { SiHomeadvisor } from "react-icons/si";

const DataManagement = () => {
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("tests");

  const tabs = [
    { id: "tests", label: "آزمون‌ها", icon: "🧪" },
    { id: "standards", label: "استانداردها", icon: "📋" },
    { id: "customers", label: "مشتریان", icon: "🏢" },
    { id: "orderers", label: "متقاضیان", icon: "👤" },
  ];

  return (
    <div className="bg-bg min-h-[100dvh] relative p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
      <header className="mb-4 sm:mb-6 mx-auto">
        <div className="grid grid-cols-3 items-center gap-4">
          {/* LEFT COLUMN - Link and time info */}
          <div className="flex flex-col z-10 sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Link
              to="/Homepage"
              className="text-5xl text-pink"
              title="بازگشت به خانه"
            >
              <SiHomeadvisor />
            </Link>
          </div>

          {/* CENTER COLUMN - Title */}
          <div className="flex justify-center">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-shadow-triple-stroke text-center">
              پایگاه داده آزمایشگاه
            </h1>
          </div>

          {/* RIGHT COLUMN - User Info */}
          <div className="flex justify-end">
            <UserInfoCard user={user} />
          </div>
        </div>
      </header>
      <hr className="w-full h-0.5 bg-black mb-10"></hr>

      {/* Tabs */}
      <div className="bg-black rounded-lg p-2 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-darkOrange text-white"
                  : "bg-yellow text-white hover:bg-orange"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-black border rounded-lg p-6">
        {activeTab === "tests" && <TestsManagement />}
        {activeTab === "standards" && <StandardsManagement />}
        {activeTab === "customers" && <CustomersManagement />}
        {activeTab === "orderers" && <OrderersManagement />}
      </div>
    </div>
  );
};

export default DataManagement;
