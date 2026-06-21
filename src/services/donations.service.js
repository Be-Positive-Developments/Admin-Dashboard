import axiosInstance from "@/lib/axiosInstance";
import {
  unwrapPayload,
  readField,
  readFirstNumber,
  extractArrayCandidate,
  extractPaginationMeta,
  formatNumber,
  formatPercentChange,
  getTrendFromChange,
  formatRelativeTime,
  mapBloodTypeIdToLabel,
} from "@/lib/apiNormalize";

const DONOR_QUERY_KEYS = ["search", "bloodTypeId", "status", "page", "limit"];

const DONOR_STATUS_VALUES = ["Active", "Inactive", "Eligible", "Ineligible"];

const normalizeEnumValue = (value, allowedValues) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const match = allowedValues.find(
    (allowed) => allowed.toLowerCase() === String(value).toLowerCase(),
  );

  return match ?? String(value);
};

export const buildAdminDonorsQueryParams = (params = {}) => {
  const queryParams = { page: 1, limit: 10 };

  for (const key of DONOR_QUERY_KEYS) {
    const value = params?.[key];

    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (key === "status") {
      queryParams.status = normalizeEnumValue(value, DONOR_STATUS_VALUES);
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

export const normalizeDonor = (raw, locale = "en") => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const id = readField(raw, ["id", "Id", "donorId", "DonorId"]);
  const name =
    readField(raw, [
      "name",
      "Name",
      "fullName",
      "FullName",
      "donorName",
      "DonorName",
    ]) ||
    [
      readField(raw, ["firstName", "FirstName"]),
      readField(raw, ["lastName", "LastName"]),
    ]
      .filter(Boolean)
      .join(" ") ||
    "—";

  const bloodTypeName = readField(raw, [
    "bloodTypeName",
    "BloodTypeName",
    "bloodType",
    "BloodType",
  ]);
  const bloodTypeId = readField(raw, [
    "bloodTypeId",
    "BloodTypeId",
    "bloodtypeid",
  ]);
  const bloodType = bloodTypeName || mapBloodTypeIdToLabel(bloodTypeId);

  const isEligible = readField(raw, ["isEligible", "iseligible"]);
  const isAvailable = readField(raw, ["isAvailable", "isavailable"]);
  const status =
    readField(raw, ["status", "Status"]) ||
    (isEligible === false
      ? "Ineligible"
      : isAvailable === false
        ? "Unavailable"
        : "Eligible");
  const email = readField(raw, ["email", "Email"]);
  const phone = readField(raw, [
    "phone",
    "Phone",
    "phoneNumber",
    "PhoneNumber",
  ]);
  const lastDonationDate = readField(raw, [
    "lastDonationDate",
    "LastDonationDate",
    "lastDonatedAt",
    "LastDonatedAt",
  ]);
  const registeredAt = readField(raw, [
    "createdAt",
    "CreatedAt",
    "registeredAt",
    "RegisteredAt",
    "joinedAt",
    "JoinedAt",
  ]);
  const donationsCount =
    readFirstNumber(raw, [
      "donationsCount",
      "DonationsCount",
      "totalDonations",
      "TotalDonations",
      "donationCount",
      "DonationCount",
    ]) ?? 0;

  return {
    id,
    name,
    bloodType,
    status,
    email,
    phone,
    isEligible: isEligible === undefined ? undefined : Boolean(isEligible),
    isAvailable: isAvailable === undefined ? undefined : Boolean(isAvailable),
    donationsCount,
    lastDonationDate,
    registeredAt,
    dateLabel: lastDonationDate || registeredAt,
    relativeTime: formatRelativeTime(lastDonationDate || registeredAt, locale),
  };
};

const normalizeDonorList = (payload, locale = "en") => {
  const resolvedPayload = unwrapPayload(payload);
  const donorsCandidate = extractArrayCandidate(resolvedPayload, [
    "donors",
    "Donors",
    "items",
    "Items",
    "records",
    "Records",
    "results",
    "Results",
  ]);

  const donors = donorsCandidate
    .map((item) => normalizeDonor(item, locale))
    .filter(Boolean);

  const pagination = extractPaginationMeta(resolvedPayload, donors.length, 10);

  return {
    donors,
    ...pagination,
  };
};

const DONOR_STAT_DEFINITIONS = [
  {
    key: "totalDonors",
    titleKey: "total_donors",
    fields: ["totalDonors", "TotalDonors", "total", "Total", "count", "Count"],
    changeFields: [
      "totalDonorsChange",
      "TotalDonorsChange",
      "change",
      "Change",
    ],
    iconColor: "text-green-600 bg-green-50",
  },
  {
    key: "eligibleDonors",
    titleKey: "eligible_donors",
    fields: ["eligible", "Eligible", "eligibleDonors", "EligibleDonors"],
    changeFields: [
      "eligibleChange",
      "EligibleChange",
      "eligibleDonorsChange",
      "EligibleDonorsChange",
    ],
    iconColor: "text-blue-600 bg-blue-50",
  },
  {
    key: "recentDonors",
    titleKey: "donated_this_month",
    fields: [
      "recentlyDonated",
      "RecentlyDonated",
      "recentDonors",
      "RecentDonors",
      "thisMonth",
      "ThisMonth",
      "donatedThisMonth",
      "donatedthismonth",
    ],
    changeFields: [
      "recentDonorsChange",
      "RecentDonorsChange",
      "recentlyDonatedChange",
      "RecentlyDonatedChange",
    ],
    iconColor: "text-purple-600 bg-purple-50",
  },
  {
    key: "inactiveDonors",
    titleKey: "inactive_donors",
    fields: [
      "ineligible",
      "Ineligible",
      "ineligibleDonors",
      "IneligibleDonors",
      "inactiveDonors",
      "InactiveDonors",
      "inactive",
      "Inactive",
    ],
    changeFields: [
      "inactiveDonorsChange",
      "InactiveDonorsChange",
      "ineligibleChange",
      "IneligibleChange",
    ],
    iconColor: "text-red-600 bg-red-50",
  },
];

export const normalizeDonorStats = (payload) => {
  const resolved = unwrapPayload(payload);

  const cardsCandidate =
    resolved?.cards ?? resolved?.Cards ?? resolved?.stats ?? resolved?.Stats;

  if (Array.isArray(cardsCandidate) && cardsCandidate.length > 0) {
    return cardsCandidate.map((card, index) => ({
      ...normalizeStatCardFromRaw(card),
      titleKey:
        readField(card, ["titleKey", "TitleKey"]) ||
        DONOR_STAT_DEFINITIONS[index]?.titleKey,
      iconColor:
        DONOR_STAT_DEFINITIONS[index]?.iconColor || "text-gray-600 bg-gray-50",
    }));
  }

  return DONOR_STAT_DEFINITIONS.map((definition) => {
    const value = readFirstNumber(resolved, definition.fields) ?? 0;
    const change = readFirstNumber(resolved, definition.changeFields) ?? 0;

    return {
      key: definition.key,
      titleKey: definition.titleKey,
      value,
      change,
      trend: getTrendFromChange(change),
      formattedValue: formatNumber(value),
      formattedChange: formatPercentChange(change),
      iconColor: definition.iconColor,
    };
  });
};

const normalizeStatCardFromRaw = (raw) => {
  const value =
    readFirstNumber(raw, [
      "value",
      "Value",
      "count",
      "Count",
      "total",
      "Total",
    ]) ?? 0;
  const change =
    readFirstNumber(raw, [
      "change",
      "Change",
      "changePercent",
      "ChangePercent",
      "percentChange",
      "PercentChange",
    ]) ?? 0;

  return {
    key: readField(raw, ["key", "Key", "id", "Id"]) || "stat",
    titleKey: readField(raw, ["titleKey", "TitleKey", "title", "Title"]),
    value,
    change,
    trend: getTrendFromChange(change),
    formattedValue: formatNumber(value),
    formattedChange: formatPercentChange(change),
  };
};

export const getDonorStatusStyles = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "active" || normalized === "eligible") {
    return {
      text: "text-green-600",
      icon: "completed",
    };
  }

  if (
    normalized === "inactive" ||
    normalized === "processing" ||
    normalized === "unavailable"
  ) {
    return {
      text: "text-amber-600",
      icon: "processing",
    };
  }

  if (normalized === "ineligible" || normalized === "failed") {
    return {
      text: "text-red-600",
      icon: "failed",
    };
  }

  return {
    text: "text-gray-600",
    icon: "processing",
  };
};

export const getDonorStatusTranslationKey = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "eligible") return "eligible";
  if (normalized === "ineligible") return "ineligible";
  if (normalized === "unavailable") return "unavailable";
  return normalized;
};

/**
 * @param {{ search?: string, bloodTypeId?: string, status?: string, page?: number, limit?: number }} params
 * @param {string} [locale]
 */
export const getDonors = async (params = {}, locale = "en") => {
  const queryParams = buildAdminDonorsQueryParams(params);
  const { data } = await axiosInstance.get("/admin/donors", {
    params: queryParams,
  });
  return normalizeDonorList(data, locale);
};

/**
 * @param {string | number} id
 * @param {string} [locale]
 */
export const getDonorById = async (id, locale = "en") => {
  const { data } = await axiosInstance.get(`/admin/donors/${id}`);
  return normalizeDonor(unwrapPayload(data), locale);
};

/**
 * @returns {Promise<object[]>}
 */
export const getDonorStats = async () => {
  const { data } = await axiosInstance.get("/admin/donors/stats");
  return normalizeDonorStats(data);
};

/** @deprecated Use getDonors */
export const getDonations = getDonors;

/** @deprecated Use getDonorById */
export const getDonationById = getDonorById;
