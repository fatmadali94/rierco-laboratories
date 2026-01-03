// src/components/dataManagement/CustomersManagement.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  fetchCustomers,
  searchCustomers,
  selectCustomers,
  selectCustomerSearchResults,
  selectCustomersLoading,
  selectCustomersError,
  selectCustomersSuccess,
  clearMessages,
} from "../../redux/customers/customersSlice";

const CustomersManagement = () => {
  const dispatch = useDispatch();

  const customers = useSelector(selectCustomers);
  const searchResults = useSelector(selectCustomerSearchResults);
  const loading = useSelector(selectCustomersLoading);
  const error = useSelector(selectCustomersError);
  const success = useSelector(selectCustomersSuccess);

  const [mode, setMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    company_email: "",
    company_phone: "",
    address: "",
    tax_id: "",
  });

  useEffect(() => {
    dispatch(fetchCustomers({ page: 1, limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(searchCustomers(searchTerm));
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.name);
    setShowSearchDropdown(false);
    setMode("edit");
    setFormData({
      name: customer.name,
      company_email: customer.company_email || "",
      company_phone: customer.company_phone || "",
      address: customer.address || "",
      tax_id: customer.tax_id || "",
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      company_email: "",
      company_phone: "",
      address: "",
      tax_id: "",
    });
    setSelectedCustomer(null);
    setSearchTerm("");
    setMode("list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert("لطفا نام مشتری را وارد کنید");
      return;
    }

    try {
      if (mode === "create") {
        await dispatch(createCustomer(formData)).unwrap();
      } else if (mode === "edit") {
        await dispatch(
          updateCustomer({
            customerId: selectedCustomer.id,
            updates: formData,
          })
        ).unwrap();
      }

      resetForm();
      dispatch(fetchCustomers({ page: 1, limit: 50 }));
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;

    if (
      window.confirm(
        `آیا از حذف مشتری "${selectedCustomer.name}" اطمینان دارید؟`
      )
    ) {
      try {
        await dispatch(deleteCustomer(selectedCustomer.id)).unwrap();
        resetForm();
        dispatch(fetchCustomers({ page: 1, limit: 50 }));
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
            className="flex items-center gap-2 px-6 py-3 bg-orange text-white rounded-lg hover:shadow-lg hover:shadow-[#5271ff]/30 transition-all font-medium"
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
            افزودن مشتری جدید
          </button>

          <div className="relative flex-1 max-w-md">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی مشتری..."
              className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white"
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
              <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-black border border-white">
                {searchResults.map((customer) => (
                  <li
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className="px-4 py-3 text-sm text-white hover:bg-[#5271ff]/10 cursor-pointer border-b border-white last:border-0"
                  >
                    <div className="font-medium">{customer.name}</div>
                    {customer.company_email && (
                      <div className="text-xs text-white mt-1">
                        {customer.company_email}
                      </div>
                    )}
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
            <h3 className="text-xl font-semibold text-orange">
              {mode === "create" ? "افزودن مشتری جدید" : "ویرایش مشتری"}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="relative md:col-span-2">
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder=""
                required
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.name ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                نام شرکت / مشتری *
              </label>
            </div>

            {/* Company Email */}
            <div className="relative">
              <input
                name="company_email"
                type="email"
                value={formData.company_email}
                onChange={handleInputChange}
                placeholder=""
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.name ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0 "}`}
              >
                ایمیل شرکت
              </label>
            </div>

            {/* Company Phone */}
            <div className="relative">
              <input
                name="company_phone"
                value={formData.company_phone}
                onChange={handleInputChange}
                placeholder=""
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.company_phone ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs "}`}
              >
                تلفن شرکت
              </label>
            </div>

            {/* Address */}
            <div className="relative md:col-span-2">
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder=""
                rows="3"
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none  ${formData.address ? "top-2 text-xs" : "top-4 peer-focus:top-2 peer-focus:text-xs "}`}
              >
                آدرس
              </label>
            </div>

            {/* Tax ID */}
            <div className="relative md:col-span-2">
              <input
                name="tax_id"
                value={formData.tax_id}
                onChange={handleInputChange}
                placeholder=""
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none  ${formData.tax_id ? "top-0 -translate-y-1/2 text-xs" : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"}`}
              >
                شناسه ملی / کد اقتصادی
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-neutral-700/50">
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

      {mode === "list" && customers.length > 0 && (
        <div className="bg-black border border-orange/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black border-b border-white">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    نام
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    ایمیل
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    تلفن
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700/50">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-black transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {customer.company_email || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {customer.company_phone || "-"}
                    </td>
                    <td className="px-6 py-4 ">
                      <button
                        onClick={() => handleCustomerSelect(customer)}
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

export default CustomersManagement;
