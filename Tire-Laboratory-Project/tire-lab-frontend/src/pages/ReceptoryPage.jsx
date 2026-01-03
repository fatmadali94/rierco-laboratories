import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReceptoryRecords,
  searchReceptoryRecords,
} from "../features/receptory/receptoryThunks";
import ReceptoryRecordsForm from "../components/receptory/ReceptoryRecordsForm";
import ReceptoryRecordsTable from "../components/receptory/ReceptoryRecordsTable";
import SearchBox from "../components/homepage/SearchBox";
import UserInfoCard from "../components/UserInfoCard";
import { useNavigate } from "react-router-dom";
import {
  clearSelectedReceptoryRecord,
  setSelectedReceptoryRecord,
} from "../features/receptory/receptorySlice";
import { SiHomeadvisor } from "react-icons/si";
import { Link } from "react-router-dom";

const ReceptoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const selected = useSelector(
    (state) => state.receptoryRecords.selectedReceptoryRecord
  );

  useEffect(() => {
    dispatch(clearSelectedReceptoryRecord()); // 👈 cancel any existing selection
    dispatch(fetchReceptoryRecords()); // 👈 fetch fresh data
  }, [dispatch]);

  const handleSearch = (entryCode) => {
    dispatch(searchReceptoryRecords(entryCode));
  };

  const handleEdit = (record) => {
    dispatch(setSelectedReceptoryRecord(record));
  };

  const handleCancel = () => {
    dispatch(clearSelectedReceptoryRecord());
  };

  return (
    <div className="bg-neutral-950 min-h-[100dvh] relative p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

      <div className="relative mx-auto w-full flex-1 flex flex-col">
        <header className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl mt-4 md:text-3xl font-bold text-[#83358F] animate-neon-purple-limited mb-2 text-center sm:text-left">
            پذیرش آزمون تایر
          </h1>

          <Link
            to="/Homepage"
            className="absolute left-1/2 transform -translate-x-1/2 text-5xl mt-8 text-[#83358F] hover:text-purple-300 transition-colors"
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

        <div className="flex justify-end my-4">
          <Link to="/retrieval_form" title="فرم تحویل">
            <button
              className="relative px-6 py-3 bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 
       hover:from-purple-300 hover:via-purple-200 hover:to-purple-400 
       text-black font-bold rounded-xl
       shadow-purple-300 
       hover:shadow-purple-500
       border-2 border-purple-300/50 hover:border-purple-200
       transform hover:scale-105 transition-all duration-300 ease-out text-sm"
            >
              ایجاد فرم تحویلی
            </button>
          </Link>
        </div>

        {/* ✅ Show form only when a record is selected */}
  {selected && <ReceptoryRecordsForm onClose={handleCancel} />}

        <ReceptoryRecordsTable onEdit={handleEdit} />
      </div>
    </div>
  );
};

export default ReceptoryPage;
