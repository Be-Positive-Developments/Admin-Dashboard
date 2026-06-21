import axiosInstance from "@/lib/axiosInstance";

const BLOOD_TYPE_MAP = {
  "bt-apos": "A+",
  "bt-aneg": "A-",
  "bt-bpos": "B+",
  "bt-bneg": "B-",
  "bt-abpos": "AB+",
  "bt-abneg": "AB-",
  "bt-opos": "O+",
  "bt-oneg": "O-",
  "bt-ominus": "O-",
};

const DEFAULT_BLOOD_TYPES = Object.entries(BLOOD_TYPE_MAP).map(
  ([id, label]) => ({
    id,
    label,
  }),
);

const unwrapPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const statusCode = payload?.statusCode ?? payload?.StatusCode;
  const success = payload?.success ?? payload?.Success;

  if (
    (typeof statusCode === "number" && statusCode >= 400) ||
    success === false
  ) {
    return payload;
  }

  return (
    payload?.data ??
    payload?.result ??
    payload?.value ??
    payload?.results ??
    payload
  );
};

const readField = (obj, ...keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
};

const readFirstNumber = (obj, keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
};

const normalizeLookupItem = (item, fallbackLabel = "—") => {
  if (typeof item === "string" || typeof item === "number") {
    return {
      id: String(item),
      label: String(item),
      raw: item,
    };
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const id = readField(
    item,
    "id",
    "Id",
    "hospitalId",
    "HospitalId",
    "bloodTypeId",
    "BloodTypeId",
    "bloodtypeid",
  );

  if (!id) {
    return null;
  }

  const label =
    readField(
      item,
      "name",
      "Name",
      "label",
      "Label",
      "hospitalName",
      "HospitalName",
      "bloodTypeName",
      "BloodTypeName",
      "typename",
      "typeName",
      "Typename",
      "type",
      "Type",
      "code",
      "Code",
    ) ||
    BLOOD_TYPE_MAP[String(id).toLowerCase()] ||
    fallbackLabel;

  return {
    id: String(id),
    label: String(label),
    raw: item,
  };
};

const normalizeLookupList = (payload, fallbackItems = []) => {
  const resolvedPayload = unwrapPayload(payload);

  const directCandidate =
    (Array.isArray(resolvedPayload) && resolvedPayload) ||
    resolvedPayload?.value ||
    resolvedPayload?.Value ||
    resolvedPayload?.items ||
    resolvedPayload?.Items ||
    resolvedPayload?.records ||
    resolvedPayload?.Records ||
    resolvedPayload?.results ||
    resolvedPayload?.Results ||
    resolvedPayload?.hospitals ||
    resolvedPayload?.Hospitals ||
    resolvedPayload?.bloodTypes ||
    resolvedPayload?.BloodTypes ||
    resolvedPayload?.data ||
    resolvedPayload?.Data ||
    [];

  const nestedCandidate =
    directCandidate && typeof directCandidate === "object"
      ? directCandidate?.items ||
        directCandidate?.Items ||
        directCandidate?.records ||
        directCandidate?.Records ||
        directCandidate?.results ||
        directCandidate?.Results ||
        directCandidate?.hospitals ||
        directCandidate?.Hospitals ||
        directCandidate?.bloodTypes ||
        directCandidate?.BloodTypes
      : undefined;

  const candidate = Array.isArray(directCandidate)
    ? directCandidate
    : nestedCandidate;

  const items = (Array.isArray(candidate) ? candidate : [])
    .map((item) => normalizeLookupItem(item))
    .filter(Boolean);

  return items.length > 0 ? items : fallbackItems;
};

const ADMIN_REQUESTS_QUERY_KEYS = [
  "hospitalId",
  "bloodTypeId",
  "status",
  "urgencyLevel",
  "search",
  "page",
  "limit",
];

const REQUEST_STATUS_VALUES = ["Open", "Fulfilled", "Cancelled", "Expired"];
const URGENCY_LEVEL_VALUES = ["Routine", "Urgent", "Critical"];

const normalizeEnumValue = (value, allowedValues) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const match = allowedValues.find(
    (allowed) => allowed.toLowerCase() === String(value).toLowerCase(),
  );

  return match ?? String(value);
};

export const buildAdminRequestsQueryParams = (params = {}) => {
  const queryParams = { page: 1, limit: 10 };

  for (const key of ADMIN_REQUESTS_QUERY_KEYS) {
    const value = params?.[key];

    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (key === "status") {
      queryParams.status = normalizeEnumValue(value, REQUEST_STATUS_VALUES);
      continue;
    }

    if (key === "urgencyLevel") {
      queryParams.urgencyLevel = normalizeEnumValue(
        value,
        URGENCY_LEVEL_VALUES,
      );
      continue;
    }

    if (key === "page" || key === "limit") {
      const numericValue = Number(value);
      if (Number.isFinite(numericValue) && numericValue > 0) {
        queryParams[key] = numericValue;
      }
      continue;
    }

    queryParams[key] = String(value).trim();
  }

  return queryParams;
};

const extractRequestsCandidate = (resolvedPayload) => {
  if (!resolvedPayload || typeof resolvedPayload !== "object") {
    return [];
  }

  if (Array.isArray(resolvedPayload)) {
    return resolvedPayload;
  }

  const directCandidate =
    resolvedPayload?.requests ??
    resolvedPayload?.Requests ??
    resolvedPayload?.bloodRequests ??
    resolvedPayload?.BloodRequests ??
    resolvedPayload?.items ??
    resolvedPayload?.Items ??
    resolvedPayload?.records ??
    resolvedPayload?.Records ??
    resolvedPayload?.results ??
    resolvedPayload?.Results;

  if (Array.isArray(directCandidate)) {
    return directCandidate;
  }

  const nestedData = resolvedPayload?.data ?? resolvedPayload?.Data;
  if (Array.isArray(nestedData)) {
    return nestedData;
  }

  if (nestedData && typeof nestedData === "object") {
    const nestedCandidate =
      nestedData?.requests ??
      nestedData?.Requests ??
      nestedData?.bloodRequests ??
      nestedData?.BloodRequests ??
      nestedData?.items ??
      nestedData?.Items ??
      nestedData?.records ??
      nestedData?.Records ??
      nestedData?.results ??
      nestedData?.Results;

    if (Array.isArray(nestedCandidate)) {
      return nestedCandidate;
    }
  }

  return [];
};

const extractPaginationMeta = (
  resolvedPayload,
  requestsLength,
  fallbackLimit,
) => {
  const metaSources = [resolvedPayload];

  const nestedData = resolvedPayload?.data ?? resolvedPayload?.Data;
  if (
    nestedData &&
    typeof nestedData === "object" &&
    !Array.isArray(nestedData)
  ) {
    metaSources.push(nestedData);
  }

  let total;
  let page;
  let limit;
  let totalPages;

  for (const source of metaSources) {
    total ??= readFirstNumber(source, [
      "total",
      "totalCount",
      "totalcount",
      "totalItems",
      "totalitems",
      "count",
      "Count",
    ]);
    page ??= readFirstNumber(source, ["page", "Page"]);
    limit ??= readFirstNumber(source, ["limit", "Limit", "pageSize"]);
    totalPages ??= readFirstNumber(source, ["totalPages", "totalpages"]);
  }

  const resolvedLimit = limit ?? fallbackLimit;
  const resolvedTotal = total ?? requestsLength;
  const resolvedPage = page ?? 1;
  const resolvedTotalPages =
    totalPages ??
    (resolvedTotal ? Math.ceil(resolvedTotal / resolvedLimit) : 1);

  return {
    total: resolvedTotal,
    page: resolvedPage,
    limit: resolvedLimit,
    totalPages: resolvedTotalPages,
    hasNextPage:
      resolvedPayload?.hasNextPage ?? nestedData?.hasNextPage ?? undefined,
    hasPreviousPage:
      resolvedPayload?.hasPreviousPage ??
      nestedData?.hasPreviousPage ??
      undefined,
  };
};

export const mapBloodTypeIdToLabel = (bloodTypeId) => {
  if (!bloodTypeId) return "—";
  const key = String(bloodTypeId).toLowerCase();
  return BLOOD_TYPE_MAP[key] || String(bloodTypeId);
};

export const formatRelativeTime = (dateString, locale = "en") => {
  if (!dateString) return "—";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const absSec = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (absSec < 60) return rtf.format(diffSec, "second");
  if (absSec < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (absSec < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (absSec < 2592000) return rtf.format(Math.round(diffSec / 86400), "day");
  return rtf.format(Math.round(diffSec / 2592000), "month");
};

export const getStatusStyles = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "open") {
    return { text: "text-green-600", dot: "bg-green-600" };
  }
  if (normalized === "fulfilled") {
    return { text: "text-blue-600", dot: "bg-blue-600" };
  }
  if (normalized === "cancelled") {
    return { text: "text-red-600", dot: "bg-red-600" };
  }
  if (normalized === "expired") {
    return { text: "text-amber-600", dot: "bg-amber-600" };
  }

  return { text: "text-gray-600", dot: "bg-gray-600" };
};

export const getUrgencyBadgeClass = (urgency) => {
  const normalized = String(urgency || "").toLowerCase();

  if (normalized === "critical") {
    return "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400";
  }
  if (normalized === "urgent") {
    return "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400";
  }

  return "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400";
};

export const normalizeRequest = (raw, locale = "en") => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const id = readField(raw, "id", "Id");
  const status = readField(raw, "status", "Status") || "Open";
  const urgency =
    readField(raw, "urgencyLevel", "urgencylevel", "UrgencyLevel") || "Routine";

  const bloodTypeName = readField(
    raw,
    "bloodTypeName",
    "bloodtypename",
    "typename",
    "typeName",
    "bloodType",
    "BloodType",
  );
  const bloodTypeId = readField(
    raw,
    "bloodTypeId",
    "bloodtypeid",
    "BloodTypeId",
  );
  const bloodType = bloodTypeName || mapBloodTypeIdToLabel(bloodTypeId);

  const hospitalName =
    readField(raw, "hospitalName", "hospitalname", "HospitalName") ||
    readField(raw?.hospital, "name", "Name", "hospitalName") ||
    "—";

  const patientName = readField(
    raw,
    "patientName",
    "patientname",
    "patient",
    "Patient",
  );

  const note = readField(raw, "note", "Note");
  const title =
    readField(raw, "title", "Title") ||
    (note
      ? String(note).split("\n")[0].slice(0, 80)
      : `${bloodType} — ${hospitalName}`);

  const createdAt = readField(
    raw,
    "createdAt",
    "createdat",
    "postedAt",
    "dateCreated",
    "DateCreated",
  );

  const donors =
    readFirstNumber(raw, [
      "quantityFulfilled",
      "quantityfulfilled",
      "fulfilledCount",
      "fulfilledcount",
      "donorsCount",
      "donorscount",
    ]) ?? 0;

  const required =
    readFirstNumber(raw, [
      "quantityRequired",
      "quantityrequired",
      "requiredCount",
      "requiredcount",
    ]) ?? 1;

  let tags = raw?.tags ?? raw?.Tags;
  if (!Array.isArray(tags) || tags.length === 0) {
    tags = [urgency, bloodType].filter((tag) => tag && tag !== "—");
  }

  return {
    id,
    title,
    hospital: hospitalName,
    patient: patientName || "—",
    urgency,
    bloodType,
    posted: formatRelativeTime(createdAt, locale),
    postedAt: createdAt,
    status,
    donors,
    required: required || 1,
    tags,
    note: note || "",
    deadline: readField(raw, "deadline", "Deadline"),
  };
};

const normalizeRequestList = (payload, locale = "en") => {
  const resolvedPayload = unwrapPayload(payload);
  const requestsCandidate = extractRequestsCandidate(resolvedPayload);

  const requests = requestsCandidate
    .map((item) => normalizeRequest(item, locale))
    .filter(Boolean);

  const pagination = extractPaginationMeta(
    resolvedPayload,
    requests.length,
    10,
  );

  return {
    requests,
    ...pagination,
  };
};

/**
 * Cases service — admin blood request endpoints.
 */

/**
 * @param {{ page?: number, limit?: number, status?: string, search?: string, urgencyLevel?: string, bloodTypeId?: string, hospitalId?: string }} params
 * @param {string} [locale]
 */
export const getCases = async (params = {}, locale = "en") => {
  const queryParams = buildAdminRequestsQueryParams(params);

  const { data } = await axiosInstance.get("/admin/requests", {
    params: queryParams,
  });

  return normalizeRequestList(data, locale);
};

/**
 * @param {string | number} id
 * @param {string} [locale]
 */
export const getCaseById = async (id, locale = "en") => {
  const { data } = await axiosInstance.get(`/admin/requests/${id}`);
  const resolved = unwrapPayload(data);
  return normalizeRequest(resolved, locale);
};

/**
 * @returns {Promise<object>}
 */
export const getCaseStats = async () => {
  const { data } = await axiosInstance.get("/admin/requests/stats");
  return unwrapPayload(data);
};

/**
 * @returns {Promise<object[]>}
 */
export const getCaseHospitals = async () => {
  const { data } = await axiosInstance.get("/admin/hospitals", {
    params: {
      status: "Active",
      page: 1,
      limit: 100,
    },
  });
  return normalizeLookupList(data);
};

/**
 * @returns {Promise<object[]>}
 */
export const getBloodTypes = async () => {
  const { data } = await axiosInstance.get("/locations/blood-types");
  return normalizeLookupList(data, DEFAULT_BLOOD_TYPES);
};
