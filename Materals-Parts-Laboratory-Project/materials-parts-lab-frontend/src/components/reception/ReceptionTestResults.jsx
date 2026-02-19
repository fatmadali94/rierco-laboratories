// src/components/reception/TestResultsTab.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  clearSuccess,
  selectTestResultsLoading,
  selectTestResultsError,
  selectTestResultsSuccess,
  selectTestResults,
  fetchResultsByRecord,
} from "../../redux/tests/testResultsSlice";

const ReceptionTestResults = ({ record, onRefresh }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectTestResultsLoading);
  const error = useSelector(selectTestResultsError);
  const success = useSelector(selectTestResultsSuccess);
  const allResults = useSelector(selectTestResults);

  const [showResultModal, setShowResultModal] = useState(false);
  const [editingResult, setEditingResult] = useState(null);

  useEffect(() => {
    if (record?.id) {
      dispatch(fetchResultsByRecord(record.id));
    }
  }, [dispatch, record?.id]);

  // Handle success/error notifications
  useEffect(() => {
    if (success) {
      setShowResultModal(false);
      setEditingResult(null);
      if (onRefresh) {
        onRefresh();
      }
      dispatch(clearSuccess());
    }
  }, [success, dispatch, onRefresh]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Groups results by test ID
  const getResultsForTest = (testId) => {
    if (!Array.isArray(allResults)) return [];
    return allResults.filter((result) => result.record_test_id === testId);
  };

  return (
    <>
      <div className="bg-nblack border border-pink rounded-lg p-4">
        {record.tests && record.tests.length > 0 ? (
          <div className="space-y-4">
            {record.tests.map((test, idx) => {
              const testResults = getResultsForTest(test.id);

              return (
                <div
                  key={test.id}
                  className="bg-neutral-900/50 border border-white rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-left gap-2 mb-1">
                        <span className="text-neutral-400 text-sm">
                          #{idx + 1}
                        </span>
                        <h5 className="font-medium text-white">
                          {test.test_title}
                        </h5>
                      </div>
                      {test.standard_code && (
                        <div className="text-xs text-white ">
                          {test.standard_code}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Display existing results for this test */}
                  {testResults && testResults.length > 0 ? (
                    <div className="space-y-2 mt-3 border-t border-neutral-700 pt-3">
                      {testResults.map((result) => (
                        <div
                          key={result.id}
                          className="bg-neutral-800/50 border border-pink rounded p-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-white">
                                  {result.result_value} {result.result_unit}
                                </span>
                                <span className="text-neutral-500">
                                  {" "}
                                  :جواب{" "}
                                </span>
                              </div>
                              {result.uncertainty && (
                                <div>
                                  <span className="text-neutral-500">
                                    عدم قطعیت:{" "}
                                  </span>
                                  <span className="text-white">
                                    {result.uncertainty}
                                  </span>
                                </div>
                              )}
                              {result.acceptance_range && (
                                <div>
                                  <span className="text-neutral-500">
                                    محدوده:{" "}
                                  </span>
                                  <span className="text-white">
                                    {result.acceptance_range}
                                  </span>
                                </div>
                              )}
                              {result.declaration_of_conformity && (
                                <div className="col-span-2">
                                  <span className="text-neutral-500">
                                    انطباق:{" "}
                                  </span>
                                  <span className="text-white">
                                    {result.declaration_of_conformity}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="text-neutral-500">
                                  تاریخ:{" "}
                                </span>
                                <span className="text-white">
                                  {new Date(
                                    result.test_date,
                                  ).toLocaleDateString("fa-IR")}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs ${
                                    result.passed
                                      ? "bg-green-900/30 text-green-400"
                                      : "bg-gray-700 text-black"
                                  }`}
                                >
                                  {result.passed ? "موفق" : "ناموفق"}
                                </span>
                              </div>
                            </div>
                          </div>
                          {result.observations && (
                            <div className="mt-2 text-xs text-neutral-400 italic">
                              💬 {result.observations}
                            </div>
                          )}
                          {result.test_method_description && (
                            <div className="mt-2 text-xs text-neutral-400">
                              <span className="text-neutral-500">روش: </span>
                              {result.test_method_description}
                            </div>
                          )}
                          {result.environmental_conditions && (
                            <div className="mt-1 text-xs text-neutral-400">
                              <span className="text-neutral-500">شرایط: </span>
                              {result.environmental_conditions}
                            </div>
                          )}
                          {result.result_files &&
                            result.result_files.length > 0 && (
                              <div className="mt-2 flex gap-2 flex-wrap">
                                {result.result_files.map((fileUrl, fileIdx) => (
                                  <a
                                    key={fileIdx}
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 bg-neutral-700/50 px-2 py-1 rounded"
                                  >
                                    📎 فایل {fileIdx + 1}
                                  </a>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-neutral-500 text-sm py-4 border-t border-neutral-700 mt-3">
                      هنوز جوابی ثبت نشده است
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-neutral-500 py-8">
            هیچ آزمونی یافت نشد
          </div>
        )}
      </div>
    </>
  );
};

export default ReceptionTestResults;
