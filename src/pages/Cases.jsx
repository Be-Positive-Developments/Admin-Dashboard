import React, { useEffect, useMemo, useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "react-i18next";
import {
  useGetCases,
  useGetCaseById,
  useGetCaseHospitals,
  useGetBloodTypes,
} from "@/hooks/queries/useCases";
import {
  getStatusStyles,
  getUrgencyBadgeClass,
  formatRelativeTime,
} from "@/services/cases.service";
import {
  Plus,
  Search,
  Tag,
  MoreHorizontal,
  Clock,
  User,
  Heart,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";

const STATUS_FILTERS = ["All", "Open", "Fulfilled", "Cancelled", "Expired"];

const mapFilterToApiStatus = (filter) => {
  if (filter === "All") return undefined;
  return filter;
};

const getStatusTranslationKey = (status) => String(status || "").toLowerCase();

const getUrgencyTranslationKey = (urgency) => {
  const normalized = String(urgency || "").toLowerCase();
  if (normalized === "urgent") return "urgent";
  if (normalized === "routine") return "routine";
  return normalized;
};

const getCasesLoadErrorMessage = (error) => {
  const status = error?.response?.status;
  const backendMessage =
    error?.response?.data?.message ??
    error?.response?.data?.Message ??
    error?.message;

  if (status && backendMessage) {
    return `Failed to load cases (${status}): ${backendMessage}`;
  }

  if (status) {
    return `Failed to load cases (${status})`;
  }

  return backendMessage || "An error occurred.";
};

const DEFAULT_PAGE_SIZE = 10;

const getLookupErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  const backendMessage =
    error?.response?.data?.message ??
    error?.response?.data?.Message ??
    error?.message;

  if (status && backendMessage) {
    return `${fallback} (${status}): ${backendMessage}`;
  }

  return backendMessage || fallback;
};

function CaseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#171921] rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm flex flex-col animate-pulse">
      <div className="p-5 flex-1 space-y-4">
        <div className="flex justify-between">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="px-5 py-3 bg-gray-50 dark:bg-[#0f1117] border-t border-gray-100 dark:border-[#262833] rounded-b-xl flex justify-between">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

function CaseDetailModal({ caseId, onClose, locale, t, isRtl }) {
  const {
    data: caseDetail,
    isLoading,
    isError,
    refetch,
  } = useGetCaseById(caseId, locale);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const statusStyles = getStatusStyles(caseDetail?.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#171921] rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#262833] flex justify-between items-center bg-gray-50 dark:bg-[#0f1117]">
          <h3 className="font-bold text-gray-900 dark:text-gray-100">
            {t("case_details", "Case Details")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ) : isError ? (
            <div className="text-center py-6">
              <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t("error_occurred", "An error occurred.")}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 text-sm text-red-700 dark:text-red-400 hover:underline"
              >
                <RefreshCw size={14} />
                {t("retry", "Retry")}
              </button>
            </div>
          ) : caseDetail ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {caseDetail.title}
                </h4>
                <span
                  className={clsx(
                    "px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide shrink-0",
                    getUrgencyBadgeClass(caseDetail.urgency),
                  )}
                >
                  {t(
                    getUrgencyTranslationKey(caseDetail.urgency),
                    caseDetail.urgency,
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("patient_hospital", "Patient / Hospital")}
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                    {caseDetail.patient}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {caseDetail.hospital}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("blood_type", "Blood Type")}
                  </span>
                  <p className="font-bold text-red-700 dark:text-red-400 mt-0.5">
                    {caseDetail.bloodType}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("status", "Status")}
                  </span>
                  <p
                    className={clsx(
                      "font-semibold mt-0.5 flex items-center gap-1.5",
                      statusStyles.text,
                    )}
                  >
                    <span
                      className={clsx(
                        "h-1.5 w-1.5 rounded-full",
                        statusStyles.dot,
                      )}
                    />
                    {t(
                      getStatusTranslationKey(caseDetail.status),
                      caseDetail.status,
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("posted", "Posted")}
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                    {caseDetail.postedAt
                      ? formatRelativeTime(caseDetail.postedAt, locale)
                      : caseDetail.posted}
                  </p>
                </div>
              </div>

              {caseDetail.note ? (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("note", "Note")}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                    {caseDetail.note}
                  </p>
                </div>
              ) : null}

              {caseDetail.deadline ? (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("deadline", "Deadline")}
                  </span>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {new Date(caseDetail.deadline).toLocaleString(
                      isRtl ? "ar-EG" : locale,
                    )}
                  </p>
                </div>
              ) : null}

              <div className="pt-3 border-t border-gray-100 dark:border-[#262833]">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>{t("progress", "Progress")}</span>
                  <span>
                    {caseDetail.donors} / {caseDetail.required}{" "}
                    {t("donors_count", "donors")}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{
                      width: `${Math.min((caseDetail.donors / caseDetail.required) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#262833] bg-gray-50 dark:bg-[#0f1117] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1c1e27] rounded-lg transition-colors"
          >
            {t("close", "Close")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CasesPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t("cases", "Cases"));
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedBloodTypeId, setSelectedBloodTypeId] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const limit = DEFAULT_PAGE_SIZE;

  const locale = i18n.language?.startsWith("ar") ? "ar" : "en";
  const isRtl = i18n.dir() === "rtl";
  const {
    data: hospitals = [],
    isLoading: isLoadingHospitals,
    isError: isHospitalsError,
    error: hospitalsError,
  } = useGetCaseHospitals();
  const {
    data: bloodTypes = [],
    isLoading: isLoadingBloodTypes,
    isError: isBloodTypesError,
    error: bloodTypesError,
  } = useGetBloodTypes();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [filter, debouncedSearchTerm, selectedHospitalId, selectedBloodTypeId]);

  useEffect(() => {
    if (!selectedHospitalId && hospitals.length > 0) {
      setSelectedHospitalId(hospitals[0].id);
    }
  }, [hospitals, selectedHospitalId]);

  useEffect(() => {
    if (!selectedBloodTypeId && bloodTypes.length > 0) {
      setSelectedBloodTypeId(bloodTypes[0].id);
    }
  }, [bloodTypes, selectedBloodTypeId]);

  const apiParams = useMemo(
    () => ({
      page,
      limit,
      hospitalId: selectedHospitalId,
      bloodTypeId: selectedBloodTypeId,
      ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
      ...(mapFilterToApiStatus(filter)
        ? { status: mapFilterToApiStatus(filter) }
        : {}),
    }),
    [
      page,
      limit,
      selectedHospitalId,
      selectedBloodTypeId,
      debouncedSearchTerm,
      filter,
    ],
  );

  const canLoadCases = Boolean(selectedHospitalId && selectedBloodTypeId);
  const isLoadingLookups = isLoadingHospitals || isLoadingBloodTypes;
  const lookupError = isHospitalsError
    ? getLookupErrorMessage(
        hospitalsError,
        "Failed to load hospitals for cases",
      )
    : isBloodTypesError
      ? getLookupErrorMessage(
          bloodTypesError,
          "Failed to load blood types for cases",
        )
      : null;

  const {
    data: casesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCases(apiParams, locale, { enabled: canLoadCases });

  const cases = casesResponse?.requests ?? [];
  const totalPages = casesResponse?.totalPages ?? 1;
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("cases_overview", "Cases Overview")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t("cases_desc", "Manage blood donation requests and urgencies.")}
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          {t("add_new_case", "Add New Case")}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                filter === status
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                  : "bg-white dark:bg-[#171921] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#262833] hover:bg-gray-50 dark:hover:bg-[#1c1e27]",
              )}
            >
              {status === "All"
                ? t("all", "All")
                : t(getStatusTranslationKey(status), status)}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <select
            value={selectedHospitalId}
            onChange={(event) => setSelectedHospitalId(event.target.value)}
            disabled={isLoadingHospitals || hospitals.length === 0}
            className="w-full sm:w-56 px-3 py-2 text-sm bg-white dark:bg-[#171921] border border-gray-200 dark:border-[#262833] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm dark:text-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <option value="">
              {isLoadingHospitals
                ? t("loading_case_hospitals", "Loading hospitals...")
                : t("select_case_hospital", "Select hospital")}
            </option>
            {hospitals.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.label}
              </option>
            ))}
          </select>

          <select
            value={selectedBloodTypeId}
            onChange={(event) => setSelectedBloodTypeId(event.target.value)}
            disabled={isLoadingBloodTypes || bloodTypes.length === 0}
            className="w-full sm:w-44 px-3 py-2 text-sm bg-white dark:bg-[#171921] border border-gray-200 dark:border-[#262833] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm dark:text-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <option value="">
              {isLoadingBloodTypes
                ? t("loading_blood_types", "Loading blood types...")
                : t("select_blood_type", "Select blood type")}
            </option>
            {bloodTypes.map((bloodType) => (
              <option key={bloodType.id} value={bloodType.id}>
                {bloodType.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
              isRtl ? "right-3" : "left-3",
            )}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t("search_cases", "Search cases...")}
            className={clsx(
              "w-full py-2 text-sm bg-white dark:bg-[#171921] border border-gray-200 dark:border-[#262833] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm dark:text-gray-200",
              isRtl ? "pr-10 pl-4" : "pl-10 pr-4",
            )}
          />
        </div>
      </div>

      {lookupError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={40} className="text-red-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-lg">
            {lookupError}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <RefreshCw size={16} />
            {t("retry", "Retry")}
          </button>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={40} className="text-red-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-lg">
            {getCasesLoadErrorMessage(error)}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <RefreshCw size={16} />
            {t("retry", "Retry")}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingLookups || !canLoadCases || isLoading ? (
              Array.from({ length: limit }).map((_, index) => (
                <CaseCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : cases.length > 0 ? (
              cases.map((item, index) => {
                const statusStyles = getStatusStyles(item.status);

                return (
                  <motion.div
                    key={item.id ?? index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-[#171921] rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={clsx(
                            "px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide",
                            getUrgencyBadgeClass(item.urgency),
                          )}
                        >
                          {t(
                            getUrgencyTranslationKey(item.urgency),
                            item.urgency,
                          )}
                        </span>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {item.hospital}
                      </p>

                      {item.tags?.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-50 dark:bg-[#1c1e27] text-xs text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-[#262833]"
                            >
                              <Tag size={10} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        {item.patient && item.patient !== "—" ? (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                            <User size={14} className="text-gray-400" />
                            <span>
                              {t("patient", "Patient")}:{" "}
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {item.patient}
                              </span>
                            </span>
                          </div>
                        ) : null}
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                          <Heart size={14} className="text-red-500" />
                          <span>
                            {t("blood_type", "Blood Type")}:{" "}
                            <span className="font-bold text-red-700 dark:text-red-400">
                              {item.bloodType}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span>
                            {t("posted", "Posted")}: {item.posted}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-[#262833]">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>{t("progress", "Progress")}</span>
                          <span>
                            {item.donors} / {item.required}{" "}
                            {t("donors_count", "donors")}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600 rounded-full"
                            style={{
                              width: `${Math.min((item.donors / item.required) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3 bg-gray-50 dark:bg-[#0f1117] border-t border-gray-100 dark:border-[#262833] rounded-b-xl flex justify-between items-center">
                      <div
                        className={clsx(
                          "text-xs font-semibold flex items-center gap-1.5",
                          statusStyles.text,
                        )}
                      >
                        <span
                          className={clsx(
                            "h-1.5 w-1.5 rounded-full",
                            statusStyles.dot,
                          )}
                        />
                        {t(getStatusTranslationKey(item.status), item.status)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCaseId(item.id)}
                        className="text-xs font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline"
                      >
                        {t("view_details", "View Details")}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {t("no_cases_found", "No cases found matching your search.")}
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("page", "Page")} {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => canGoPrevious && setPage((prev) => prev - 1)}
                  disabled={!canGoPrevious || isLoading}
                  className={clsx(
                    "px-3 py-1 text-sm border border-gray-200 dark:border-[#262833] rounded bg-white dark:bg-[#171921]",
                    !canGoPrevious || isLoading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1c1e27]",
                  )}
                >
                  {t("previous", "Previous")}
                </button>
                <button
                  type="button"
                  onClick={() => canGoNext && setPage((prev) => prev + 1)}
                  disabled={!canGoNext || isLoading}
                  className={clsx(
                    "px-3 py-1 text-sm border border-gray-200 dark:border-[#262833] rounded bg-white dark:bg-[#171921]",
                    !canGoNext || isLoading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1c1e27]",
                  )}
                >
                  {t("next", "Next")}
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      <AnimatePresence>
        {selectedCaseId ? (
          <CaseDetailModal
            caseId={selectedCaseId}
            onClose={() => setSelectedCaseId(null)}
            locale={locale}
            t={t}
            isRtl={isRtl}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
