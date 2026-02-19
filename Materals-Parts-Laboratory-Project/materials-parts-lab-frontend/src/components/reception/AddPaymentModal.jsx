import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  addPayment,
  fetchPaymentsByInvoice,
} from "../../redux/payments/paymentsSlice";
import { fetchInvoices } from "../../redux/invoices/invoicesSlice";
import {
  convertJalaliToGregorian,
  convertGregorianToJalali,
} from "../../utils/dateHelpers";

const AddPaymentModal = ({ invoice, onClose }) => {
  const dispatch = useDispatch();

  const getTodayJalaliAsGregorian = () => {
    const today = new Date().toISOString().split("T")[0];
    const jalali = convertGregorianToJalali(today);
    return convertJalaliToGregorian(jalali);
  };
  // Function to get current Shamsi date
  const getCurrentShamsiDate = () => {
    const today = new Date();
    const todayISO = today.toISOString().split("T")[0]; // Get YYYY-MM-DD format
    return convertGregorianToJalali(todayISO);
  };

  //with no decimals
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0";

    return new Intl.NumberFormat("fa-IR", {
      style: "decimal", // Changed from "currency"
      minimumFractionDigits: 0, // No decimals
      maximumFractionDigits: 0, // No decimals
    }).format(amount);
  };

  const [formData, setFormData] = useState({
    amount: invoice.amount_remaining,
    payment_method: "card",
    payment_reference: "",
    payment_date: getTodayJalaliAsGregorian(),
    notes: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Handle field change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getDisplayDate = () => {
    if (formData.payment_date) {
      return convertGregorianToJalali(formData.payment_date); // Convert to Shamsi
    }
    return getCurrentShamsiDate(); // Fallback to today
  };

  const handleDateChange = (shamsiDate) => {
    const gregorianDate = convertJalaliToGregorian(shamsiDate);

    setFormData((prev) => ({
      ...prev,
      payment_date: gregorianDate, // Store Gregorian
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove file
  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== FRONTEND ===");
    console.log("formData:", formData);
    console.log("payment_method:", formData.payment_method);
    console.log("payment_method type:", typeof formData.payment_method);
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("لطفاً مبلغ پرداخت را وارد کنید");
      return;
    }

    try {
      await dispatch(
        addPayment({
          invoiceId: invoice.id,
          paymentData: formData,
          files: selectedFiles,
        }),
      ).unwrap();

      // Refresh data
      dispatch(fetchPaymentsByInvoice(invoice.id));
      dispatch(fetchInvoices());

      alert("پرداخت با موفقیت ثبت شد");
      onClose();
    } catch (error) {
      alert(error || "خطا در ثبت پرداخت");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-black border border-yellow rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 flex items-center justify-between sticky top-0 bg-black z-10">
          <h3 className="text-xl font-semibold text-neutral-100">
            ثبت پرداخت - {invoice.invoice_number}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm text-right text-neutral-300 mb-2">
              مبلغ پرداخت () *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={invoice.amount_remaining}
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              className="w-full h-11 px-3 bg-black border border-yellow rounded text-sm text-white"
              required
            />
            <div className="text-xs text-neutral-500 mt-1">
              مانده: {formatCurrency(invoice.amount_remaining)} ریال
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm text-right text-neutral-300 mb-2">
              روش پرداخت
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => handleChange("payment_method", e.target.value)}
              className="w-full h-11 px-3 bg-black border border-white rounded text-sm text-neutral-200"
            >
              <option value="cash">نقدی</option>
              <option value="card">کارت به کارت</option>
              <option value="check">چک</option>
              <option value="transfer">حواله بانکی</option>
              <option value="pos">دستگاه کارتخوان</option>
              <option value="other">سایر</option>
            </select>
          </div>

          {/* Payment Reference */}
          <div>
            <label className="block text-sm text-right text-neutral-300 mb-2">
              شماره پیگیری / شماره چک
            </label>
            <input
              type="text"
              value={formData.payment_reference}
              onChange={(e) =>
                handleChange("payment_reference", e.target.value)
              }
              className="w-full h-11 px-3 bg-black border border-white rounded text-sm text-neutral-200"
            />
          </div>
          {/* Payment Date */}
          <div>
            <label className="block text-sm text-right text-neutral-300 mb-2">
              تاریخ پرداخت
            </label>
            <input
              type="text"
              value={getDisplayDate()} // ✅ Shows: "1404/09/19"
              onChange={(e) => {
                // User types Shamsi date
                handleDateChange(e.target.value);
              }}
              className="w-full h-11 px-3 bg-black border border-white rounded text-sm text-neutral-200"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm text-right text-neutral-300 mb-2">
              تصاویر رسید
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full h-11 px-3 bg-black border border-yellow rounded text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-darkOrange file:text-white"
            />

            {/* Image Previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-yellow"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-right text-neutral-300 mb-2">
              یادداشت
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows="3"
              className="w-full h-22 px-3 bg-black border border-white rounded text-sm text-neutral-200"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pink border border-black text-white hover:border hover:border-white rounded"
            >
              ثبت پرداخت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;
