// src/components/reception/InvoicesList_v3.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddPaymentModal from "./AddPaymentModal";
import {
  fetchInvoices,
  updateInvoice,
  searchInvoices,
  createInvoice,
  finalizeInvoice,
  selectInvoices,
  selectSearchResults as selectInvoiceSearchResults,
  selectPagination,
  selectInvoicesLoading,
  deleteInvoice,
  clearMessages,
} from "../../redux/invoices/invoicesSlice";
import {
  searchCustomers,
  selectCustomerSearchResults,
  clearSearchResults as clearCustomerSearch,
  searchOrderers,
  selectOrdererSearchResults,
} from "../../redux/customers/customersSlice";
import {
  fetchRecordById,
  fetchRecordsByCustomer,
  fetchRecordsByOrderer,
  searchRecords,
  selectRecords,
  selectSearchResults as selectRecordSearchResults,
} from "../../redux/records/recordsSlice";
import {
  convertJalaliToGregorian,
  convertGregorianToJalali,
} from "../../utils/dateHelpers";

const InvoicesList = () => {
  const dispatch = useDispatch();

  const invoices = useSelector(selectInvoices);
  const invoiceSearchResults = useSelector(selectInvoiceSearchResults);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectInvoicesLoading);
  const customerSearchResults = useSelector(selectCustomerSearchResults);
  const ordererSearchResults = useSelector(selectOrdererSearchResults);
  const recordSearchResults = useSelector(selectRecordSearchResults);
  const allRecords = useSelector(selectRecords);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    payment_state: "",
    page: 1,
    limit: 20,
  });

  // Create Invoice Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchMode, setSearchMode] = useState("customer"); // 'customer', 'orderer', 'record'
  const [selectedEntity, setSelectedEntity] = useState(null); // Customer, Orderer, or null
  const [customerSearch, setCustomerSearch] = useState("");
  const [ordererSearch, setOrdererSearch] = useState("");
  const [recordSearch, setRecordSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showOrdererDropdown, setShowOrdererDropdown] = useState(false);
  const [showRecordDropdown, setShowRecordDropdown] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedRecordObjects, setSelectedRecordObjects] = useState([]);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    tax_rate: 10,
    discount_amount: 0,
    invoice_additional_charges: 0,
    invoice_date: convertGregorianToJalali(new Date().toISOString()),
    notes: "",
  });
  const [editForm, setEditForm] = useState({
    tax_rate: 0,
    discount_amount: 0,
    invoice_additional_charges: 0,
    due_date: "",
    payment_date: "",
    notes: "",
    terms_and_conditions: "",
    payment_state: "",
  });
  const expandedInvoice = invoices.find((inv) => inv.id === expandedInvoiceId);

  // Load invoices
  useEffect(() => {
    if (!searchTerm) {
      dispatch(fetchInvoices(filters));
    }
  }, [dispatch, filters, searchTerm]);

  // Search invoices
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(searchInvoices(searchTerm));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, dispatch]);

  // Customer search in modal
  useEffect(() => {
    if (
      searchMode === "customer" &&
      customerSearch.length >= 2 &&
      !selectedEntity
    ) {
      const timer = setTimeout(() => {
        dispatch(searchCustomers(customerSearch));
        setShowCustomerDropdown(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowCustomerDropdown(false);
    }
  }, [customerSearch, searchMode, dispatch, selectedEntity]);

  // Orderer search in modal
  useEffect(() => {
    if (
      searchMode === "orderer" &&
      ordererSearch.length >= 2 &&
      !selectedEntity
    ) {
      const timer = setTimeout(() => {
        dispatch(searchOrderers(ordererSearch));
        setShowOrdererDropdown(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowOrdererDropdown(false);
    }
  }, [ordererSearch, searchMode, dispatch, selectedEntity]);

  // Record search in modal
  useEffect(() => {
    if (searchMode === "record" && recordSearch.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(
          searchRecords({
            searchTerm: recordSearch,
            state: "",
          })
        );
        setShowRecordDropdown(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowRecordDropdown(false);
    }
  }, [recordSearch, searchMode, dispatch]); // Remove selectedRecords from condition

  // Load records when entity selected
  useEffect(() => {
    if (selectedEntity) {
      if (searchMode === "customer" && selectedEntity.id) {
        dispatch(
          fetchRecordsByCustomer({
            customerName: selectedEntity.id,
            state: "",
          })
        );
      } else if (searchMode === "orderer" && selectedEntity.id) {
        dispatch(
          fetchRecordsByOrderer({
            ordererName: selectedEntity.id,
            state: "",
          })
        );
      }
    } else if (searchMode === "record" && selectedRecords.length > 0) {
    }
  }, [selectedEntity, searchMode, selectedRecords, dispatch]);

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

  const handleCustomerSelect = (customer) => {
    setSelectedEntity(customer);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
    setSelectedRecords([]);
  };

  const handleOrdererSelect = (orderer) => {
    setSelectedEntity(orderer);
    setOrdererSearch(orderer.full_name);
    setShowOrdererDropdown(false);
    setSelectedRecords([]);
  };

  const handleRecordSelect = (record) => {
    if (!selectedRecords.includes(record.id)) {
      setSelectedRecords([...selectedRecords, record.id]);
      setSelectedRecordObjects([...selectedRecordObjects, record]); // Store full object
    }
    setRecordSearch("");
  };

  const handleCreateInvoice = async () => {
    if (selectedRecords.length === 0) {
      alert("لطفا حداقل یک رکورد انتخاب کنید");
      return;
    }

    try {
      await dispatch(
        createInvoice({
          record_ids: selectedRecords,
          tax_rate: parseFloat(invoiceForm.tax_rate),
          discount_amount: parseFloat(invoiceForm.discount_amount),
          invoice_additional_charges: parseFloat(
            invoiceForm.invoice_additional_charges
          ),
          invoice_date: invoiceForm.invoice_date
            ? getTodayJalaliAsGregorian(invoiceForm.invoice_date)
            : null,
          notes: invoiceForm.notes || null,
        })
      ).unwrap();

      // Reset and close modal
      resetModal();

      // Reload invoices
      dispatch(fetchInvoices(filters));
    } catch (err) {
      console.error("Failed to create invoice:", err);
      alert(err.message || "خطا در ایجاد فاکتور");
    }
  };

  const loadEditForm = (invoice) => {
    setEditForm({
      tax_rate: invoice.tax_rate || 0,
      discount_amount: invoice.discount_amount || 0,
      invoice_additional_charges: invoice.invoice_additional_charges || 0,
      due_date: invoice.due_date
        ? convertGregorianToJalali(invoice.due_date)
        : getCurrentShamsiDate(),
      payment_date: invoice.payment_date
        ? invoice.payment_date.split("T")[0]
        : "",
      notes: invoice.notes || "",
      terms_and_conditions: invoice.terms_and_conditions || "",
      payment_state: invoice.payment_state || "pending",
    });
  };

  useEffect(() => {
    if (expandedInvoice) {
      loadEditForm(expandedInvoice);
    }
  }, [expandedInvoice]);

  const resetEditForm = () => {
    if (expandedInvoice) {
      loadEditForm(expandedInvoice); // Reset to original values
    } else {
      setEditForm({
        tax_rate: 0,
        discount_amount: 0,
        invoice_additional_charges: 0,
        due_date: "",
        payment_date: "",
        notes: "",
        terms_and_conditions: "",
        payment_state: "pending",
      });
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setEditForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!expandedInvoiceId) {
      alert("لطفاً یک فاکتور را انتخاب کنید");
      return;
    }

    // Build formDataToSend with only changed fields
    const formDataToSend = {};

    // Compare each field with original
    if (editForm.tax_rate !== expandedInvoice.tax_rate) {
      formDataToSend.tax_rate = parseFloat(editForm.tax_rate);
    }

    if (editForm.discount_amount !== expandedInvoice.discount_amount) {
      formDataToSend.discount_amount = parseFloat(editForm.discount_amount);
    }

    if (
      editForm.invoice_additional_charges !==
      expandedInvoice.invoice_additional_charges
    ) {
      formDataToSend.invoice_additional_charges = parseFloat(
        editForm.invoice_additional_charges
      );
    }

    if (
      editForm.due_date !==
      (expandedInvoice.due_date ? expandedInvoice.due_date.split("T")[0] : "")
    ) {
      formDataToSend.due_date = editForm.due_date || null;
    }

    if (
      editForm.payment_date !==
      (expandedInvoice.payment_date
        ? expandedInvoice.payment_date.split("T")[0]
        : "")
    ) {
      formDataToSend.payment_date = editForm.payment_date || null;
    }

    if (editForm.notes !== (expandedInvoice.notes || "")) {
      formDataToSend.notes = editForm.notes;
    }

    if (
      editForm.terms_and_conditions !==
      (expandedInvoice.terms_and_conditions || "")
    ) {
      formDataToSend.terms_and_conditions = editForm.terms_and_conditions;
    }

    if (editForm.payment_state !== expandedInvoice.payment_state) {
      formDataToSend.payment_state = editForm.payment_state;
    }

    // Check if anything changed
    if (Object.keys(formDataToSend).length === 0) {
      alert("هیچ تغییری انجام نشده است");
      return;
    }

    try {
      await dispatch(
        updateInvoice({
          invoiceId: expandedInvoiceId,
          updates: formDataToSend,
        })
      ).unwrap();

      // Refresh invoices list
      dispatch(fetchInvoices());

      alert("فاکتور با موفقیت بروزرسانی شد");
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert(error || "خطا در بروزرسانی فاکتور");
    }
  };

  const toggleExpand = (invoiceId) => {
    if (expandedInvoiceId === invoiceId) {
      setExpandedInvoiceId(null);
    } else {
      setExpandedInvoiceId(invoiceId);
    }
  };

  const handleAddPayment = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setShowAddPaymentModal(true);
  };

  const resetModal = () => {
    setShowCreateModal(false);
    setSearchMode("customer");
    setSelectedEntity(null);
    setCustomerSearch("");
    setOrdererSearch("");
    setRecordSearch("");
    setSelectedRecords([]);
    setInvoiceForm({
      tax_rate: 10,
      discount_amount: 0,
      invoice_additional_charges: 0,
      invoice_date: convertGregorianToJalali(new Date().toISOString()),
      notes: "",
    });
  };

  const toggleRecordSelection = (recordId) => {
    setSelectedRecords((prev) =>
      prev.includes(recordId)
        ? prev.filter((id) => id !== recordId)
        : [...prev, recordId]
    );
  };

  const selectAllRecords = () => {
    setSelectedRecords(availableRecords.map((r) => r.id));
  };

  const deselectAllRecords = () => {
    setSelectedRecords([]);
  };

  const displayInvoices = searchTerm ? invoiceSearchResults : invoices;

  // Get available records based on search mode
  let availableRecords = [];
  if (searchMode === "record") {
    availableRecords = selectedRecordObjects;
  } else if (selectedEntity) {
    availableRecords = allRecords;
  }

  // Calculate preview totals
  const selectedRecordsData =
    searchMode === "record"
      ? availableRecords
      : allRecords.filter((r) => selectedRecords.includes(r.id));
  const subtotal = selectedRecordsData.reduce(
    (sum, r) => sum + parseFloat(r.total_price || 0),
    0
  );
  const taxAmount = (subtotal * parseFloat(invoiceForm.tax_rate || 0)) / 100;
  const totalAmount =
    subtotal +
    taxAmount +
    parseFloat(invoiceForm.invoice_additional_charges || 0) -
    parseFloat(invoiceForm.discount_amount || 0);

  const handleDeleteInvoice = async (invoiceId, invoiceAmountPaid) => {
    // Frontend validation
    if (parseFloat(invoiceAmountPaid) > 0) {
      alert("رکورد تکمیل شده یا فاکتور شده قابل حذف نیست");
      return;
    }

    if (
      !window.confirm(
        "آیا از حذف این فاکتور اطمینان دارید؟ این عملیات غیرقابل بازگشت است."
      )
    ) {
      return;
    }

    try {
      await dispatch(deleteInvoice(invoiceId)).unwrap();
      alert("رکورد با موفقیت حذف شد");
      // Refresh invoices list
      dispatch(fetchInvoices(filters));
    } catch (err) {
      console.error("Error deleting invoice:", err);
      alert(err || "خطا در حذف فاکتور");
    }
  };
  console.log("Calculations:", {
    subtotal,
    taxAmount,
    totalAmount,
    records: availableRecords.map((r) => ({ id: r.id, price: r.final_price })),
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-darkOrange text-white rounded-lg transition-all font-medium"
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
          ایجاد فاکتور جدید
        </button>

        <div className="flex items-center gap-4">
          <select
            value={filters.payment_state}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                payment_state: e.target.value,
                page: 1,
              }))
            }
            className="h-12 px-4 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white"
          >
            <option value="">همه وضعیت‌های پرداخت</option>
            <option value="pending">پرداخت نشده</option>
            <option value="partial">پرداخت جزئی</option>
            <option value="paid">پرداخت شده</option>
          </select>

          <div className="relative w-80">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو با شماره فاکتور"
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
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-black border border-orange/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black border-b border-white">
              <tr>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase">
                  شماره فاکتور
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase">
                  مشتری
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase">
                  متقاضی
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase">
                  تاریخ
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase">
                  مبلغ کل
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase">
                  پرداخت شده
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase">
                  باقیمانده
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase">
                  وضعیت پرداخت
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase">
                  ثبت پرداخت
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase">
                  قفل شود؟
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase">
                  ویرایش
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase">
                  حذف
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/50">
              {displayInvoices.map((invoice) => (
                <React.Fragment key={invoice.id}>
                  <tr
                    key={invoice.id}
                    className="hover:bg-black transition-colors"
                  >
                    <td className="px-6 py-4 text-center text-sm font-medium text-white">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-white">
                      {invoice.customer_name || "-"}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-white">
                      {invoice.orderer_name || "-"}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-white">
                      {new Date(invoice.invoice_date).toLocaleDateString(
                        "fa-IR"
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-green-200">
                      {invoice.total_amount.toLocaleString()} تومان
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-blue-200">
                      {invoice.amount_paid.toLocaleString()} تومان
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-red-200">
                      {invoice.amount_remaining.toLocaleString()} تومان
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 text-xs text-center font-medium rounded-full ${
                          invoice.payment_state === "pending"
                            ? "bg-gray-300 text-gray-600"
                            : invoice.payment_state === "partial"
                              ? "bg-blue-900/30 text-blue-400"
                              : "bg-green-900/30 text-green-400"
                        }`}
                      >
                        {invoice.payment_state === "pending"
                          ? "پرداخت نشده"
                          : invoice.payment_state === "partial"
                            ? "پرداخت جزئی"
                            : "پرداخت شده"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleAddPayment(invoice)}
                        disabled={
                          invoice.payment_state === "paid" ||
                          invoice.is_finalized
                        }
                        className="px-2 py-1 border-4 border-green-800 text-white text-lg rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        💳
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2">
                        {!invoice.is_finalized ? (
                          <>
                            <button
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    `آیا از نهایی کردن فاکتور ${invoice.invoice_number} اطمینان دارید؟ پس از نهایی شدن، امکان ویرایش وجود نخواهد داشت.`
                                  )
                                ) {
                                  try {
                                    await dispatch(
                                      finalizeInvoice(invoice.id)
                                    ).unwrap();
                                    dispatch(fetchInvoices(filters));
                                    alert("فاکتور با موفقیت نهایی شد"); // Add success message
                                  } catch (err) {
                                    console.error("Finalize error:", err); // Log the full error
                                    alert(`خطا در نهایی کردن فاکتور: ${err}`); // Show actual error
                                  }
                                }
                              }}
                              className="text-orange/80 hover:text-darkOrange text-sm  text-center justify-between font-medium"
                            >
                              🔒 نهایی کردن
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-green-400 text-sm  text-center">
                              ✓ نهایی شده
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center ">
                      <button
                        onClick={() => toggleExpand(invoice.id)}
                        className="text-pink disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={invoice.is_finalized}
                      >
                        {expandedInvoiceId === invoice.id ? "▲ " : "▼ "}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <button
                        onClick={() =>
                          handleDeleteInvoice(invoice.id, invoice.amount_paid)
                        }
                        disabled={
                          parseFloat(invoice.amount_paid) > 0 ||
                          invoice.is_finalized
                        }
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      ></button>
                    </td>
                  </tr>
                  {expandedInvoiceId === invoice.id && (
                    <tr>
                      <td colSpan="8">
                        <div className="p-6 bg-black border-t border-white">
                          <h3 className="text-lg font-semibold text-neutral-100 mb-4">
                            ویرایش فاکتور {invoice.invoice_number}
                          </h3>

                          {/* Financial Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-sm text-neutral-300 mb-2">
                                نرخ مالیات (%)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.tax_rate}
                                onChange={(e) =>
                                  handleFieldChange("tax_rate", e.target.value)
                                }
                                className="w-full h-11 px-3 bg-black border border-orange rounded text-sm text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-neutral-300 mb-2">
                                تخفیف (تومان)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.discount_amount}
                                onChange={(e) =>
                                  handleFieldChange(
                                    "discount_amount",
                                    e.target.value
                                  )
                                }
                                className="w-full h-11 px-3 bg-black border border-orange rounded text-sm text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-neutral-300 mb-2">
                                هزینه اضافی (تومان)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.invoice_additional_charges}
                                onChange={(e) =>
                                  handleFieldChange(
                                    "invoice_additional_charges",
                                    e.target.value
                                  )
                                }
                                className="w-full h-11 px-3 bg-black border border-orange rounded text-sm text-white"
                              />
                            </div>
                          </div>

                          {/* Date Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm text-neutral-300 mb-2">
                                تاریخ سررسید
                              </label>
                              <input
                                value={editForm.due_date}
                                onChange={(e) =>
                                  handleFieldChange("due_date", e.target.value)
                                }
                                className="w-full h-11 px-3 bg-black border border-orange rounded text-sm text-white"
                              />
                            </div>
                          </div>

                          {/* Payment State */}
                          <div className="mb-4">
                            <label className="block text-sm text-neutral-300 mb-2">
                              وضعیت پرداخت
                            </label>
                            <select
                              value={editForm.payment_state}
                              onChange={(e) =>
                                handleFieldChange(
                                  "payment_state",
                                  e.target.value
                                )
                              }
                              className="w-full h-11 px-3 bg-black border border-orange rounded text-sm text-white"
                            >
                              <option value="pending">در انتظار</option>
                              <option value="partial">پرداخت جزئی</option>
                              <option value="paid">پرداخت شده</option>
                              <option value="overdue">عقب افتاده</option>
                              <option value="cancelled">لغو شده</option>
                            </select>
                          </div>

                          {/* Notes */}
                          <div className="mb-4">
                            <label className="block text-sm text-neutral-300 mb-2">
                              یادداشت‌ها
                            </label>
                            <textarea
                              value={editForm.notes}
                              onChange={(e) =>
                                handleFieldChange("notes", e.target.value)
                              }
                              rows="3"
                              className="w-full h-11 px-3 bg-black border border-orange rounded text-sm text-white"
                            />
                          </div>

                          {/* Terms and Conditions */}
                          <div className="mb-4">
                            <label className="block text-sm text-neutral-300 mb-2">
                              شرایط و ضوابط
                            </label>
                            <textarea
                              value={editForm.terms_and_conditions}
                              onChange={(e) =>
                                handleFieldChange(
                                  "terms_and_conditions",
                                  e.target.value
                                )
                              }
                              rows="3"
                              className="w-full h-11 px-3 bg-black border border-orange rounded text-sm text-white"
                            />
                          </div>

                          {/* Price Preview */}
                          <div className="bg-black border border-white rounded p-4 mb-4">
                            <h4 className="text-sm font-medium text-neutral-300 mb-2">
                              پیش‌نمایش قیمت
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-neutral-400">مجموع جزء:</div>
                              <div className="text-neutral-200 text-left">
                                {invoice.subtotal?.toLocaleString()} تومان
                              </div>

                              <div className="text-neutral-400">
                                مالیات ({editForm.tax_rate}%):
                              </div>
                              <div className="text-neutral-200 text-left">
                                {(
                                  (invoice.subtotal *
                                    parseFloat(editForm.tax_rate || 0)) /
                                  100
                                ).toLocaleString()}{" "}
                                تومان
                              </div>

                              <div className="text-neutral-400">
                                هزینه اضافی:
                              </div>
                              <div className="text-neutral-200 text-left">
                                {parseFloat(
                                  editForm.invoice_additional_charges || 0
                                ).toLocaleString()}{" "}
                                تومان
                              </div>

                              <div className="text-neutral-400">تخفیف:</div>
                              <div className="text-red-400 text-left">
                                -
                                {parseFloat(
                                  editForm.discount_amount || 0
                                ).toLocaleString()}{" "}
                                تومان
                              </div>

                              <div className="text-neutral-200 font-bold pt-2 border-t border-neutral-700">
                                مجموع کل:
                              </div>
                              <div className="text-green-400 font-bold text-lg text-left pt-2 border-t border-neutral-700">
                                {(() => {
                                  const subtotal = parseFloat(
                                    invoice.subtotal || 0
                                  );
                                  const taxAmount =
                                    (subtotal *
                                      parseFloat(editForm.tax_rate || 0)) /
                                    100;
                                  const total =
                                    subtotal +
                                    taxAmount +
                                    parseFloat(
                                      editForm.invoice_additional_charges || 0
                                    ) -
                                    parseFloat(editForm.discount_amount || 0);

                                  return total.toLocaleString();
                                })()}
                                تومان
                              </div>
                            </div>
                          </div>

                          {/* Lock Warning */}
                          {invoice.is_finalized && (
                            <div className="bg-red-900/20 border border-red-500/50 rounded p-3 mb-4">
                              <div className="flex items-center gap-2 text-red-400 text-sm">
                                <span>🔒</span>
                                <div>
                                  <div className="font-medium">
                                    این فاکتور نهایی شده است
                                  </div>
                                  <div className="text-xs text-red-500 mt-1">
                                    امکان ویرایش وجود ندارد
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Buttons */}
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => toggleExpand(invoice.id)}
                              disabled={invoice.is_finalized}
                              className="px-4 py-2 bg-neutral-700 text-gray-400 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              انصراف
                            </button>
                            <button
                              onClick={resetEditForm}
                              className="px-4 py-2 bg-neutral-700 text-yellow/90 rounded"
                            >
                              بازنشانی
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              disabled={invoice.is_finalized}
                              className="px-4 py-2 bg-neutral-700 text-pink rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ذخیره تغییرات
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showAddPaymentModal && selectedInvoiceForPayment && (
        <AddPaymentModal
          invoice={selectedInvoiceForPayment}
          onClose={() => {
            setShowAddPaymentModal(false);
            setSelectedInvoiceForPayment(null);
          }}
        />
      )}

      {/* Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-black border border-orange rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-orange flex items-center justify-between sticky top-0 bg-black z-10">
              <h3 className="text-xl font-semibold text-neutral-100">
                ایجاد فاکتور جدید
              </h3>
              <button
                onClick={resetModal}
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

            <div className="p-6 space-y-6">
              {/* Step 1: Search Mode Selection */}
              <div className="bg-black border border-orange rounded-lg p-6">
                <h4 className="text-lg justify-end font-medium text-white mb-4 flex items-center gap-2">
                  روش جستجو
                  <span className="w-8 h-8 bg-darkOrange rounded-full flex items-center justify-center text-yellow text-sm">
                    1
                  </span>
                </h4>

                {/* Search Mode Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      setSearchMode("customer");
                      setSelectedEntity(null);
                      setSelectedRecords([]);
                      setOrdererSearch("");
                      setRecordSearch("");
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      searchMode === "customer"
                        ? "bg-orange text-white shadow-lg"
                        : "bg-neutral-800 text-white"
                    }`}
                  >
                    جستجو با مشتری
                  </button>
                  <button
                    onClick={() => {
                      setSearchMode("orderer");
                      setSelectedEntity(null);
                      setSelectedRecords([]);
                      setCustomerSearch("");
                      setRecordSearch("");
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      searchMode === "orderer"
                        ? "bg-orange text-white shadow-lg"
                        : "bg-neutral-800 text-white"
                    }`}
                  >
                    جستجو با متقاضی
                  </button>
                  <button
                    onClick={() => {
                      setSearchMode("record");
                      setSelectedEntity(null);
                      setCustomerSearch("");
                      setOrdererSearch("");
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      searchMode === "record"
                        ? "bg-orange text-white shadow-lg"
                        : "bg-neutral-800 text-white"
                    }`}
                  >
                    جستجو با شماره رکورد
                  </button>
                </div>

                {/* Customer Search */}
                {searchMode === "customer" && (
                  <div className="relative">
                    <input
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="جستجوی مشتری"
                      autoComplete="off"
                      className="w-full h-12 p-3 pr-12 text-right bg-black border border-white rounded text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
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

                    {showCustomerDropdown &&
                      customerSearchResults.length > 0 && (
                        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-black shadow-lg border border-white">
                          {customerSearchResults.map((customer) => (
                            <li
                              key={customer.id}
                              onClick={() => handleCustomerSelect(customer)}
                              className="px-4 py-3 text-sm text-neutral-200 hover:bg-black cursor-pointer border-b border-white last:border-0"
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-orange font-medium">
                                  {customer.company_email}
                                </div>

                                <div className="text-orange font-medium">
                                  {customer.company_phone}
                                </div>
                                <div className="font-medium text-green-400">
                                  {customer.name}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                )}

                {/* Orderer Search */}
                {searchMode === "orderer" && (
                  <div className="relative">
                    <input
                      value={ordererSearch}
                      onChange={(e) => setOrdererSearch(e.target.value)}
                      placeholder="جستجوی متقاضی"
                      autoComplete="off"
                      className="w-full h-12 p-3 pr-12 text-right bg-black border border-white rounded text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
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

                    {showOrdererDropdown && ordererSearchResults.length > 0 && (
                      <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-black shadow-lg border border-white">
                        {ordererSearchResults.map((orderer) => (
                          <li
                            key={orderer.id}
                            onClick={() => handleOrdererSelect(orderer)}
                            className="px-4 py-3 text-sm text-neutral-200 hover:bg-black cursor-pointer border-b border-white last:border-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-yellow font-medium">
                                {orderer.customer_name}
                              </div>
                              <div className="text-orange font-medium">
                                {orderer.email}
                              </div>
                              <div className="text-orange font-medium">
                                {orderer.mobile}
                              </div>
                              <div className="font-medium text-green-400">
                                {orderer.full_name}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Record Search */}
                {searchMode === "record" && (
                  <div className="relative">
                    <input
                      value={recordSearch}
                      onChange={(e) => setRecordSearch(e.target.value)}
                      placeholder="شماره رکورد (مثال: 100-1404)"
                      autoComplete="off"
                      className="w-full h-12 p-3 pr-12 text-right bg-black border border-white rounded text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                    />
                    <svg
                      className="absolute right-4 top-1/3 -translate-y-1/2 w-5 h-5 text-neutral-400"
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

                    {selectedRecords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedRecordObjects.map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center gap-2 bg-neutral-800 px-3 py-2 rounded-lg border border-neutral-600"
                          >
                            <span className="text-sm text-white font-mono">
                              {record.record_number}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedRecords(
                                  selectedRecords.filter(
                                    (id) => id !== record.id
                                  )
                                );
                                setSelectedRecordObjects(
                                  selectedRecordObjects.filter(
                                    (r) => r.id !== record.id
                                  )
                                );
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {showRecordDropdown && recordSearchResults.length > 0 && (
                      <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-black shadow-lg border border-white">
                        {recordSearchResults.map((record) => (
                          <li
                            key={record.id}
                            onClick={() => handleRecordSelect(record)}
                            className="px-4 py-3 text-sm text-neutral-200 hover:bg-black cursor-pointer border-b border-white last:border-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-yellow font-medium">
                                {record.total_price} تومان
                              </div>
                              <div className="text-orange font-medium">
                                {record.orderer_name}
                              </div>
                              <div className="text-orange font-medium">
                                {record.customer_name}
                              </div>
                              <div className="font-medium font-mono text-green-400">
                                {record.record_number}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Selected Entity Display */}
                {selectedEntity && searchMode !== "record" && (
                  <div className="mt-4 p-4 bg-neutral-800/50 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-green-400">
                          ✓ {searchMode === "customer" ? "مشتری" : "متقاضی"}{" "}
                          انتخاب شده
                        </div>
                        <div className="text-lg font-semibold text-neutral-100 mt-1">
                          {searchMode === "customer"
                            ? selectedEntity.name
                            : selectedEntity.full_name}
                        </div>
                        {searchMode === "customer" &&
                          selectedEntity.company_email && (
                            <div className="text-sm text-neutral-400 mt-1">
                              {selectedEntity.company_email}
                            </div>
                          )}
                        {searchMode === "orderer" && selectedEntity.mobile && (
                          <div className="text-sm text-neutral-400 mt-1">
                            {selectedEntity.mobile}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedEntity(null);
                          setCustomerSearch("");
                          setOrdererSearch("");
                          setSelectedRecords([]);
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        تغییر
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Select Records */}
              {((searchMode !== "record" && selectedEntity) ||
                (searchMode === "record" && selectedRecords.length > 0)) && (
                <div className="bg-black border border-white rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    {searchMode !== "record" && (
                      <div className="flex  gap-2">
                        <button
                          onClick={selectAllRecords}
                          className="px-3 py-1 text-xs bg-black text-yellow rounded hover:bg-orange transition-colors"
                        >
                          انتخاب همه
                        </button>
                        <button
                          onClick={deselectAllRecords}
                          className="px-3 py-1 text-xs bg-black text-red-400 rounded hover:bg-red-600 transition-colors"
                        >
                          حذف انتخاب
                        </button>
                      </div>
                    )}
                    <h4 className="text-lg  font-medium text-white flex items-center gap-2">
                      <span className="w-8 h-8 bg-darkOrange rounded-full flex items-center justify-center text-yellow text-sm">
                        2
                      </span>
                      انتخاب رکوردها ({availableRecords.length} انتخاب شده)
                    </h4>
                  </div>

                  <div className="bg-black border border-orange rounded-lg max-h-80 overflow-y-auto">
                    {availableRecords.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="text-white mb-2">
                          رکوردی برای این{" "}
                          {searchMode === "customer" ? "مشتری" : "متقاضی"} وجود
                          ندارد
                        </div>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-black border-b border-orange sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-right text-xs font-medium text-orange">
                              <input
                                type="checkbox"
                                checked={
                                  selectedRecords.length ===
                                    availableRecords.length &&
                                  availableRecords.length > 0
                                }
                                onChange={(e) =>
                                  e.target.checked
                                    ? selectAllRecords()
                                    : deselectAllRecords()
                                }
                                className="w-4 h-4 rounded border-[#5271ff]/20 bg-black text-white focus:ring-white"
                              />
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                              شماره رکورد
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                              نمونه
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                              آزمون
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                              وضعیت
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">
                              قیمت نهایی
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700/50">
                          {availableRecords.map((record) => (
                            <tr
                              key={record.id}
                              className="hover:bg-neutral-800/30"
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedRecords.includes(record.id)}
                                  onChange={() =>
                                    toggleRecordSelection(record.id)
                                  }
                                  className="w-4 h-4 rounded border-orange bg-black text-white focus:ring-white"
                                />
                              </td>
                              <td className="px-4 py-3 text-sm font-mono text-white/80">
                                {record.record_number}
                              </td>
                              <td className="px-4 py-3 text-sm text-white">
                                {record.sample_name || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-white">
                                {record.test_count}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    record.record_state === "received"
                                      ? "bg-blue-900/30 text-blue-400"
                                      : record.record_state === "in_laboratory"
                                        ? "bg-yellow-900/30 text-yellow-400"
                                        : record.record_state === "testing"
                                          ? "bg-purple-900/30 text-purple-400"
                                          : record.record_state === "completed"
                                            ? "bg-green-900/30 text-green-400"
                                            : "bg-gray-900/30 text-gray-400"
                                  }`}
                                >
                                  {record.record_state === "received"
                                    ? "دریافت شده"
                                    : record.record_state === "in_laboratory"
                                      ? "در آزمایشگاه"
                                      : record.record_state === "testing"
                                        ? "در حال آزمون"
                                        : record.record_state === "completed"
                                          ? "تکمیل شده"
                                          : record.record_state === "invoiced"
                                            ? "فاکتور شده"
                                            : record.record_state}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-green-400">
                                {record.total_price?.toLocaleString() || "0"}{" "}
                                تومان
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Invoice Details */}
              {selectedRecords.length > 0 && (
                <div className="bg-black  border border-white rounded-lg p-6">
                  <h4 className="text-lg justify-end font-medium text-neutral-100 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-darkOrange rounded-full flex items-center justify-center text-yellow text-sm">
                      3
                    </span>
                    جزئیات فاکتور
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceForm.tax_rate}
                        onChange={(e) =>
                          setInvoiceForm((prev) => ({
                            ...prev,
                            tax_rate: e.target.value,
                          }))
                        }
                        placeholder=""
                        className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                      />
                      <label
                        className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${invoiceForm.tax_rate ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
                      >
                        نرخ مالیات (%)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceForm.discount_amount}
                        onChange={(e) =>
                          setInvoiceForm((prev) => ({
                            ...prev,
                            discount_amount: e.target.value,
                          }))
                        }
                        placeholder=""
                        className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                      />
                      <label
                        className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${invoiceForm.discount_amount ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
                      >
                        مبلغ تخفیف (تومان)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={invoiceForm.invoice_date}
                        onChange={(e) =>
                          setInvoiceForm((prev) => ({
                            ...prev,
                            invoice_date: e.target.value,
                          }))
                        }
                        className="w-full h-12 p-3 bg-neutral-900 border border-[#5271ff]/20 rounded text-sm text-neutral-200 focus:outline-none focus:border-[#5271ff]"
                      />
                      <label className="absolute top-0 -translate-y-1/2 right-3 rounded-md bg-neutral-900 px-1 text-xs text-neutral-400">
                        تاریخ سررسید
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceForm.invoice_additional_charges}
                        onChange={(e) =>
                          setInvoiceForm((prev) => ({
                            ...prev,
                            invoice_additional_charges: e.target.value,
                          }))
                        }
                        placeholder=""
                        className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                      />
                      <label
                        className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${invoiceForm.invoice_additional_charges ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
                      >
                        هزینه اضافی (تومان)
                      </label>
                    </div>

                    <div className="relative md:col-span-2">
                      <textarea
                        value={invoiceForm.notes}
                        onChange={(e) =>
                          setInvoiceForm((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder=""
                        rows="3"
                        className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                      />
                      <label
                        className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${invoiceForm.notes ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
                      >
                        یادداشت
                      </label>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-6 bg-gradient-to-br from-[#5271ff]/10 to-[#4158d0]/10 border border-[#5271ff]/30 rounded-lg p-6">
                    <h5 className="text-base font-medium text-neutral-100 mb-4">
                      پیش‌نمایش فاکتور
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between text-neutral-300">
                        <span className="font-medium text-lg">
                          {subtotal.toLocaleString()} تومان
                        </span>
                        <span>
                          :جمع مبالغ پایه ({selectedRecords.length} رکورد)
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-400 text-sm">
                        <span>+ {taxAmount.toLocaleString()} تومان</span>
                        <span>
                          :مالیات بر ارزش افزوده ({invoiceForm.tax_rate}%)
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-400 text-sm">
                        <span>
                          -{" "}
                          {parseFloat(
                            invoiceForm.discount_amount || 0
                          ).toLocaleString()}{" "}
                          تومان
                        </span>
                        <span>:تخفیف</span>
                      </div>
                      <div className="flex justify-between text-neutral-400 text-sm">
                        <span>
                          +{" "}
                          {parseFloat(
                            invoiceForm.invoice_additional_charges || 0
                          ).toLocaleString()}{" "}
                          تومان
                        </span>
                        <span>:هزینه اضافه</span>
                      </div>
                      <div className="flex justify-between text-green-400 font-bold text-xl pt-3 border-t border-[#5271ff]/30">
                        <span>{totalAmount.toLocaleString()} تومان</span>
                        <span>:مبلغ قابل پرداخت</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-orange flex justify-end gap-3 sticky bottom-0 bg-black">
              <button
                onClick={resetModal}
                className="px-6 py-3 bg-neutral-700 text-neutral-200 rounded-lg hover:bg-neutral-600 transition-colors font-medium"
              >
                انصراف
              </button>
              <button
                onClick={handleCreateInvoice}
                disabled={loading || selectedRecords.length === 0}
                className="px-8 py-3 bg-pink text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    در حال ایجاد...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    ایجاد فاکتور
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!searchTerm && pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-black">
            صفحه {pagination.page} از {pagination.totalPages} (
            {pagination.total} فاکتور)
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              قبلی
            </button>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesList;
