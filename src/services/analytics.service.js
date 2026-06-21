import axiosInstance from "@/lib/axiosInstance";
import {
  unwrapPayload,
  readField,
  readFirstNumber,
  extractArrayCandidate,
  normalizeChartPoint,
  normalizeStatCard,
  formatNumber,
  formatPercentChange,
  getTrendFromChange,
  mapBloodTypeIdToLabel,
} from "@/lib/apiNormalize";

const KPI_DEFINITIONS = [
  {
    key: "totalDonationsAllTime",
    titleKey: "total_donations_all_time",
    fields: [
      "totalDonationsAllTime",
      "totaldonationsalltime",
      "totalDonations",
      "totaldonations",
    ],
  },
  {
    key: "totalRequestsAllTime",
    titleKey: "total_requests_all_time",
    fields: [
      "totalRequestsAllTime",
      "totalrequestsalltime",
      "totalRequests",
      "totalrequests",
    ],
  },
  {
    key: "totalHospitals",
    titleKey: "total_hospitals",
    fields: ["totalHospitals", "totalhospitals"],
  },
  {
    key: "totalDonors",
    titleKey: "total_donors",
    fields: ["totalDonors", "totaldonors"],
  },
  {
    key: "mostRequestedBloodType",
    titleKey: "most_requested_blood_type",
    fields: ["mostRequestedBloodType", "mostrequestedbloodtype"],
    type: "text",
  },
  {
    key: "mostActiveHospital",
    titleKey: "most_active_hospital",
    fields: ["mostActiveHospital", "mostactivehospital"],
    type: "text",
  },
];

const buildKpisFromObject = (raw) => {
  return KPI_DEFINITIONS.map((definition) => {
    const rawValue =
      definition.type === "text"
        ? readField(raw, definition.fields, "—")
        : (readFirstNumber(raw, definition.fields) ?? 0);
    const change =
      readFirstNumber(raw, definition.changeFields) ??
      readFirstNumber(raw, [`${definition.key}Change`]) ??
      undefined;

    const formattedValue =
      definition.type === "text"
        ? rawValue
        : definition.isPercent
          ? `${formatNumber(rawValue)}%`
          : formatNumber(rawValue);

    return {
      key: definition.key,
      titleKey: definition.titleKey,
      value: rawValue,
      change,
      trend: getTrendFromChange(change),
      formattedValue,
      formattedChange:
        change === undefined ? undefined : formatPercentChange(change),
    };
  });
};

export const normalizeAnalyticsSummary = (payload) => {
  const resolved = unwrapPayload(payload);

  const cardsCandidate =
    resolved?.cards ??
    resolved?.Cards ??
    resolved?.summary ??
    resolved?.Summary ??
    resolved?.stats ??
    resolved?.Stats ??
    resolved?.kpis ??
    resolved?.Kpis;

  if (Array.isArray(cardsCandidate) && cardsCandidate.length > 0) {
    return cardsCandidate.map((card, index) => {
      const normalized = normalizeStatCard(card, `kpi-${index}`);
      return {
        ...normalized,
        titleKey:
          readField(card, ["titleKey", "TitleKey"]) ||
          KPI_DEFINITIONS[index]?.titleKey ||
          normalized.key,
        formattedValue: readField(card, ["formattedValue", "FormattedValue"])
          ? readField(card, ["formattedValue", "FormattedValue"])
          : normalized.formattedValue,
      };
    });
  }

  return buildKpisFromObject(resolved);
};

export const normalizeDonationsTrend = (payload) => {
  const resolved = unwrapPayload(payload);

  if (
    Array.isArray(resolved?.labels) &&
    (Array.isArray(resolved?.donations) || Array.isArray(resolved?.requests))
  ) {
    return resolved.labels.map((label, index) => ({
      name: label,
      donations: Number(resolved.donations?.[index] ?? 0),
      requests: Number(resolved.requests?.[index] ?? 0),
    }));
  }

  const points = extractArrayCandidate(resolved, [
    "points",
    "Points",
    "data",
    "Data",
    "trend",
    "Trend",
    "items",
    "Items",
    "months",
    "Months",
  ]);

  return points.map((point, index) => {
    const normalized = normalizeChartPoint(point, index);
    return {
      name: normalized.name,
      donations: normalized.donations,
      requests: normalized.requests,
      newUsers: normalized.newUsers || normalized.requests,
    };
  });
};

export const normalizeHospitalsByGovernorate = (payload) => {
  const resolved = unwrapPayload(payload);
  const items = extractArrayCandidate(resolved, [
    "governorates",
    "Governorates",
    "items",
    "Items",
    "data",
    "Data",
    "records",
    "Records",
  ]);

  return items.map((item, index) => {
    const name =
      readField(item, [
        "governorate",
        "Governorate",
        "name",
        "Name",
        "governorateName",
        "GovernorateName",
        "label",
        "Label",
      ]) || `Item ${index + 1}`;

    const value =
      readFirstNumber(item, [
        "count",
        "Count",
        "hospitals",
        "Hospitals",
        "value",
        "Value",
        "total",
        "Total",
      ]) ?? 0;

    return { name, value };
  });
};

export const normalizeBloodTypeDemand = (payload) => {
  const resolved = unwrapPayload(payload);
  const items = extractArrayCandidate(resolved, [
    "bloodTypes",
    "BloodTypes",
    "items",
    "Items",
    "data",
    "Data",
    "demand",
    "Demand",
    "distribution",
    "Distribution",
  ]);

  return items.map((item, index) => {
    const bloodTypeName = readField(item, [
      "bloodTypeName",
      "BloodTypeName",
      "bloodType",
      "BloodType",
      "name",
      "Name",
      "label",
      "Label",
    ]);
    const bloodTypeId = readField(item, [
      "bloodTypeId",
      "BloodTypeId",
      "id",
      "Id",
    ]);
    const name = bloodTypeName || mapBloodTypeIdToLabel(bloodTypeId) || "—";
    const value =
      readFirstNumber(item, [
        "count",
        "Count",
        "requestCount",
        "requestcount",
        "demand",
        "Demand",
        "requests",
        "Requests",
        "value",
        "Value",
        "total",
        "Total",
      ]) ?? 0;

    return { name, value, key: bloodTypeId || name || index };
  });
};

/**
 * @returns {Promise<object[]>}
 */
export const getAnalyticsSummary = async () => {
  const { data } = await axiosInstance.get("/admin/analytics/summary");
  return normalizeAnalyticsSummary(data);
};

/**
 * @returns {Promise<object[]>}
 */
export const getDonationsTrend = async () => {
  const { data } = await axiosInstance.get("/admin/analytics/donations-trend");
  return normalizeDonationsTrend(data);
};

/**
 * @returns {Promise<object[]>}
 */
export const getHospitalsByGovernorate = async () => {
  const { data } = await axiosInstance.get(
    "/admin/analytics/hospitals-by-governorate",
  );
  return normalizeHospitalsByGovernorate(data);
};

/**
 * @returns {Promise<object[]>}
 */
export const getBloodTypeDemand = async () => {
  const { data } = await axiosInstance.get(
    "/admin/analytics/blood-type-demand",
  );
  return normalizeBloodTypeDemand(data);
};

/** @deprecated Use getAnalyticsSummary */
export const getAnalytics = getAnalyticsSummary;

/** @deprecated Not supported by admin API */
export const getAnalyticsByRange = async () => {
  return getAnalyticsSummary();
};
