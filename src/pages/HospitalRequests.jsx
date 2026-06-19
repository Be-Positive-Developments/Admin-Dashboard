import React, { useEffect, useMemo, useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "react-i18next";
import {
  useGetHospitals,
  useGetHospitalById,
  useGetHospitalStats,
  useActivateHospital,
  useRejectHospital,
} from "@/hooks/queries/useHospitals";
import {
  getHospitalStatusStyles,
  getHospitalStatusTranslationKey,
  formatHospitalLocation,
} from "@/services/hospitals.service";
import {
  Search,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Clock,
  MapPin,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const STATUS_FILTERS = [
  { value: "UnderReview", labelKey: "pending" },
  { value: "Active", labelKey: "active" },
  { value: "Suspended", labelKey: "suspended" },
  { value: "All", labelKey: "all" },
];

const mapFilterToApiStatus = (filter) => {
  if (filter === "All") return undefined;
  return filter;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toISOString().split("T")[0];
};

const formatPhone = (phone) => {
  if (!phone) return "-";
  const normalized = String(phone);
  return normalized.startsWith("+") ? normalized : `+${normalized}`;
};

function StatCard({ label, value, icon: Icon, accentClass }) {
  return (
    <div className="bg-white dark:bg-[#171921] rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm p-4 flex items-center gap-4">
      <div
        className={clsx(
          "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
          accentClass,
        )}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );
}

function HospitalDetailModal({ hospitalId, onClose, t, isRtl, locale }) {
  const {
    data: hospital,
    isLoading,
    isError,
    refetch,
  } = useGetHospitalById(hospitalId);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const statusStyles = getHospitalStatusStyles(hospital?.status);

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
            {t("hospital_request_details", "Hospital Request Details")}
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
          ) : hospital ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {hospital.name || "-"}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("license_number", "License Number")}:{" "}
                      {hospital.licenseNumber || "-"}
                    </p>
                  </div>
                </div>
                <span
                  className={clsx(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0",
                    statusStyles.badge,
                  )}
                >
                  {t(
                    getHospitalStatusTranslationKey(hospital.status),
                    hospital.status,
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Mail size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {t("email", "Email Address")}
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5 break-all">
                      {hospital.email || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {t("phone_number", "Phone Number")}
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                      {formatPhone(hospital.phone)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {t("location", "Location")}
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                      {formatHospitalLocation(
                        hospital.city,
                        hospital.governorate,
                        locale,
                      ) || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {t("submitted", "Submitted")}
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                      {formatDate(hospital.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {(hospital.latitude != null || hospital.longitude != null) && (
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("coordinates", "Coordinates")}
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                    {hospital.latitude ?? "-"}, {hospital.longitude ?? "-"}
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>

        <div
          className={clsx(
            "px-6 py-4 border-t border-gray-100 dark:border-[#262833] bg-gray-50 dark:bg-[#0f1117] flex",
            isRtl ? "justify-start" : "justify-end",
          )}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {t("close", "Close")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function HospitalRequestsPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t("hospital_requests", "Hospital Requests"));
  const isRtl = i18n.dir() === "rtl";

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("UnderReview");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const { mutateAsync: activateHospitalAsync, isPending: isActivating } =
    useActivateHospital();
  const { mutateAsync: rejectHospitalAsync, isPending: isRejecting } =
    useRejectHospital();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(mapFilterToApiStatus(statusFilter)
        ? { status: mapFilterToApiStatus(statusFilter) }
        : {}),
    }),
    [page, pageSize, statusFilter],
  );

  const {
    data: hospitalsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetHospitals(queryParams);
  const { data: stats } = useGetHospitalStats();

  const hospitals = useMemo(() => {
    const apiHospitals = hospitalsResponse?.hospitals ?? [];

    if (!debouncedSearchTerm) {
      return apiHospitals;
    }

    const query = debouncedSearchTerm.toLowerCase();
    return apiHospitals.filter((hospital) => {
      const haystack = [
        hospital.name,
        hospital.licenseNumber,
        hospital.email,
        hospital.phone,
        formatHospitalLocation(hospital.city, hospital.governorate, "en"),
        formatHospitalLocation(hospital.city, hospital.governorate, "ar"),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [hospitalsResponse, debouncedSearchTerm]);

  const totalCount = hospitalsResponse?.totalcount ?? hospitals.length;
  const filteredCount = debouncedSearchTerm
    ? hospitals.length
    : (hospitalsResponse?.filteredcount ?? totalCount);
  const startItem = filteredCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem =
    filteredCount > 0
      ? Math.min(startItem + hospitals.length - 1, filteredCount)
      : 0;

  const canGoPrevious = hospitalsResponse?.hasPreviousPage ?? page > 1;
  const canGoNext =
    hospitalsResponse?.hasNextPage ??
    (debouncedSearchTerm ? false : endItem < filteredCount);

  const handleConfirmAction = async () => {
    if (!confirmAction || isActivating || isRejecting) return;

    const { type, hospital } = confirmAction;

    try {
      if (type === "accept") {
        await activateHospitalAsync(hospital.id);
        toast.success(
          t("hospital_accepted", "Hospital request accepted successfully."),
        );
      } else {
        await rejectHospitalAsync(hospital.id);
        toast.success(
          t("hospital_rejected", "Hospital request rejected successfully."),
        );
      }
      setConfirmAction(null);
    } catch {
      toast.error(
        type === "accept"
          ? t("failed_to_accept_hospital", "Failed to accept hospital request.")
          : t(
              "failed_to_reject_hospital",
              "Failed to reject hospital request.",
            ),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("hospital_requests", "Hospital Requests")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t(
              "hospital_requests_desc",
              "Review and approve hospital registration requests before they join the system.",
            )}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("total_hospitals", "Total Hospitals")}
          value={stats?.total ?? "-"}
          icon={Building2}
          accentClass="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
        />
        <StatCard
          label={t("pending_requests", "Pending Requests")}
          value={stats?.underReview ?? "-"}
          icon={Clock}
          accentClass="bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400"
        />
        <StatCard
          label={t("active_hospitals", "Active Hospitals")}
          value={stats?.active ?? "-"}
          icon={CheckCircle}
          accentClass="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
        />
        <StatCard
          label={t("suspended_hospitals", "Suspended Hospitals")}
          value={stats?.suspended ?? "-"}
          icon={XCircle}
          accentClass="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#171921] p-4 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                statusFilter === filter.value
                  ? "bg-red-700 text-white border-red-700"
                  : "bg-gray-50 dark:bg-[#1c1e27] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#262833] hover:bg-gray-100 dark:hover:bg-[#262833]",
              )}
            >
              {t(filter.labelKey, filter.value)}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-md">
          <Search
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
              isRtl ? "right-3" : "left-3",
            )}
          />
          <input
            type="text"
            placeholder={t(
              "search_hospitals",
              "Search by name, license, or email...",
            )}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className={clsx(
              "w-full py-2 text-sm bg-gray-50 dark:bg-[#1c1e27] border border-gray-200 dark:border-[#262833] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:text-gray-200",
              isRtl ? "pr-10 pl-4" : "pl-10 pr-4",
            )}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#171921] rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className={clsx(
              "w-full text-sm text-gray-500 dark:text-gray-400",
              isRtl ? "text-right" : "text-left",
            )}
          >
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-[#0f1117] border-b border-gray-100 dark:border-[#262833]">
              <tr>
                <th scope="col" className="px-6 py-3">
                  {t("hospital", "Hospital")}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t("license_number", "License Number")}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t("location", "Location")}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t("status", "Status")}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t("submitted", "Submitted")}
                </th>
                <th
                  scope="col"
                  className={clsx(
                    "px-6 py-3",
                    isRtl ? "text-left" : "text-right",
                  )}
                >
                  {t("actions", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    {t("loading_hospitals", "Loading hospital requests...")}
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <AlertCircle
                      size={24}
                      className="mx-auto text-red-500 mb-2"
                    />
                    <p className="text-red-500 mb-3">
                      {t(
                        "failed_to_load_hospitals",
                        "Failed to load hospital requests.",
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="inline-flex items-center gap-2 text-sm text-red-700 dark:text-red-400 hover:underline"
                    >
                      <RefreshCw size={14} />
                      {t("retry", "Retry")}
                    </button>
                  </td>
                </tr>
              ) : hospitals.length > 0 ? (
                hospitals.map((hospital) => {
                  const statusStyles = getHospitalStatusStyles(hospital.status);
                  const isPending =
                    String(hospital.status).toLowerCase() === "underreview";

                  return (
                    <tr
                      key={hospital.id}
                      className="bg-white dark:bg-[#171921] border-b border-gray-50 dark:border-[#262833] hover:bg-gray-50 dark:hover:bg-[#1c1e27] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {hospital.name || "-"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {hospital.email || "-"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatPhone(hospital.phone)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                          <FileText size={14} className="text-gray-400" />
                          {hospital.licenseNumber || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {formatHospitalLocation(
                          hospital.city,
                          hospital.governorate,
                          i18n.language,
                        ) || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            statusStyles.badge,
                          )}
                        >
                          <span
                            className={clsx(
                              "h-1.5 w-1.5 rounded-full",
                              statusStyles.dot,
                            )}
                          />
                          {t(
                            getHospitalStatusTranslationKey(hospital.status),
                            hospital.status,
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDate(hospital.createdAt)}
                      </td>
                      <td
                        className={clsx(
                          "px-6 py-4",
                          isRtl ? "text-left" : "text-right",
                        )}
                      >
                        <div
                          className={clsx(
                            "flex items-center gap-2 flex-wrap",
                            isRtl ? "justify-start" : "justify-end",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedHospitalId(hospital.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
                          >
                            <Eye size={14} />
                            {t("view_details", "View Details")}
                          </button>
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmAction({ type: "accept", hospital })
                                }
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950 rounded transition-colors"
                              >
                                <CheckCircle size={14} />
                                {t("accept", "Accept")}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmAction({ type: "reject", hospital })
                                }
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                              >
                                <XCircle size={14} />
                                {t("reject", "Reject")}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    {t(
                      "no_hospitals_found",
                      "No hospital requests found matching your filters.",
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#262833] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredCount > 0
              ? t("showing_results", "Showing {{start}}–{{end}} of {{total}}", {
                  start: startItem,
                  end: endItem,
                  total: filteredCount,
                })
              : t("no_results", "No results")}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canGoPrevious}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-[#262833] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1c1e27] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t("previous", "Previous")}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("page", "Page")} {page}
            </span>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-[#262833] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1c1e27] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t("next", "Next")}
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedHospitalId && (
          <HospitalDetailModal
            hospitalId={selectedHospitalId}
            onClose={() => setSelectedHospitalId(null)}
            t={t}
            isRtl={isRtl}
            locale={i18n.language}
          />
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AlertDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "accept"
                ? t("accept_hospital", "Accept Hospital Request")
                : t("reject_hospital", "Reject Hospital Request")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "accept"
                ? t(
                    "accept_hospital_confirm",
                    "Are you sure you want to accept {{name}}? They will be able to access the system as an active hospital.",
                    { name: confirmAction?.hospital?.name || "" },
                  )
                : t(
                    "reject_hospital_confirm",
                    "Are you sure you want to reject {{name}}? Their request will be marked as suspended.",
                    { name: confirmAction?.hospital?.name || "" },
                  )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActivating || isRejecting}>
              {t("cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={isActivating || isRejecting}
              className={clsx(
                confirmAction?.type === "reject" &&
                  "bg-red-700 hover:bg-red-800 focus:ring-red-500",
              )}
            >
              {confirmAction?.type === "accept"
                ? t("accept", "Accept")
                : t("reject", "Reject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
