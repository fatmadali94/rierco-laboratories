import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDepositoryRecords,
  searchDepositoryRecords,
} from "../features/depository/depositorythunks";
import DepositoryRecordsForm from "../components/depository/DepositoryRecordsForm";
import DepositoryRecordsTable from "../components/depository/DepositoryRecordsTable";
import SearchBox from "../components/homepage/SearchBox";
import UserInfoCard from "../components/UserInfoCard";
import { useNavigate } from "react-router-dom";
import {
  clearSelectedDepositoryRecord,
  setSelectedDepositoryRecord,
} from "../features/depository/depositorySlice";
import { SiHomeadvisor } from "react-icons/si";
import { Link } from "react-router-dom";

const DepositoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const selected = useSelector(
    (state) => state.depositoryRecords.selectedDepositoryRecord
  );

  useEffect(() => {
    dispatch(clearSelectedDepositoryRecord()); // 👈 cancel any existing selection
    dispatch(fetchDepositoryRecords()); // 👈 fetch fresh data
  }, [dispatch]);

  const handleSearch = (entryCode) => {
    dispatch(searchDepositoryRecords(entryCode));
  };

  const handleEdit = (record) => {
    dispatch(setSelectedDepositoryRecord(record));
  };

  const handleCancel = () => {
    dispatch(clearSelectedDepositoryRecord());
  };

  return (
    <div className="bg-neutral-950 min-h-[100dvh] relative p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

      <div className="relative mx-auto w-full flex-1 flex flex-col">
        <header className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl mt-4 md:text-3xl font-bold text-[#ff4d4d] animate-neon-red-limited mb-2 text-center sm:text-left">
            انبار آزمون تایر
          </h1>

          <Link
            to="/Homepage"
            className="absolute left-1/2 transform -translate-x-1/2 text-5xl mt-8 text-[#ff4d4d] hover:text-red-300 transition-colors"
            title="بازگشت به خانه"
          >
            <SiHomeadvisor />
          </Link>

          <UserInfoCard user={user} />
        </header>

        <SearchBox
          onSearch={handleSearch}
          placeholder="کد ردیابی را برای جستجو وارد کنید"
        />

        {/* ✅ Show form only when a record is selected */}
  {selected && <DepositoryRecordsForm onClose={handleCancel} />}

        <DepositoryRecordsTable onEdit={handleEdit} />
      </div>
    </div>
  );
};

export default DepositoryPage;
