export const unwrapPayload = (payload) => {
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

const readValue = (obj, key) => {
  if (!obj || typeof obj !== "object") {
    return undefined;
  }

  if (obj[key] !== undefined) {
    return obj[key];
  }

  const normalizedKey = String(key).toLowerCase();
  const matchingKey = Object.keys(obj).find(
    (candidate) => candidate.toLowerCase() === normalizedKey,
  );

  return matchingKey ? obj[matchingKey] : undefined;
};

export const readField = (obj, keys, fallback = undefined) => {
  if (!Array.isArray(keys)) {
    return fallback;
  }

  for (const key of keys) {
    const value = readValue(obj, key);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return fallback;
};

export const readFirstNumber = (obj, keys) => {
  if (!Array.isArray(keys)) {
    return undefined;
  }

  for (const key of keys) {
    const value = readValue(obj, key);
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
};

export const extractArrayCandidate = (resolvedPayload, keys) => {
  if (!resolvedPayload) return [];

  if (Array.isArray(resolvedPayload)) {
    return resolvedPayload;
  }

  for (const key of keys) {
    const candidate = resolvedPayload?.[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  const nestedData = resolvedPayload?.data ?? resolvedPayload?.Data;
  if (Array.isArray(nestedData)) {
    return nestedData;
  }

  if (nestedData && typeof nestedData === "object") {
    for (const key of keys) {
      const candidate = nestedData?.[key];
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }

  return [];
};

export const extractPaginationMeta = (
  resolvedPayload,
  itemsLength,
  fallbackLimit = 10,
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
  const resolvedTotal = total ?? itemsLength;
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

export const formatNumber = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "—";
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(Number(value));
};

export const formatPercentChange = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "—";
  }

  const numeric = Number(value);
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric.toFixed(1)}%`;
};

export const getTrendFromChange = (change) => {
  if (change === undefined || change === null || Number.isNaN(Number(change))) {
    return "up";
  }

  return Number(change) >= 0 ? "up" : "down";
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

const BLOOD_TYPE_MAP = {
  "bt-apos": "A+",
  "bt-aneg": "A-",
  "bt-bpos": "B+",
  "bt-bneg": "B-",
  "bt-abpos": "AB+",
  "bt-abneg": "AB-",
  "bt-opos": "O+",
  "bt-ominus": "O-",
};

export const mapBloodTypeIdToLabel = (bloodTypeId) => {
  if (!bloodTypeId) return "—";
  const key = String(bloodTypeId).toLowerCase();
  return BLOOD_TYPE_MAP[key] || String(bloodTypeId);
};

export const normalizeChartPoint = (item, index = 0) => {
  if (!item || typeof item !== "object") {
    return {
      name: String(index + 1),
      donations: 0,
      requests: 0,
      newUsers: 0,
      value: 0,
      amount: 0,
    };
  }

  const name =
    readField(item, [
      "name",
      "Name",
      "label",
      "Label",
      "month",
      "Month",
      "monthName",
      "MonthName",
      "period",
      "Period",
      "date",
      "Date",
    ]) || String(index + 1);

  const donations =
    readFirstNumber(item, [
      "donations",
      "Donations",
      "donationCount",
      "DonationCount",
      "donors",
      "Donors",
      "count",
      "Count",
    ]) ?? 0;

  const requests =
    readFirstNumber(item, [
      "requests",
      "Requests",
      "requestCount",
      "RequestCount",
      "cases",
      "Cases",
    ]) ?? 0;

  const newUsers =
    readFirstNumber(item, [
      "newUsers",
      "NewUsers",
      "users",
      "Users",
      "registrations",
      "Registrations",
    ]) ?? 0;

  const value =
    readFirstNumber(item, [
      "value",
      "Value",
      "count",
      "Count",
      "total",
      "Total",
      "demand",
      "Demand",
    ]) ?? donations;

  const amount =
    readFirstNumber(item, ["amount", "Amount", "total", "Total"]) ?? value;

  return { name, donations, requests, newUsers, value, amount };
};

export const normalizeStatCard = (raw, fallbackKey = "stat") => {
  if (!raw || typeof raw !== "object") {
    return {
      key: fallbackKey,
      title: fallbackKey,
      value: 0,
      change: 0,
      trend: "up",
      formattedValue: "0",
      formattedChange: "—",
    };
  }

  const key =
    readField(raw, ["key", "Key", "id", "Id", "name", "Name"]) || fallbackKey;
  const title = readField(raw, [
    "title",
    "Title",
    "label",
    "Label",
    "name",
    "Name",
  ]);
  const value =
    readFirstNumber(raw, [
      "value",
      "Value",
      "count",
      "Count",
      "total",
      "Total",
      "amount",
      "Amount",
    ]) ?? 0;
  const change =
    readFirstNumber(raw, [
      "change",
      "Change",
      "changePercent",
      "ChangePercent",
      "percentChange",
      "PercentChange",
      "percentageChange",
      "PercentageChange",
    ]) ?? 0;

  return {
    key,
    title: title || key,
    value,
    change,
    trend: getTrendFromChange(change),
    formattedValue: formatNumber(value),
    formattedChange: formatPercentChange(change),
  };
};
