import React, { useEffect, useState } from "react";
import UserInfoCard from "../components/UserInfoCard.jsx";
import { SiHomeadvisor } from "react-icons/si";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoices,
  setFilters,
  resetFilters,
  setPage,
} from "../redux/financialInvoice/financialInvoicesSlice.js";
import InvoiceDetailModal from "../components/financialInvoices/InvoiceDetailModal";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BanknotesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  convertJalaliToGregorian,
  convertGregorianToJalali,
} from "../utils/dateHelpers.js";

const FinancialInvoicesPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { invoices, pagination, filters, loading, error } = useSelector(
    (state) => state.financialInvoices,
  );
  console.log(invoices);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    dispatch(fetchInvoices(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    dispatch(setFilters({ ...localFilters, page: 1 }));
    setShowFilters(false);
  };

  const clearFilters = () => {
    dispatch(resetFilters());
    setLocalFilters({
      page: 1,
      limit: 20,
      payment_state: "",
      customer_name: "",
      orderer_name: "",
      date_from: "",
      date_to: "",
      due_date_from: "",
      due_date_to: "",
      invoice_number: "",
    });
    setShowFilters(false);
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const getPaymentStateColor = (state) => {
    switch (state) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "partial":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "unpaid":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPaymentStateLabel = (state) => {
    switch (state) {
      case "paid":
        return "پرداخت شده";
      case "partial":
        return "پرداخت جزئی";
      case "unpaid":
        return "پرداخت نشده";
      default:
        return state;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0";

    return new Intl.NumberFormat("fa-IR", {
      style: "decimal", // Changed from "currency"
      minimumFractionDigits: 0, // No decimals
      maximumFractionDigits: 0, // No decimals
    }).format(amount);
  };
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      key !== "page" &&
      key !== "limit" &&
      value !== null &&
      value !== undefined &&
      value !== "",
  ).length;

  return (
    <div className="bg-bg min-h-[100dvh] relative p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
      {/* Header */}

      <header className="mb-4 sm:mb-6 mx-auto">
        <div className="grid grid-cols-3 items-center justify-evenly">
          {/* LEFT COLUMN - Link and time info */}
          <div className="flex grid-cols-1 ">
            <Link
              to="/Homepage"
              className="text-5xl text-pink"
              title="بازگشت به خانه"
            >
              <SiHomeadvisor />
            </Link>
          </div>

          {/* CENTER COLUMN - Title */}
          <div className="flex grid-cols-2">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-shadow-triple-stroke text-center">
              امور مالی
            </h1>
          </div>

          {/* RIGHT COLUMN - User Info */}
          <div className="flex grid-cols-3">
            <UserInfoCard user={user} />
          </div>
        </div>
      </header>
      <hr className="w-full h-0.5 bg-black mb-10"></hr>
      <div className="flex w-max-20 justify-center items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="relative inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <FunnelIcon className="w-5 h-5" />
          فیلترها
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-slate-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 text-right md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  شماره فاکتور
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="...جستوجوی شماره فاکتور"
                    value={localFilters.invoice_number}
                    onChange={(e) =>
                      handleFilterChange("invoice_number", e.target.value)
                    }
                    className="w-full pl-10 text-right pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Payment State */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  وضعیت پرداخت
                </label>
                <div className="relative">
                  <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={localFilters.payment_state}
                    onChange={(e) =>
                      handleFilterChange("payment_state", e.target.value)
                    }
                    className="w-full pl-10 text-right pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none bg-white"
                  >
                    <option value="">همه وضعیت‌ها</option>
                    <option value="paid">پرداخت شده</option>
                    <option value="partial">پرداختی جزئی</option>
                    <option value="unpaid">پرداخت نشده</option>
                  </select>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  نام مشتری حقوقی
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="..."
                    value={localFilters.customer_name}
                    onChange={(e) =>
                      handleFilterChange("customer_name", e.target.value)
                    }
                    className="w-full pl-10 text-right pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Orderer Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  نام متفاضی حقیقی
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="..."
                    value={localFilters.orderer_name}
                    onChange={(e) =>
                      handleFilterChange("orderer_name", e.target.value)
                    }
                    className="w-full pl-10 text-right pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Invoice Date From */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  تاریخ فاکتور از
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    value={localFilters.date_from}
                    onChange={(e) =>
                      handleFilterChange("date_from", e.target.value)
                    }
                    className="w-full pl-10 text-right pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Invoice Date To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  تاریخ سر رسید
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    value={localFilters.date_to}
                    onChange={(e) =>
                      handleFilterChange("date_to", e.target.value)
                    }
                    className="w-full pl-10 text-right pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Due Date From */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  تاریخ سررسید از
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    value={localFilters.due_date_from}
                    onChange={(e) =>
                      handleFilterChange("due_date_from", e.target.value)
                    }
                    className="w-full pl-10 text-right pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Due Date To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  تاریخ سر رسید تا
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    value={localFilters.due_date_to}
                    onChange={(e) =>
                      handleFilterChange("due_date_to", e.target.value)
                    }
                    className="w-full pl-10 text-right pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={applyFilters}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                ثبت فیلترها
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200 font-medium"
              >
                پاک سازی فیلترها
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  تمامی فاکتورها
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {pagination.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">صفحه کنونی</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {pagination.page} / {pagination.totalPages}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  فیلترهای فعال
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {activeFilterCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FunnelIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">در صفحه</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {invoices.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <BanknotesIcon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-4 text-slate-600 font-medium">
              بارگذاری فاکتورها ...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 mb-6">
            <p className="text-rose-800 font-medium">{error}</p>
          </div>
        )}

        {/* Invoices Table */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      فاکتور #
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      مشتری حقوقی
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      متقاضی حقیقی
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      تاریخ فاکتور
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      تاریخ پرداخت
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      مقدار(تومان)
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      وضعیت
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      رکوردها
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        <DocumentTextIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <p className="font-medium">فاکتوری یافت نشد</p>
                        <p className="text-sm mt-1">
                          فیلترهای مد نظر را فعال کنید
                        </p>
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        onClick={() => setSelectedInvoiceId(invoice.id)}
                        className="hover:bg-indigo-50 cursor-pointer transition-all duration-150 group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                              <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-slate-900">
                                {invoice.invoice_number}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">
                            {invoice.customer_name || "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {invoice.company_email || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">
                            {invoice.orderer_name || "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {invoice.orderer_mobile || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {new Date(invoice.invoice_date).toLocaleDateString(
                            "fa-IR",
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {new Date(invoice.payment_date).toLocaleDateString(
                            "fa-IR",
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-slate-900">
                            {formatCurrency(invoice.total_amount)}
                          </div>
                          {invoice.payment_state === "partial" && (
                            <div className="text-xs text-slate-500">
                              پرداخت شده:{" "}
                              {formatCurrency(invoice.amount_paid)}{" "}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getPaymentStateColor(
                              invoice.payment_state,
                            )}`}
                          >
                            {getPaymentStateLabel(invoice.payment_state)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {invoice.total_records || 0} تا
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    نشان دادن{" "}
                    <span className="font-medium text-slate-900">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    به{" "}
                    <span className="font-medium text-slate-900">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total,
                      )}
                    </span>{" "}
                    از{" "}
                    <span className="font-medium text-slate-900">
                      {pagination.total}
                    </span>{" "}
                    نتایج
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="flex items-center gap-1">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === pagination.totalPages ||
                          (pageNum >= pagination.page - 1 &&
                            pageNum <= pagination.page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                pageNum === pagination.page
                                  ? "bg-indigo-600 text-white shadow-md"
                                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === pagination.page - 2 ||
                          pageNum === pagination.page + 2
                        ) {
                          return (
                            <span key={pageNum} className="px-2 text-slate-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRightIcon className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoiceId && (
        <InvoiceDetailModal
          invoiceId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  );
};

export default FinancialInvoicesPage;
