import axiosInstance from "@/lib/axiosInstance";

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

const readField = (obj, keys, fallback = undefined) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return fallback;
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

const normalizeLocation = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return { id: null, nameEn: value, nameAr: value };
  }

  if (typeof value !== "object") {
    return null;
  }

  return {
    id: readField(value, ["id", "Id"]),
    nameEn: readField(value, [
      "nameen",
      "nameEn",
      "NameEn",
      "name",
      "Name",
      "cityname",
      "cityName",
      "CityName",
      "governoratename",
      "governorateName",
      "GovernorateName",
    ]),
    nameAr: readField(value, ["namear", "nameAr", "NameAr"]),
  };
};

export const getLocationDisplayName = (location, locale = "en") => {
  if (!location) return undefined;
  if (typeof location === "string") return location;

  const preferArabic = String(locale || "en").toLowerCase().startsWith("ar");
  const primary = preferArabic ? location.nameAr : location.nameEn;
  const fallback = preferArabic ? location.nameEn : location.nameAr;

  return primary || fallback || undefined;
};

export const formatHospitalLocation = (city, governorate, locale = "en") => {
  const parts = [
    getLocationDisplayName(city, locale),
    getLocationDisplayName(governorate, locale),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : undefined;
};

const normalizeHospitalRecord = (record) => {
  if (!record || typeof record !== "object") {
    return record;
  }

  return {
    id: readField(record, ["id", "Id", "hospitalId", "HospitalId"]),
    name: readField(record, [
      "hospitalname",
      "hospitalName",
      "HospitalName",
      "name",
      "Name",
    ]),
    licenseNumber: readField(record, [
      "licensenumber",
      "licenseNumber",
      "LicenseNumber",
    ]),
    email: readField(record, ["email", "Email"]),
    phone: readField(record, [
      "phonenumber",
      "phoneNumber",
      "PhoneNumber",
      "phone",
      "Phone",
    ]),
    city: normalizeLocation(readField(record, ["city", "City"])),
    governorate: normalizeLocation(
      readField(record, ["governorate", "Governorate"]),
    ),
    address: readField(record, ["address", "Address"]),
    status: readField(record, ["status", "Status"], "UnderReview"),
    latitude: readField(record, ["latitude", "Latitude"]),
    longitude: readField(record, ["longitude", "Longitude"]),
    createdAt: readField(record, [
      "createdat",
      "createdAt",
      "CreatedAt",
      "dateofcreation",
      "dateOfCreation",
      "DateOfCreation",
      "registeredat",
      "registeredAt",
      "RegisteredAt",
    ]),
  };
};

const normalizeHospitalList = (payload) => {
  const resolvedPayload = unwrapPayload(payload);

  if (Array.isArray(resolvedPayload)) {
    const hospitals = resolvedPayload.map(normalizeHospitalRecord);
    return {
      hospitals,
      totalcount: hospitals.length,
      filteredcount: hospitals.length,
    };
  }

  const hospitalsCandidate =
    resolvedPayload?.hospitals ??
    resolvedPayload?.Hospitals ??
    resolvedPayload?.items ??
    resolvedPayload?.Items ??
    resolvedPayload?.records ??
    resolvedPayload?.Records ??
    [];

  const hospitals = Array.isArray(hospitalsCandidate)
    ? hospitalsCandidate.map(normalizeHospitalRecord)
    : [];

  const totalcount = readFirstNumber(resolvedPayload, [
    "totalcount",
    "totalCount",
    "totalitems",
    "totalItems",
    "total",
    "Total",
    "count",
    "Count",
  ]);

  const filteredcount = readFirstNumber(resolvedPayload, [
    "filteredcount",
    "filteredCount",
    "filtered",
    "filteredTotal",
    "recordsFiltered",
    "matchedCount",
  ]);

  return {
    hospitals,
    totalcount: totalcount ?? hospitals.length,
    filteredcount: filteredcount ?? totalcount ?? hospitals.length,
    hasNextPage: resolvedPayload?.hasNextPage,
    hasPreviousPage: resolvedPayload?.hasPreviousPage,
    totalPages: resolvedPayload?.totalPages,
    page: readFirstNumber(resolvedPayload, ["page", "Page", "currentPage"]),
    limit: readFirstNumber(resolvedPayload, ["limit", "Limit", "pageSize"]),
  };
};

const normalizeHospitalStats = (payload) => {
  const resolvedPayload = unwrapPayload(payload);

  return {
    total:
      readFirstNumber(resolvedPayload, [
        "total",
        "Total",
        "totalcount",
        "totalCount",
      ]) ?? 0,
    active: readFirstNumber(resolvedPayload, ["active", "Active"]) ?? 0,
    suspended:
      readFirstNumber(resolvedPayload, ["suspended", "Suspended"]) ?? 0,
    underReview:
      readFirstNumber(resolvedPayload, [
        "underreview",
        "underReview",
        "UnderReview",
        "pending",
        "Pending",
      ]) ?? 0,
  };
};

/**
 * Fetch a paginated list of hospitals.
 * @param {{ status?: string, page?: number, limit?: number, pageSize?: number }} params
 */
export const getHospitals = async (params = {}) => {
  const { pageSize, ...rest } = params;
  const normalizedParams = {
    ...rest,
    page: rest.page ?? 1,
    limit: rest.limit ?? pageSize ?? 10,
  };

  if (!normalizedParams.status) {
    delete normalizedParams.status;
  }

  const { data } = await axiosInstance.get("/admin/hospitals", {
    params: normalizedParams,
  });

  return normalizeHospitalList(data);
};

/**
 * Fetch hospital statistics.
 */
export const getHospitalStats = async () => {
  const { data } = await axiosInstance.get("/admin/hospitals/stats");
  return normalizeHospitalStats(data);
};

/**
 * Fetch a single hospital by ID.
 * @param {string | number} id
 */
export const getHospitalById = async (id) => {
  const { data } = await axiosInstance.get(`/admin/hospitals/${id}`);
  return normalizeHospitalRecord(unwrapPayload(data));
};

/**
 * Activate (approve) a hospital join request.
 * @param {string | number} id
 */
export const activateHospital = async (id) => {
  const { data } = await axiosInstance.patch(`/admin/hospitals/${id}/activate`);
  return unwrapPayload(data);
};

/**
 * Reject a hospital join request by setting status to Suspended.
 * @param {string | number} id
 */
export const rejectHospital = async (id) => {
  const { data } = await axiosInstance.patch(`/admin/hospitals/${id}/status`, {
    status: "Suspended",
  });
  return unwrapPayload(data);
};

export const getHospitalStatusStyles = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "active") {
    return {
      badge:
        "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900",
      text: "text-green-700 dark:text-green-400",
      dot: "bg-green-500",
    };
  }

  if (normalized === "suspended") {
    return {
      badge:
        "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900",
      text: "text-red-700 dark:text-red-400",
      dot: "bg-red-500",
    };
  }

  return {
    badge:
      "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  };
};

export const getHospitalStatusTranslationKey = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "underreview") return "underreview";
  if (normalized === "active") return "active";
  if (normalized === "suspended") return "suspended";
  return normalized;
};
