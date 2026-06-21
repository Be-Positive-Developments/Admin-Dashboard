import axiosInstance from "@/lib/axiosInstance";
import {
  unwrapPayload,
  readField,
  readFirstNumber,
  extractArrayCandidate,
  normalizeChartPoint,
  normalizeStatCard,
  formatRelativeTime,
  formatNumber,
  formatPercentChange,
  getTrendFromChange,
} from "@/lib/apiNormalize";

const STAT_CARD_DEFINITIONS = [
  {
    key: "totalHospitals",
    titleKey: "total_hospitals",
    fields: ["totalHospitals", "totalhospitals"],
    changeFields: [
      "totalHospitalsChange",
      "totalhospitalschange",
      "hospitalsChange",
    ],
  },
  {
    key: "totalDonors",
    titleKey: "total_donors",
    fields: ["totalDonors", "totaldonors", "donors"],
    changeFields: ["totalDonorsChange", "totaldonorschange", "donorsChange"],
  },
  {
    key: "totalDonations",
    titleKey: "total_donations",
    fields: ["totalDonations", "totaldonations", "donations", "donationCount"],
    changeFields: [
      "totalDonationsChange",
      "totaldonationschange",
      "donationsChange",
    ],
  },
  {
    key: "totalRequests",
    titleKey: "total_requests",
    fields: ["totalRequests", "totalrequests", "requests", "requestCount"],
    changeFields: [
      "totalRequestsChange",
      "totalrequestschange",
      "requestsChange",
    ],
  },
];

const buildStatCardsFromObject = (raw) => {
  return STAT_CARD_DEFINITIONS.map((definition) => {
    const value = readFirstNumber(raw, definition.fields) ?? 0;
    const change =
      readFirstNumber(raw, definition.changeFields) ??
      readFirstNumber(raw, [`${definition.key}ChangePercent`]) ??
      0;

    return {
      key: definition.key,
      titleKey: definition.titleKey,
      value,
      change,
      trend: getTrendFromChange(change),
      formattedValue: formatNumber(value),
      formattedChange: formatPercentChange(change),
    };
  });
};

export const normalizeDashboardStats = (payload) => {
  const resolved = unwrapPayload(payload);

  const cardsCandidate =
    resolved?.cards ??
    resolved?.Cards ??
    resolved?.stats ??
    resolved?.Stats ??
    resolved?.statCards ??
    resolved?.StatCards;

  if (Array.isArray(cardsCandidate) && cardsCandidate.length > 0) {
    return cardsCandidate.map((card, index) => {
      const normalized = normalizeStatCard(card, `stat-${index}`);
      return {
        ...normalized,
        titleKey: readField(card, ["titleKey", "TitleKey"]) || normalized.key,
      };
    });
  }

  return buildStatCardsFromObject(resolved);
};

export const normalizeRecentRegistrations = (payload, locale = "en") => {
  const resolved = unwrapPayload(payload);
  const items = extractArrayCandidate(resolved, [
    "registrations",
    "Registrations",
    "recentRegistrations",
    "RecentRegistrations",
    "hospitals",
    "Hospitals",
    "items",
    "Items",
    "records",
    "Records",
    "activities",
    "Activities",
  ]);

  return items.map((item, index) => {
    const id = readField(item, ["id", "Id"]) || index;
    const name =
      readField(item, [
        "hospitalName",
        "HospitalName",
        "name",
        "Name",
        "user",
        "User",
        "title",
        "Title",
      ]) || "—";
    const action =
      readField(item, ["action", "Action", "description", "Description"]) ||
      "activity_hospital_registered";
    const createdAt = readField(item, [
      "createdAt",
      "CreatedAt",
      "registeredAt",
      "RegisteredAt",
      "date",
      "Date",
      "submittedAt",
      "SubmittedAt",
    ]);
    const status = readField(item, ["status", "Status"]);
    const city = readField(item, ["city", "cityname"]);
    const governorate = readField(item, ["governorate", "governoratename"]);
    const location =
      readField(item, ["location", "Location"]) ||
      [city, governorate].filter(Boolean).join(", ");

    return {
      id,
      user: name,
      action,
      time: formatRelativeTime(createdAt, locale),
      status,
      location,
    };
  });
};

export const normalizeActivityChart = (payload) => {
  const resolved = unwrapPayload(payload);

  if (
    Array.isArray(resolved?.labels) &&
    (Array.isArray(resolved?.registrations) ||
      Array.isArray(resolved?.donations))
  ) {
    return resolved.labels.map((label, index) => ({
      name: label,
      registrations: Number(resolved.registrations?.[index] ?? 0),
      donations: Number(resolved.donations?.[index] ?? 0),
    }));
  }

  const points = extractArrayCandidate(resolved, [
    "points",
    "Points",
    "data",
    "Data",
    "items",
    "Items",
    "months",
    "Months",
    "chart",
    "Chart",
    "activity",
    "Activity",
  ]);

  return points.map((point, index) => normalizeChartPoint(point, index));
};

/**
 * @returns {Promise<object[]>}
 */
export const getDashboardStats = async () => {
  const { data } = await axiosInstance.get("/admin/dashboard/stats");
  return normalizeDashboardStats(data);
};

/**
 * @param {{ limit?: number }} params
 * @param {string} [locale]
 * @returns {Promise<object[]>}
 */
export const getRecentRegistrations = async (params = {}, locale = "en") => {
  const limit = params?.limit ?? 5;
  const { data } = await axiosInstance.get(
    "/admin/dashboard/recent-registrations",
    { params: { limit } },
  );
  return normalizeRecentRegistrations(data, locale);
};

/**
 * @returns {Promise<object[]>}
 */
export const getActivityChart = async () => {
  const { data } = await axiosInstance.get("/admin/dashboard/activity-chart");
  return normalizeActivityChart(data);
};
