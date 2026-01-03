import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLaboratoryRecords,
  searchLaboratoryRecords,
} from "../features/laboratory/laboratoryThunks";
import LaboratoryRecordsForm from "../components/laboratory/LaboratoryForm";
import LaboratoryRecordsTable from "../components/laboratory/LaboratoryTable";
import SearchBox from "../components/homepage/SearchBox";
import UserInfoCard from "../components/UserInfoCard";
import { useNavigate } from "react-router-dom";
import {
  clearSelectedLaboratoryRecord,
  setSelectedLaboratoryRecord,
} from "../features/laboratory/laboratorySlice";
import { SiHomeadvisor } from "react-icons/si";
import { Link } from "react-router-dom";

const LaboratoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const selected = useSelector(
    (state) => state.laboratoryRecords.selectedLaboratoryRecord
  );

  useEffect(() => {
    dispatch(clearSelectedLaboratoryRecord()); // 👈 cancel any existing selection
    dispatch(fetchLaboratoryRecords()); // 👈 fetch fresh data
  }, [dispatch]);

  const handleSearch = (entryCode) => {
    dispatch(searchLaboratoryRecords(entryCode));
  };

  const handleEdit = (record) => {
    dispatch(setSelectedLaboratoryRecord(record));
  };

  const handleCancel = () => {
    dispatch(clearSelectedLaboratoryRecord());
  };

  return (
    <div className="bg-neutral-950 min-h-[100dvh] relative p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

      <div className="relative mx-auto w-full flex-1 flex flex-col">
        <header className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl mt-4 md:text-3xl font-bold text-[#facc15] animate-neon-yellow-limited mb-2 text-center sm:text-left">
            آزمایشگاه تایر
          </h1>

          <Link
            to="/Homepage"
            className="absolute left-1/2 transform -translate-x-1/2 text-5xl mt-8 text-[#facc15] hover:text-yellow-300 transition-colors"
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
  {selected && <LaboratoryRecordsForm onClose={handleCancel} />}

        <LaboratoryRecordsTable onEdit={handleEdit} />
      </div>
    </div>
  );
};

export default LaboratoryPage;
