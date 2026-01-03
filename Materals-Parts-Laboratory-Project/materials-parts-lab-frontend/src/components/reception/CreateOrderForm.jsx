// src/components/reception/CreateOrderForm.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createRecord,
  selectRecordsLoading,
  selectRecordsError,
  selectRecordsSuccess,
  clearMessages,
} from "../../redux/records/recordsSlice";
import {
  searchCustomers,
  selectCustomerSearchResults,
  clearSearchResults as clearCustomerSearch,
  searchOrderers,
  selectOrdererSearchResults,
} from "../../redux/customers/customersSlice";
import {
  fetchActiveTests,
  selectActiveTests,
  fetchActiveStandards,
  selectActiveStandards,
  searchTests,
  selectTestSearchResults,
  searchStandards,
  selectStandardSearchResults,
} from "../../redux/tests/testsSlice";

const CreateOrderForm = () => {
  const dispatch = useDispatch();

  const loading = useSelector(selectRecordsLoading);
  const error = useSelector(selectRecordsError);
  const success = useSelector(selectRecordsSuccess);
  const customerSearchResults = useSelector(selectCustomerSearchResults);
  const ordererSearchResults = useSelector(selectOrdererSearchResults);
  const testSearchResults = useSelector(selectTestSearchResults);
  const standardSearchResults = useSelector(selectStandardSearchResults);
  const activeTests = useSelector(selectActiveTests);
  const activeStandards = useSelector(selectActiveStandards);

  const [formData, setFormData] = useState({
    customerSearch: "",
    customerId: null,
    customerName: "",
    companyEmail: "",
    companyPhone: "",
    address: "",
    taxId: "",
    ordererSearch: "",
    ordererId: null,
    ordererName: "",
    ordererMobile: "",
    ordererEmail: "",
    nationalId: "",
    sampleName: "",
    sampleDescription: "",
    quantity: 1,
    sampleCondition: "",
    receptionNotes: "",
    expectedCompletionDate: "",
    tests: [
      {
        testId: null,
        testSearch: "",
        standardId: null,
        standardSearch: "",
        additionalCharges: "",
        discount: "",
        receptionNotes: "",
      },
    ],
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [showOrdererDropdown, setShowOrdererDropdown] = useState(false);
  const [showTestDropdown, setShowTestDropdown] = useState({});
  const [showStandardDropdown, setShowStandardDropdown] = useState({});
  const [activeTestSearchIndex, setActiveTestSearchIndex] = useState(null); // Track which index is being searched
  const [activeStandardSearchIndex, setActiveStandardSearchIndex] =
    useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isCustomerSearchActive, setIsCustomerSearchActive] = useState(false); // Track which index is being searched
  const [isOrdererSearchActive, setIsOrdererSearchActive] = useState(false);

  useEffect(() => {
    dispatch(fetchActiveTests());
    dispatch(fetchActiveStandards());
  }, [dispatch]);

  useEffect(() => {
    // ✅ Only search if user is actively typing
    if (
      isCustomerSearchActive &&
      formData.customerSearch &&
      formData.customerSearch.length >= 2
    ) {
      const timer = setTimeout(() => {
        dispatch(searchCustomers(formData.customerSearch));
        setShowCustomerDropdown(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (!isCustomerSearchActive) {
      setShowCustomerDropdown(false);
    }
  }, [formData.customerSearch, isCustomerSearchActive, dispatch]);

  useEffect(() => {
    // ✅ Only search if user is actively typing
    if (
      isOrdererSearchActive &&
      formData.ordererSearch &&
      formData.ordererSearch.length >= 2
    ) {
      const timer = setTimeout(() => {
        dispatch(searchOrderers(formData.ordererSearch));
        setShowOrdererDropdown(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (!isOrdererSearchActive) {
      setShowOrdererDropdown(false);
    }
  }, [formData.ordererSearch, isOrdererSearchActive, dispatch]);

  // Test search - ONLY search for the active index
  useEffect(() => {
    if (activeTestSearchIndex !== null) {
      const test = formData.tests[activeTestSearchIndex];

      if (test && test.testSearch && test.testSearch.length >= 2) {
        const timer = setTimeout(() => {
          dispatch(searchTests(test.testSearch));
          setShowTestDropdown((prev) => ({
            ...prev,
            [activeTestSearchIndex]: true,
          }));
        }, 300);

        return () => clearTimeout(timer);
      } else {
        setShowTestDropdown((prev) => ({
          ...prev,
          [activeTestSearchIndex]: false,
        }));
      }
    }
  }, [
    activeTestSearchIndex !== null
      ? formData.tests[activeTestSearchIndex]?.testSearch
      : null,
    activeTestSearchIndex,
    dispatch,
  ]);

  // Standard search - ONLY search for the active index
  useEffect(() => {
    if (activeStandardSearchIndex !== null) {
      const test = formData.tests[activeStandardSearchIndex];

      if (test && test.standardSearch && test.standardSearch.length >= 2) {
        const timer = setTimeout(() => {
          dispatch(searchStandards(test.standardSearch));
          setShowStandardDropdown((prev) => ({
            ...prev,
            [activeStandardSearchIndex]: true,
          }));
        }, 300);

        return () => clearTimeout(timer);
      } else {
        setShowStandardDropdown((prev) => ({
          ...prev,
          [activeStandardSearchIndex]: false,
        }));
      }
    }
  }, [
    activeStandardSearchIndex !== null
      ? formData.tests[activeStandardSearchIndex]?.standardSearch
      : null,
    activeStandardSearchIndex,
    dispatch,
  ]);

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
      customerSearch: customer.name, // This changes customerSearch...
      companyEmail: customer.company_email || "",
      companyPhone: customer.company_phone || "",
      address: customer.address || "",
      taxId: customer.tax_id || "",
    }));

    // ✅ CRITICAL: Mark as not searching to prevent re-trigger
    setIsCustomerSearchActive(false);
    setShowCustomerDropdown(false);
    dispatch(clearCustomerSearch());
  };

  const handleOrdererSelect = (orderer) => {
    setFormData((prev) => ({
      ...prev,
      ordererId: orderer.id,
      ordererName: orderer.full_name,
      ordererSearch: orderer.full_name,
      ordererMobile: orderer.mobile || "",
      ordererEmail: orderer.email || "",
      nationalId: orderer.national_id || "",
    }));
    setIsOrdererSearchActive(false);
    setShowOrdererDropdown(false);
  };

  const handleTestSelect = (index, test) => {
    const newTests = [...formData.tests];
    newTests[index] = {
      ...newTests[index],
      testId: test.id,
      testSearch: test.title,
    };
    setFormData((prev) => ({ ...prev, tests: newTests }));

    // IMPORTANT: Close dropdown and clear active index
    setShowTestDropdown((prev) => ({ ...prev, [index]: false }));
    setActiveTestSearchIndex(null); // ✅ This prevents re-triggering
  };

  const handleTestFieldChange = (index, fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      tests: prev.tests.map(
        (test, i) =>
          i === index
            ? { ...test, [fieldName]: value } // Update specific test at index
            : test // Keep other tests unchanged
      ),
    }));
  };

  const handleStandardSelect = (index, standard) => {
    const newTests = [...formData.tests];
    newTests[index] = {
      ...newTests[index],
      standardId: standard.id,
      standardSearch: standard.code,
    };
    setFormData((prev) => ({ ...prev, tests: newTests }));

    // IMPORTANT: Close dropdown and clear active index
    setShowStandardDropdown((prev) => ({ ...prev, [index]: false }));
    setActiveStandardSearchIndex(null); // ✅ This prevents re-triggering
  };

  // Handle test search input change
  const handleTestSearchChange = (index, value) => {
    const newTests = [...formData.tests];
    newTests[index] = { ...newTests[index], testSearch: value };
    setFormData((prev) => ({ ...prev, tests: newTests }));
    setActiveTestSearchIndex(index); // Mark this index as active
  };

  // Handle standard search input change
  const handleStandardSearchChange = (index, value) => {
    const newTests = [...formData.tests];
    newTests[index] = { ...newTests[index], standardSearch: value };
    setFormData((prev) => ({ ...prev, tests: newTests }));
    setActiveStandardSearchIndex(index); // Mark this index as active
  };

  const addTest = () => {
    setFormData((prev) => ({
      ...prev,
      tests: [
        ...prev.tests,
        {
          testId: null,
          testSearch: "",
          standardId: null,
          standardSearch: "",
          additionalCharges: 0,
          discount: 0,
          receptionNotes: "",
        },
      ],
    }));
  };

  // Remove test
  const removeTest = (index) => {
    if (formData.tests.length > 1) {
      const newTests = formData.tests.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, tests: newTests }));
      // Clean up dropdown states
      setShowTestDropdown((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      setShowStandardDropdown((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert("حداکثر 10 فایل می‌توانید انتخاب کنید");
      return;
    }

    setSelectedFiles(files);

    const previews = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          resolve({ name: file.name, url: e.target.result });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(setFilePreviews);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // At least one of customer or orderer must be provided
    const hasCustomer = formData.customerId || formData.customerSearch;
    const hasOrderer = formData.ordererId || formData.ordererSearch;

    if (!hasCustomer && !hasOrderer) {
      alert("لطفا حداقل یکی از موارد مشتری یا متقاضی را وارد کنید");
      return;
    }

    if (formData.tests.some((test) => !test.testId)) {
      alert("لطفا آزمون را برای همه ردیف‌ها انتخاب کنید");
      return;
    }

    const recordData = {
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
      orderer: formData.ordererId
        ? { id: formData.ordererId }
        : formData.ordererSearch
          ? {
              full_name: formData.ordererName || formData.ordererSearch,
              mobile: formData.ordererMobile,
              email: formData.ordererEmail,
              national_id: formData.nationalId,
            }
          : null,
      sample: {
        sample_name: formData.sampleName || null, // Can be null
        sample_description: formData.sampleDescription,
        quantity: parseInt(formData.quantity),
        sample_condition: formData.sampleCondition,
        reception_notes: formData.receptionNotes,
        expected_completion_date: formData.expectedCompletionDate || null,
      },
      tests: formData.tests.map((test) => ({
        test_id: test.testId,
        standard_id: test.standardId || null,
        additional_charges: parseFloat(test.additionalCharges) || 0,
        discount: parseFloat(test.discount) || 0,
        reception_notes: test.receptionNotes || null,
      })),
    };

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add JSON data as a string
      formDataToSend.append("recordData", JSON.stringify(recordData));

      // Add files if any
      selectedFiles.forEach((file) => {
        formDataToSend.append("sample_images", file);
      });

      await dispatch(createRecord(formDataToSend)).unwrap();

      // Reset form
      setFormData({
        customerSearch: "",
        customerId: null,
        customerName: "",
        companyEmail: "",
        companyPhone: "",
        address: "",
        taxId: "",
        ordererSearch: "",
        ordererId: null,
        ordererName: "",
        ordererMobile: "",
        ordererEmail: "",
        nationalId: "",
        sampleName: "",
        sampleDescription: "",
        quantity: 1,
        sampleCondition: "",
        receptionNotes: "",
        expectedCompletionDate: "",
        testSearch: "",
        standardSearch: "",
        tests: [
          {
            testId: null,
            testSearch: "",
            standardId: null,
            standardSearch: "",
            additionalCharges: 0,
            discount: 0,
            receptionNotes: "",
          },
        ],
      });
      setSelectedFiles([]);
      setFilePreviews([]);
    } catch (err) {
      console.error("سفارش قابل ثبت نیست", err);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Section */}
        <div className="bg-black border border-white rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-darkOrange rounded-full flex items-center justify-center text-orange text-sm">
              1
            </span>
            مشتری حقوقی
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <input
                name="customerSearch"
                value={formData.customerSearch}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    customerSearch: e.target.value,
                  }));
                  setIsCustomerSearchActive(true); // ✅ Mark as actively searching
                }}
                onFocus={() => {
                  setIsCustomerSearchActive(true); // ✅ Mark as active
                  if (
                    formData.customerSearch &&
                    formData.customerSearch.length >= 2
                  ) {
                    setShowCustomerDropdown(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowCustomerDropdown(false);
                    setIsCustomerSearchActive(false); // ✅ Not active anymore
                  }, 200);
                }}
                placeholder=""
                autoComplete="off"
                className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.customerSearch ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                جستجوی مشتری یا افزودن
              </label>
              {showCustomerDropdown && customerSearchResults.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-black shadow-lg border border-white">
                  {customerSearchResults.map((customer) => (
                    <li
                      key={customer.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleCustomerSelect(customer);
                      }}
                      className="px-4 py-3 text-sm text-neutral-200 hover:bg-[#5271ff]/10 cursor-pointer border-b border-neutral-700/50 last:border-0"
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {customer.company_email} - {customer.company_phone}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="relative">
              <input
                name="companyEmail"
                type="email"
                value={formData.companyEmail}
                onChange={handleInputChange}
                placeholder=""
                className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.companyEmail ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                ایمیل
              </label>
            </div>

            <div className="relative">
              <input
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleInputChange}
                placeholder=""
                className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.companyPhone ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                تلفن
              </label>
            </div>
          </div>
        </div>

        {/* Orderer Section */}
        <div className="bg-black border border-white rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-darkOrange rounded-full flex items-center justify-center text-yellow text-sm">
              2
            </span>
            متقاضی حقیقی
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Orderer Search */}
            <div className="relative">
              <input
                name="ordererSearch"
                value={formData.ordererSearch}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    ordererSearch: e.target.value,
                  }));
                  setIsOrdererSearchActive(true); // ✅ Mark as actively searching
                }}
                onFocus={() => {
                  setIsOrdererSearchActive(true); // ✅ Mark as active
                  if (
                    formData.ordererSearch &&
                    formData.ordererSearch.length >= 2
                  ) {
                    setShowOrdererDropdown(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowOrdererDropdown(false);
                    setIsOrdererSearchActive(false); // ✅ Not active anymore
                  }, 200);
                }}
                placeholder=""
                autoComplete="off"
                className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.ordererSearch ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                جستجوی متقاضی یا افزودن
              </label>
              {showOrdererDropdown && ordererSearchResults.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-black shadow-lg border border-white">
                  {ordererSearchResults.map((orderer) => (
                    <li
                      key={orderer.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleOrdererSelect(orderer);
                      }}
                      className="px-4 py-3 text-sm text-neutral-200 hover:bg-[#5271ff]/10 cursor-pointer border-b border-neutral-700/50 last:border-0"
                    >
                      <div className="font-medium">{orderer.full_name}</div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {orderer.email} - {orderer.mobile}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Orderer Mobile */}
            <div className="relative">
              <input
                name="ordererMobile"
                value={formData.ordererMobile}
                onChange={handleInputChange}
                placeholder=""
                className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.ordererMobile ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                موبایل
              </label>
            </div>

            {/* Orderer Email */}
            <div className="relative">
              <input
                name="ordererEmail"
                type="email"
                value={formData.ordererEmail}
                onChange={handleInputChange}
                placeholder=""
                className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.ordererEmail ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                ایمیل
              </label>
            </div>

            {/* National ID */}
            <div className="relative">
              <input
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                placeholder=""
                className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.nationalId ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                کد ملی
              </label>
            </div>
          </div>
        </div>

        {/* Sample Section */}
        <div className="bg-black border border-white rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-darkOrange rounded-full flex items-center justify-center text-yellow text-sm">
              3
            </span>
            نمونه
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <input
                name="sampleName"
                value={formData.sampleName}
                onChange={handleInputChange}
                placeholder=""
                className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.sampleName ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                نام نمونه (اختیاری)
              </label>
            </div>

            <div className="relative">
              <input
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder=""
                className="w-full h-12 px-4 pr-12 bg-black border border-white rounded-lg text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <label
                className={`absolute right-3 rounded-md bg-black px-1 text-xs text-white transition-all pointer-events-none ${formData.quantity ? "top-0 -translate-y-1/2 text-xs " : "top-1/2 -translate-y-1/2 peer-focus:top-0"}`}
              >
                تعداد
              </label>
            </div>
          </div>

          {/* File Upload */}
          <div className="mt-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full h-24 px-4 transition bg-black border-2 border-white border-dashed rounded-md appearance-none cursor-pointer hover:border-white/60 focus:outline-none"
            >
              <span className="flex items-center gap-2 text-sm text-white">
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                عکس‌های نمونه (حداکثر 10)
              </span>
            </label>

            {filePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-4">
                {filePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="w-full h-50 object-cover rounded border border-[#5271ff]/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        className="w-3 h-3"
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tests Section */}
        <div className="bg-black border border-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
              <span className="w-8 h-8 bg-darkOrange rounded-full flex items-center justify-center text-yellow text-sm">
                4
              </span>
              آزمون‌ها
            </h2>
            <button
              type="button"
              onClick={addTest}
              className="px-4 py-2 text-pink transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
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
              افزودن
            </button>
          </div>

          <div className="space-y-3">
            {formData.tests.map((test, index) => (
              <div
                key={index}
                className="bg-black border border-white rounded-lg p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Test Search with Autocomplete */}
                  <div className="relative">
                    <input
                      value={test.testSearch}
                      onChange={(e) =>
                        handleTestSearchChange(index, e.target.value)
                      }
                      onFocus={() => {
                        // When user focuses, mark as active for searching
                        setActiveTestSearchIndex(index);
                        // If already has 2+ chars, show dropdown
                        if (test.testSearch && test.testSearch.length >= 2) {
                          setShowTestDropdown((prev) => ({
                            ...prev,
                            [index]: true,
                          }));
                        }
                      }}
                      onBlur={() => {
                        // Delay closing to allow click on dropdown
                        setTimeout(() => {
                          setShowTestDropdown((prev) => ({
                            ...prev,
                            [index]: false,
                          }));
                          setActiveTestSearchIndex(null);
                        }, 200);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="جستجوی آزمون"
                      autoComplete="off"
                      className="w-full h-12 p-3 text-right bg-black border border-white rounded text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                    />

                    {/* Test Dropdown */}
                    {showTestDropdown[index] &&
                      testSearchResults.length > 0 && (
                        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-black shadow-lg border border-white">
                          {testSearchResults.map((testItem) => (
                            <li
                              key={testItem.id}
                              onMouseDown={(e) => {
                                // Use onMouseDown instead of onClick to fire before onBlur
                                e.preventDefault();
                                handleTestSelect(index, testItem);
                              }}
                              className="px-4 py-3 text-sm text-neutral-200 hover:bg-[#5271ff]/10 cursor-pointer border-b border-neutral-700/50 last:border-0"
                            >
                              <div className="font-medium">
                                {testItem.title}
                              </div>
                              <div className="text-xs text-white mt-1">
                                {testItem.base_price?.toLocaleString()} تومان
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>

                  {/* Standard Search with Autocomplete */}
                  <div className="relative">
                    <input
                      value={test.standardSearch}
                      onChange={(e) =>
                        handleStandardSearchChange(index, e.target.value)
                      }
                      onFocus={() => {
                        setActiveStandardSearchIndex(index);
                        if (
                          test.standardSearch &&
                          test.standardSearch.length >= 2
                        ) {
                          setShowStandardDropdown((prev) => ({
                            ...prev,
                            [index]: true,
                          }));
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowStandardDropdown((prev) => ({
                            ...prev,
                            [index]: false,
                          }));
                          setActiveStandardSearchIndex(null);
                        }, 200);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="جستجوی استاندارد"
                      autoComplete="off"
                      className="w-full h-12 p-3 text-right bg-black border border-white rounded text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                    />

                    {/* Standard Dropdown */}
                    {showStandardDropdown[index] &&
                      standardSearchResults.length > 0 && (
                        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-black shadow-lg border border-white">
                          {standardSearchResults.map((standard) => (
                            <li
                              key={standard.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleStandardSelect(index, standard);
                              }}
                              className="px-4 py-3 text-sm text-neutral-200 hover:bg-[#5271ff]/10 cursor-pointer border-b border-neutral-700/50 last:border-0"
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
                  {/* Additional Charges */}
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={test.additionalCharges}
                      onChange={(e) =>
                        handleTestFieldChange(
                          index,
                          "additionalCharges",
                          e.target.value
                        )
                      }
                      placeholder="(تومان)هزینه اضافی"
                      className="w-full h-12 p-3 text-right bg-black border border-white rounded text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                    />
                  </div>

                  {/* Discount + Remove Button */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={test.discount}
                      onChange={(e) =>
                        handleTestFieldChange(index, "discount", e.target.value)
                      }
                      placeholder="(تومان)تخفیف"
                      className="w-full h-12 p-3 text-right bg-black border border-white rounded text-sm text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                    />
                    {formData.tests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTest(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-center gap-3">
          <button
            type="submit"
            disabled={loading}
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
                در حال ثبت...
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
                ثبت سفارش
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderForm;
