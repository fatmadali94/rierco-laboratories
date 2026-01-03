// src/components/dataManagement/StandardsManagement.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createStandard,
  updateStandard,
  deleteStandard,
  fetchStandards,
  searchStandards,
  selectStandards,
  selectStandardSearchResults,
  selectTestsLoading,
  selectTestsError,
  selectTestsSuccess,
  clearMessages,
} from "../../redux/tests/testsSlice";

const StandardsManagement = () => {
  const dispatch = useDispatch();

  const standards = useSelector(selectStandards);
  const searchResults = useSelector(selectStandardSearchResults);
  const loading = useSelector(selectTestsLoading);
  const error = useSelector(selectTestsError);
  const success = useSelector(selectTestsSuccess);

  const [mode, setMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    organization: "",
    year: "",
    is_active: true,
  });

  useEffect(() => {
    dispatch(fetchStandards({ page: 1, limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(searchStandards(searchTerm));
        setShowSearchDropdown(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowSearchDropdown(false);
    }
  }, [searchTerm, dispatch]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => dispatch(clearMessages()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStandardSelect = (standard) => {
    setSelectedStandard(standard);
    setSearchTerm(standard.code);
    setShowSearchDropdown(false);
    setMode("edit");
    setFormData({
      code: standard.code,
      title: standard.title,
      description: standard.description || "",
      organization: standard.organization || "",
      year: standard.year || "",
      is_active: standard.is_active,
    });
  };

  const resetForm = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      organization: "",
      year: "",
      is_active: true,
    });
    setSelectedStandard(null);
    setSearchTerm("");
    setMode("list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.title) {
      alert("لطفا کد و عنوان استاندارد را وارد کنید");
      return;
    }

    try {
      if (mode === "create") {
        await dispatch(createStandard(formData)).unwrap();
      } else if (mode === "edit") {
        await dispatch(
          updateStandard({
            standardId: selectedStandard.id,
            updates: formData,
          })
        ).unwrap();
      }

      resetForm();
      dispatch(fetchStandards({ page: 1, limit: 50 }));
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedStandard) return;

    if (
      window.confirm(
        `آیا از حذف استاندارد "${selectedStandard.code}" اطمینان دارید؟`
      )
    ) {
      try {
        await dispatch(deleteStandard(selectedStandard.id)).unwrap();
        resetForm();
        dispatch(fetchStandards({ page: 1, limit: 50 }));
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {mode === "list" && (
        <div className="flex gap-4">
          <button
            onClick={() => setMode("create")}
            className="flex items-center gap-2 px-6 py-3 bg-orange text-white rounded-lg hover:shadow-lg hover:shadow-orange/30 transition-all font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            افزودن استاندارد جدید
          </button>

          <div className="relative flex-1 max-w-md">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی استاندارد..."
              className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-white focus:ring-white"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {showSearchDropdown && searchResults.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-neutral-800 shadow-lg border border-white">
                {searchResults.map((standard) => (
                  <li
                    key={standard.id}
                    onClick={() => handleStandardSelect(standard)}
                    className="px-4 py-3 text-sm text-neutral-200 hover:bg-[#5271ff]/10 cursor-pointer border-b border-white last:border-0"
                  >
                    <div className="font-medium">{standard.code}</div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {standard.title}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {(mode === "create" || mode === "edit") && (
        <form
          onSubmit={handleSubmit}
          className="bg-black border border-white rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-neutral-100">
              {mode === "create" ? "افزودن استاندارد جدید" : "ویرایش استاندارد"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Code */}
            <div className="relative">
              <input
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder=""
                required
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.code ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                کد استاندارد *
              </label>
            </div>

            {/* Organization */}
            <div className="relative">
              <input
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder=""
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.organization ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                سازمان (مثلا ASTM, ISO)
              </label>
            </div>

            {/* Year */}
            <div className="relative">
              <input
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                placeholder=""
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.year ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                سال
              </label>
            </div>

            {/* Title */}
            <div className="relative md:col-span-2 lg:col-span-3">
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder=""
                required
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.title ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                عنوان استاندارد *
              </label>
            </div>

            {/* Description */}
            <div className="relative md:col-span-2 lg:col-span-3">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder=""
                rows="3"
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.description ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                توضیحات
              </label>
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-5 h-5"
              />
              <label className="text-sm text-white">فعال</label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white">
            {mode === "edit" && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 bg-red-900/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-900/30 transition-colors font-medium"
              >
                حذف
              </button>
            )}
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-darkOrange text-neutral-200 rounded-lg font-medium"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-pink text-white rounded-lg hover:shadow-lg font-medium disabled:opacity-50"
            >
              {loading
                ? "در حال پردازش..."
                : mode === "create"
                  ? "افزودن"
                  : "بروزرسانی"}
            </button>
          </div>
        </form>
      )}

      {mode === "list" && standards.length > 0 && (
        <div className="bg-black border border-orange/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black border-b border-white">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    کد
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    عنوان
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    سازمان
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    سال
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    وضعیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700/50">
                {standards.map((standard) => (
                  <tr
                    key={standard.id}
                    className="hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {standard.code}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {standard.title}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {standard.organization || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {standard.year || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${standard.is_active ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}
                      >
                        {standard.is_active ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStandardSelect(standard)}
                        className="text-pink text-sm font-medium"
                      >
                        ویرایش
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardsManagement;
