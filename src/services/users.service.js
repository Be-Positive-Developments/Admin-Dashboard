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

const readFirstNumber = (obj, keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
};

const normalizeUserList = (payload) => {
  const resolvedPayload = unwrapPayload(payload);

  // Handle both direct DTOs and wrapped API response formats.
  if (Array.isArray(resolvedPayload)) {
    return {
      users: resolvedPayload,
      totalcount: resolvedPayload.length,
      filteredcount: resolvedPayload.length,
    };
  }

  const usersCandidate =
    resolvedPayload?.users ??
    resolvedPayload?.Users ??
    resolvedPayload?.items ??
    resolvedPayload?.Items ??
    resolvedPayload?.records ??
    resolvedPayload?.Records ??
    [];

  const users = Array.isArray(usersCandidate) ? usersCandidate : [];

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
    users,
    totalcount: totalcount ?? users.length,
    filteredcount: filteredcount ?? totalcount ?? users.length,
    hasNextPage: resolvedPayload?.hasNextPage,
    hasPreviousPage: resolvedPayload?.hasPreviousPage,
    totalPages: resolvedPayload?.totalPages,
  };
};

/**
 * Users service — CRUD operations for the Admin users resource.
 *
 * All functions return the `data` payload from the response directly
 * so consuming hooks never need to unwrap the axios response object.
 */

/**
 * Fetch a paginated list of users.
 * @param {{ page?: number, pageSize?: number, limit?: number, search?: string, userType?: string, isActive?: boolean }} params
 * @returns {Promise<{ users: object[], totalcount: number, filteredcount: number }>}
 */
export const getUsers = async (params = {}) => {
  const normalizedParams = {
    ...params,
    pageSize: params.pageSize ?? params.limit,
  };

  const { data } = await axiosInstance.get("/Admin/list", {
    params: normalizedParams,
  });

  return normalizeUserList(data);
};

/**
 * Fetch a single user by ID.
 * @param {string | number} id
 * @returns {Promise<object>}
 */
export const getUserById = async (id) => {
  const { data } = await axiosInstance.get("/Admin/get-user", {
    params: { id },
  });
  return unwrapPayload(data);
};

/**
 * Create a new user.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export const createUser = async (payload) => {
  const { data } = await axiosInstance.post("/Admin/create", payload);
  return unwrapPayload(data);
};

/**
 * Update an existing user.
 * @param {string | number} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export const updateUser = async (id, payload) => {
  const hasId = id !== undefined && id !== null;
  const requestConfig = hasId ? { params: { id } } : undefined;
  const { data } = await axiosInstance.put(
    "/Admin/update",
    payload,
    requestConfig,
  );
  return unwrapPayload(data);
};

/**
 * Delete a user.
 * @param {string | number} id
 * @returns {Promise<void>}
 */
export const deleteUser = async (id) => {
  const { data } = await axiosInstance.delete("/Admin/delete", {
    params: { id },
  });
  return unwrapPayload(data);
};
