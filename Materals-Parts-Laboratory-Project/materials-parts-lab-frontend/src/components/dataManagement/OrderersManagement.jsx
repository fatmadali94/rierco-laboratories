// src/components/dataManagement/OrderersManagement.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createOrderer,
  updateOrderer,
  deleteOrderer,
  searchOrderers,
  fetchOrderers,
  fetchCustomers,
  selectOrdererSearchResults,
  selectOrderers,
  selectCustomerSearchResults,
  selectCustomers,
  selectCustomersLoading,
  selectCustomersError,
  selectCustomersSuccess,
  clearMessages,
  clearSearchResults as clearCustomerSearch,
  searchCustomers,
} from "../../redux/customers/customersSlice";

const OrderersManagement = () => {
  const dispatch = useDispatch();

  const searchResults = useSelector(selectOrdererSearchResults);
  const orderers = useSelector(selectOrderers);
  const customers = useSelector(selectCustomers);
  const loading = useSelector(selectCustomersLoading);
  const error = useSelector(selectCustomersError);
  const success = useSelector(selectCustomersSuccess);
  const customerSearchResults = useSelector(selectCustomerSearchResults);

  const [mode, setMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedOrderer, setSelectedOrderer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [formData, setFormData] = useState({
    customerSearch: "",
    customerName: "",
    customerId: null,
    full_name: "",
    mobile: "",
    email: "",
    national_id: "",
  });

  useEffect(() => {
    dispatch(fetchOrderers({ page: 1, limit: 50 }));
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    if (formData.customerSearch.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(searchCustomers(formData.customerSearch));
        setShowCustomerDropdown(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      dispatch(clearCustomerSearch());
      setShowCustomerDropdown(false);
    }
  }, [formData.customerSearch, dispatch]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(searchOrderers(searchTerm));
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
    setFormData((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerSearch: customer.name,
    }));
    console.log(customer);
    setShowCustomerDropdown(false);
    dispatch(clearCustomerSearch());
  };

  const handleOrdererSelect = (orderer) => {
    setSelectedOrderer(orderer);
    setSearchTerm(orderer.full_name);
    setShowSearchDropdown(false);
    setMode("edit");
    setFormData({
      orderer_id: orderer.orderer_id?.toString() || "",
      full_name: orderer.full_name,
      mobile: orderer.mobile || "",
      email: orderer.email || "",
      national_id: orderer.national_id || "",
    });
  };

  const resetForm = () => {
    setFormData({
      customerId: null,
      customerSearch: "",
      customerName: "",
      orderer_id: "",
      full_name: "",
      mobile: "",
      email: "",
      national_id: "",
    });
    setSelectedOrderer(null);
    setSearchTerm("");
    setMode("list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name) {
      alert("لطفا نام متقاضی را وارد کنید");
      return;
    }

    const ordererData = {
      ...formData,
      customer: formData.customerId
        ? { id: formData.customerId }
        : formData.customerSearch
          ? {
              name: formData.customerName || formData.customerSearch,
              company_email: formData.companyEmail,
              company_phone: formData.companyPhone,
              address: formData.address,
              tax_id: formData.taxId,
            }
          : null,
      orderer_id: formData.orderer_id ? parseInt(formData.orderer_id) : null,
    };
    console.log(ordererData);
    try {
      if (mode === "create") {
        await dispatch(createOrderer(ordererData)).unwrap();
      } else if (mode === "edit") {
        await dispatch(
          updateOrderer({
            ordererId: selectedOrderer.id,
            updates: ordererData,
          })
        ).unwrap();
      }

      resetForm();
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrderer) return;

    if (
      window.confirm(
        `آیا از حذف متقاضی "${selectedOrderer.full_name}" اطمینان دارید؟`
      )
    ) {
      try {
        await dispatch(deleteOrderer(selectedOrderer.id)).unwrap();
        resetForm();
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
            افزودن متقاضی جدید
          </button>

          <div className="relative flex-1 max-w-md">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی متقاضی..."
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
                {searchResults.map((orderer) => (
                  <li
                    key={orderer.id}
                    onClick={() => handleOrdererSelect(orderer)}
                    className="px-4 py-3 text-sm text-white hover:bg-[#5271ff]/10 cursor-pointer border-b border-white last:border-0"
                  >
                    <div className="font-medium">{orderer.full_name}</div>
                    {orderer.mobile && (
                      <div className="text-xs text-white mt-1">
                        {orderer.mobile}
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
              {mode === "create" ? "افزودن متقاضی جدید" : "ویرایش متقاضی"}
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
            {/* Full Name */}
            <div className="relative md:col-span-2">
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder=""
                required
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.full_name ? "top-0 -translate-y-1/2 text-xs text-white" : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"}`}
              >
                نام و نام خانوادگی *
              </label>
            </div>

            {/* customer_id Selection */}
            <div className="relative md:col-span-2">
              <input
                name="customerSearch"
                value={formData.customerSearch}
                onChange={handleInputChange}
                onClick={(e) => e.stopPropagation()}
                placeholder=""
                autoComplete="off"
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.customerSearch ? "top-0 -translate-y-1/2 text-xs text-white" : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"}`}
              >
                جستجوی مشتری مرتبط
              </label>
              {showCustomerDropdown && customerSearchResults.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-neutral-800 shadow-lg border border-[#5271ff]/20">
                  {customerSearchResults.map((customer) => (
                    <li
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="px-4 py-3 text-sm text-neutral-200 hover:bg-[#5271ff]/10 cursor-pointer border-b border-neutral-700/50 last:border-0"
                    >
                      <div className="font-medium">{customer.name}</div>
                      {customer.company_email && (
                        <div className="text-xs text-neutral-400 mt-1">
                          {customer.company_email}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Mobile */}
            <div className="relative">
              <input
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder=""
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.mobile ? "top-0 -translate-y-1/2 text-xs text-white" : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"}`}
              >
                موبایل
              </label>
            </div>

            {/* Email */}
            <div className="relative">
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder=""
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.email ? "top-0 -translate-y-1/2 text-xs text-white" : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"}`}
              >
                ایمیل
              </label>
            </div>

            {/* National ID */}
            <div className="relative md:col-span-2">
              <input
                name="national_id"
                value={formData.national_id}
                onChange={handleInputChange}
                placeholder=""
                className="peer w-full h-12 p-3 bg-black border border-pink/20 rounded text-sm text-white placeholder-transparent focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.national_id ? "top-0 -translate-y-1/2 text-xs text-white" : "top-1/2 -translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs"}`}
              >
                کد ملی
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

      {mode === "list" && orderers.length > 0 && (
        <div className="bg-black border border-orange/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black border-b border-white">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    نام
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    موبایل
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    ایمیل
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    مشتری حقوقی
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700/50">
                {orderers.map((orderer) => (
                  <tr
                    key={orderer.id}
                    className="hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {orderer.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {orderer.mobile || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {orderer.email || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {orderer.customer_name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOrdererSelect(orderer)}
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

      {mode === "list" && searchResults.length === 0 && searchTerm && (
        <div className="bg-black border border-white rounded-lg overflow-hidden">
          <svg
            className="mx-auto h-12 w-12 text-neutral-500"
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
          <h3 className="mt-2 text-sm font-medium text-neutral-300">
            نتیجه‌ای یافت نشد
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            لطفا جستجوی دیگری امتحان کنید
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderersManagement;
