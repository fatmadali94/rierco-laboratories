import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoiceById,
  clearSelectedInvoice,
} from "../../redux/financialInvoice/financialInvoicesSlice.js";
import {
  XMarkIcon,
  PrinterIcon,
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  BanknotesIcon,
  PhotoIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useReactToPrint } from "react-to-print";

const InvoiceDetailModal = ({ invoiceId, onClose }) => {
  const dispatch = useDispatch();
  const { selectedInvoice, loading } = useSelector(
    (state) => state.financialInvoices
  );
  const printRef = useRef();

  useEffect(() => {
    if (invoiceId) {
      dispatch(fetchInvoiceById(invoiceId));
    }

    return () => {
      dispatch(clearSelectedInvoice());
    };
  }, [dispatch, invoiceId]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice_${selectedInvoice?.invoice_number}`,
  });

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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-4 text-slate-600 font-medium">
              بارگذاری فاکتور...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedInvoice) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">جزئیات فاکتور</h2>
              <p className="text-indigo-100 text-sm mt-1">
                {selectedInvoice.invoice_number}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200 shadow-lg flex items-center gap-2 font-medium"
            >
              <PrinterIcon className="w-5 h-5" />
              پرینت
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div ref={printRef} className="print:p-8">
            {/* Invoice Status Banner */}
            <div className="mb-8 flex items-center justify-between">
              <div
                className={`inline-flex items-center px-6 py-3 rounded-xl text-lg font-bold border-2 ${getPaymentStateColor(
                  selectedInvoice.payment_state
                )}`}
              >
                {getPaymentStateLabel(selectedInvoice.payment_state)}
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 font-medium">
                  تاریخ فاکتور
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {new Date(selectedInvoice.invoice_date).toLocaleDateString(
                    "fa-IR"
                  )}
                </p>
              </div>
            </div>

            {/* Customer & Orderer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Customer Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    اطلاعات مشتری حقوقی
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                      نام کمپانی
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {selectedInvoice.customer_name || "-"}
                    </p>
                  </div>
                  {selectedInvoice.company_email && (
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4 text-slate-500" />
                      <p className="text-sm text-slate-700">
                        {selectedInvoice.company_email}
                      </p>
                    </div>
                  )}
                  {selectedInvoice.company_phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 text-slate-500" />
                      <p className="text-sm text-slate-700">
                        {selectedInvoice.company_phone}
                      </p>
                    </div>
                  )}
                  {selectedInvoice.customer_address && (
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="w-4 h-4 text-slate-500 mt-0.5" />
                      <p className="text-sm text-slate-700">
                        {selectedInvoice.customer_address}
                      </p>
                    </div>
                  )}
                  {selectedInvoice.tax_id && (
                    <div>
                      <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                        شناسه ملی
                      </p>
                      <p className="text-sm font-mono text-slate-900 mt-1">
                        {selectedInvoice.tax_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Orderer Info */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    اطلاعات متقاضی حقیقی
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                      نام
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {selectedInvoice.orderer_name || "-"}
                    </p>
                  </div>
                  {selectedInvoice.orderer_email && (
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4 text-slate-500" />
                      <p className="text-sm text-slate-700">
                        {selectedInvoice.orderer_email}
                      </p>
                    </div>
                  )}
                  {selectedInvoice.orderer_mobile && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 text-slate-500" />
                      <p className="text-sm text-slate-700">
                        {selectedInvoice.orderer_mobile}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-slate-600" />
                جزئیات فاکتور
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                    تاریخ سررسید
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {selectedInvoice.due_date}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                    مقدار کل
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {selectedInvoice.total_amount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                    مقدار پرداخت شده
                  </p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">
                    {selectedInvoice.amount_paid}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                    مقدار مانده
                  </p>
                  <p className="text-sm font-bold text-rose-600 mt-1">
                    {selectedInvoice.amount_remaining}
                  </p>
                </div>
              </div>
            </div>

            {/* Records */}
            {selectedInvoice.records && selectedInvoice.records.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-6 h-6 text-slate-600" />
                  رکوردهای فاکتور ({selectedInvoice.records.length})
                </h3>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">
                            رکورد #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">
                            نمونه
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">
                            تست
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">
                            استاندارد
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">
                            وضعیت
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedInvoice.records.map((record, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                              {record.record_number}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {record.sample_name || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              <div>{record.test_title || "-"}</div>
                              <div className="text-xs text-slate-500">
                                {record.test_code}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {record.standard_code || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {record.record_state || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Payments */}
            {selectedInvoice.payments &&
              selectedInvoice.payments.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BanknotesIcon className="w-6 h-6 text-slate-600" />
                    تاریخچه پرداخت ({selectedInvoice.payments.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedInvoice.payments.map((payment, index) => (
                      <div
                        key={payment.id}
                        className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                              پرداخت #{index + 1}
                            </p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">
                              {payment.amount}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                              تاریخ پرداخت
                            </p>
                            <p className="text-sm font-bold text-slate-900 mt-1">
                              {new Date(
                                payment.payment_date
                              ).toLocaleDateString("fa-IR")}
                            </p>
                          </div>
                        </div>

                        {/* Payment Method */}
                        {payment.payment_method && (
                          <div className="mb-4">
                            <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                              روش پرداخت
                            </p>
                            <p className="text-sm text-slate-900 mt-1 capitalize">
                              {payment.payment_method}
                            </p>
                          </div>
                        )}

                        {/* Payment Reference */}
                        {payment.reference_number && (
                          <div className="mb-4">
                            <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                              شماره پیگیری
                            </p>
                            <p className="text-sm font-mono text-slate-900 mt-1">
                              {payment.reference_number}
                            </p>
                          </div>
                        )}

                        {/* Payment Notes */}
                        {payment.notes && (
                          <div className="mb-4">
                            <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                              نت‌ها
                            </p>
                            <p className="text-sm text-slate-700 mt-1">
                              {payment.notes}
                            </p>
                          </div>
                        )}

                        {/* Payment Image Preview */}
                        {payment.payment_image && (
                          <div>
                            <p className="text-xs text-slate-600 font-medium uppercase tracking-wide mb-3">
                              مدرک پرداخت
                            </p>
                            <div className="relative group">
                              <img
                                src={payment.payment_image}
                                alt="Payment proof"
                                className="w-full max-w-md rounded-lg border-2 border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                                onClick={() =>
                                  window.open(payment.payment_image, "_blank")
                                }
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg flex items-center justify-center">
                                <PhotoIcon className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                              <button
                                onClick={() =>
                                  window.open(payment.payment_image, "_blank")
                                }
                                className="absolute top-3 right-3 px-3 py-1.5 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg text-xs font-medium text-slate-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              >
                                نمایش تمام صفحه
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Notes */}
            {selectedInvoice.notes && (
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  نت‌های فاکتور
                </h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {selectedInvoice.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
