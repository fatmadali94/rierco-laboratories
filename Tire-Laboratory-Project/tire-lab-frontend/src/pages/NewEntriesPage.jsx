import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  fetchNewEntries,
  searchNewEntries,
} from "../features/newEntires/newEntriesThunks";
import { clearSelectedNewEntry } from "../features/newEntires/newEntiresSlice";
import NewEntriesForm from "../components/newEntries/NewEntriesForm";
import NewEntriesTable from "../components/newEntries/NewEntriesTable";
import SearchBox from "../components/homepage/SearchBox";
import UserInfoCard from "../components/UserInfoCard";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { SiHomeadvisor } from "react-icons/si";
import { Link } from "react-router-dom";

const NewEntriesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // 👈 Hook to detect route changes
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(clearSelectedNewEntry());
    dispatch(fetchNewEntries());
  }, [location.pathname]); // 👈 Triggers every time path changes

  const handleSearch = (entryCode) => {
    dispatch(searchNewEntries(entryCode));
  };

  return (
    <div className="bg-neutral-950 min-h-[100dvh] relative p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

      <div className="relative  mx-auto w-full flex-1 flex flex-col">
        <header className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl mt-4 md:text-3xl font-bold text-[#00ffae] animate-neon-green-limited mb-2 text-center sm:text-left">
            ثبت آزمون جدید
          </h1>

          <Link
            to="/Homepage"
            className="absolute left-1/2 transform -translate-x-1/2 text-5xl mt-8 text-[#00ffae] hover:text-green-300 transition-colors"
            title="بازگشت به خانه"
          >
            <SiHomeadvisor />
          </Link>

          <UserInfoCard user={user} />
        </header>
        <SearchBox
          onSearch={handleSearch}
          placeholder="کد ردیابی را برای جستجو و ویرایش وارد کنید"
        />
        <NewEntriesForm />
        <NewEntriesTable />
      </div>
    </div>
  );
};

export default NewEntriesPage;
