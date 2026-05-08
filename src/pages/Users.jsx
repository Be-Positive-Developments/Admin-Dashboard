import React, { useEffect, useMemo, useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  useGetUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/queries/useUsers";
import { getUserById } from "@/services/users.service";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
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

const mapRoleFilterToUserType = (role) => {
  if (role === "All") return undefined;
  if (role === "Admin") return "SystemAdmin";
  if (role === "HospitalAdmin") return "HospitalAdmin";
  if (role === "Donor") return "Donor";
  if (role === "User") return "User";
  return undefined;
};

const mapUserTypeToRoleLabel = (userType) => {
  if (userType === "SystemAdmin") return "Admin";
  if (userType === "HospitalAdmin") return "Hospital Admin";
  if (userType === "Donor") return "Donor";
  if (userType === "User") return "User";
  return "User";
};

const normalizeRoleValueForSelect = (role) => {
  if (role === "Hospital Admin") return "HospitalAdmin";
  return role || "User";
};

const formatJoinedDate = (dateString) => {
  if (!dateString) return "-";

  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toISOString().split("T")[0];
};

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t("users", "Users"));
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showFieldGuidance, setShowFieldGuidance] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    role: false,
    status: false,
  });

  const clearFieldError = (field) => {
    setFormErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return t("email_required", "Email is required.");
    }
    if (!emailRegex.test(email)) {
      return t("invalid_email", "Please enter a valid email.");
    }
    return null;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[0-9\s()-]{7,20}$/;
    if (!phone) {
      return t("phone_required", "Phone is required.");
    }
    if (!phoneRegex.test(phone)) {
      return t("invalid_phone", "Please enter a valid phone number.");
    }
    return null;
  };

  const handleEmailChange = (e) => {
    const email = String(e.target.value || "").trim();
    clearFieldError("email");
    if (email) {
      const error = validateEmail(email);
      if (error) {
        setFormErrors((prev) => ({ ...prev, email: error }));
      }
    }
  };

  const handlePhoneChange = (e) => {
    const phone = String(e.target.value || "").trim();
    clearFieldError("phone");
    if (phone) {
      const error = validatePhone(phone);
      if (error) {
        setFormErrors((prev) => ({ ...prev, phone: error }));
      }
    }
  };

  const isRtl = i18n.dir() === "rtl";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
      ...(mapRoleFilterToUserType(roleFilter)
        ? { userType: mapRoleFilterToUserType(roleFilter) }
        : {}),
    }),
    [page, pageSize, debouncedSearchTerm, roleFilter],
  );

  const { data: usersResponse, isLoading, isError } = useGetUsers(queryParams);
  const { mutateAsync: createUserAsync } = useCreateUser();
  const { mutateAsync: deleteUserAsync, isPending: isDeletingUser } =
    useDeleteUser();
  const { mutateAsync: updateUserAsync } = useUpdateUser(editingUser?.id);

  const mappedUsers = useMemo(() => {
    const apiUsers = usersResponse?.users ?? [];

    return apiUsers.map((user) => ({
      id: user.id,
      name: user.fullname || user.username || "Unknown User",
      email: user.email || "-",
      phone: user.phonenumber
        ? user.phonenumber.startsWith("+")
          ? user.phonenumber
          : `+${user.phonenumber}`
        : "-",
      role: mapUserTypeToRoleLabel(user.usertype),
      status: user.isactive ? "Active" : "Inactive",
      joined: formatJoinedDate(user.dateofcreation),
    }));
  }, [usersResponse]);

  useEffect(() => {
    setUsers(mappedUsers);
  }, [mappedUsers]);

  const totalCount = usersResponse?.totalcount ?? users.length;
  const filteredCount = usersResponse?.filteredcount ?? totalCount;
  const isFiltered =
    Boolean(debouncedSearchTerm) ||
    Boolean(mapRoleFilterToUserType(roleFilter));
  const effectiveCount = isFiltered ? filteredCount : totalCount;
  const startItem = effectiveCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem =
    effectiveCount > 0
      ? Math.min(startItem + users.length - 1, effectiveCount)
      : 0;

  const canGoPrevious = usersResponse?.hasPreviousPage ?? page > 1;
  const canGoNext = usersResponse?.hasNextPage ?? endItem < effectiveCount;

  const handleDelete = (id) => {
    setDeleteUserId(id);
  };

  const confirmDelete = async () => {
    if (!deleteUserId || isDeletingUser) return;

    try {
      await deleteUserAsync(deleteUserId);
      toast.success(t("user_deleted", "User deleted successfully"));
      setDeleteUserId(null);
    } catch {
      toast.error(t("failed_to_delete_user", "Failed to delete user."));
    }
  };

  const handleEdit = async (user) => {
    try {
      const userDetails = await getUserById(user.id);
      setEditingUser({
        id: userDetails?.id ?? user.id,
        name: userDetails?.fullname || userDetails?.username || user.name,
        email: userDetails?.email || user.email,
        phone: userDetails?.phonenumber || user.phone,
        role: normalizeRoleValueForSelect(
          mapUserTypeToRoleLabel(userDetails?.usertype),
        ),
        status: userDetails?.isactive ? "Active" : "Inactive",
        joined: userDetails?.dateofcreation
          ? formatJoinedDate(userDetails.dateofcreation)
          : user.joined,
      });
    } catch {
      setEditingUser({
        ...user,
        role: normalizeRoleValueForSelect(user.role),
      });
      toast.error(t("failed_to_load_user", "Failed to load user details."));
    }

    setIsModalOpen(true);
    setFormErrors({});
    setShowFieldGuidance({
      name: false,
      email: false,
      phone: false,
      password: false,
      role: false,
      status: false,
    });
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
    setFormErrors({});
    setShowFieldGuidance({
      name: false,
      email: false,
      phone: false,
      password: false,
      role: false,
      status: false,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSavingUser) return;

    setIsSavingUser(true);

    const getApiErrorMessage = (error) => {
      const response = error?.response?.data;
      const message =
        response?.message ??
        response?.Message ??
        response?.error ??
        response?.errorMessage ??
        error?.message;

      if (typeof message === "string" && message.trim()) {
        return message.trim();
      }

      if (typeof response === "string" && response.trim()) {
        const trimmedResponse = response.trim();
        if (
          (trimmedResponse.startsWith("{") && trimmedResponse.endsWith("}")) ||
          (trimmedResponse.startsWith("[") && trimmedResponse.endsWith("]"))
        ) {
          try {
            const parsedResponse = JSON.parse(trimmedResponse);
            const parsedMessage =
              parsedResponse?.message ??
              parsedResponse?.Message ??
              parsedResponse?.error ??
              parsedResponse?.errorMessage;

            if (typeof parsedMessage === "string" && parsedMessage.trim()) {
              return parsedMessage.trim();
            }
          } catch {
            return trimmedResponse;
          }
        }

        return trimmedResponse;
      }

      return null;
    };

    const getEnvelopeErrorMessage = (payload) => {
      if (!payload) {
        return null;
      }

      if (typeof payload === "string") {
        const trimmedPayload = payload.trim();
        if (
          (trimmedPayload.startsWith("{") && trimmedPayload.endsWith("}")) ||
          (trimmedPayload.startsWith("[") && trimmedPayload.endsWith("]"))
        ) {
          try {
            const parsedPayload = JSON.parse(trimmedPayload);
            const parsedMessage =
              parsedPayload?.message ??
              parsedPayload?.Message ??
              parsedPayload?.error ??
              parsedPayload?.errorMessage;

            if (typeof parsedMessage === "string" && parsedMessage.trim()) {
              return parsedMessage.trim();
            }
          } catch {
            return trimmedPayload;
          }
        }

        return trimmedPayload || null;
      }

      if (typeof payload !== "object") {
        return null;
      }

      const statusCode = payload?.statusCode;
      if (typeof statusCode === "number" && statusCode >= 400) {
        return payload?.message || payload?.Message || "";
      }

      if (payload?.success === false) {
        return payload?.message || payload?.Message || "";
      }

      return null;
    };

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[0-9\s()-]{7,20}$/;
      const validationErrors = {};
      const formData = new FormData(e.target);
      const fullname = String(formData.get("name") || "").trim();
      const roleValue = String(formData.get("role") || "User");
      const usertype = mapRoleFilterToUserType(roleValue) || "User";
      const statusValue = String(formData.get("status") || "Active");

      if (editingUser) {
        if (!fullname) {
          validationErrors.name = t(
            "full_name_required",
            "Full name is required.",
          );
        }

        if (!roleValue) {
          validationErrors.role = t("role_required", "Role is required.");
        }

        if (!statusValue) {
          validationErrors.status = t("status_required", "Status is required.");
        }

        if (Object.keys(validationErrors).length > 0) {
          setFormErrors(validationErrors);
          toast.error(t("fix_form_errors", "Please fix the form errors."));
          setIsSavingUser(false);
          return;
        }

        const updateResult = await updateUserAsync({
          fullname,
          usertype,
          isactive: statusValue === "Active",
        });

        const updateMessage = getEnvelopeErrorMessage(updateResult);
        if (updateMessage) {
          toast.error(updateMessage);
          setIsSavingUser(false);
          return;
        }
      } else {
        const email = String(formData.get("email") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const password = String(formData.get("password") || "").trim();

        if (!fullname) {
          validationErrors.name = t(
            "full_name_required",
            "Full name is required.",
          );
        }

        if (!email) {
          validationErrors.email = t("email_required", "Email is required.");
        } else if (!emailRegex.test(email)) {
          validationErrors.email = t(
            "invalid_email",
            "Please enter a valid email.",
          );
        }

        if (!phone) {
          validationErrors.phone = t("phone_required", "Phone is required.");
        } else if (!phoneRegex.test(phone)) {
          validationErrors.phone = t(
            "invalid_phone",
            "Please enter a valid phone number.",
          );
        }

        if (!password) {
          validationErrors.password = t(
            "password_required",
            "Password is required.",
          );
        } else if (password.length < 6) {
          validationErrors.password = t(
            "password_min_length",
            "Password must be at least 6 characters.",
          );
        }

        if (!roleValue) {
          validationErrors.role = t("role_required", "Role is required.");
        }

        if (Object.keys(validationErrors).length > 0) {
          setFormErrors(validationErrors);
          toast.error(t("fix_form_errors", "Please fix the form errors."));
          setIsSavingUser(false);
          return;
        }

        const createResult = await createUserAsync({
          fullname,
          email,
          password,
          usertype,
          phonenumber: phone || null,
        });

        const createMessage = getEnvelopeErrorMessage(createResult);
        if (createMessage) {
          const normalizedCreateMessage = createMessage.toLowerCase() ?? "";
          if (
            normalizedCreateMessage.includes("email") &&
            (normalizedCreateMessage.includes("exist") ||
              normalizedCreateMessage.includes("exists") ||
              normalizedCreateMessage.includes("taken") ||
              normalizedCreateMessage.includes("already") ||
              normalizedCreateMessage.includes("duplicate") ||
              normalizedCreateMessage.includes("username"))
          ) {
            const emailTakenMessage = t("email_taken", "Email already exists.");
            setFormErrors((prev) => ({ ...prev, email: emailTakenMessage }));
            setShowFieldGuidance((prev) => ({ ...prev, email: true }));
            toast.error(emailTakenMessage);
          } else {
            toast.error(createMessage);
          }
          setIsSavingUser(false);
          return;
        }
      }

      setIsModalOpen(false);
      setEditingUser(null);
      setFormErrors({});
      setShowFieldGuidance({
        name: false,
        email: false,
        phone: false,
        password: false,
        role: false,
        status: false,
      });
      toast.success(t("user_saved", "User saved successfully"));
    } catch (error) {
      const apiMessage = getApiErrorMessage(error);
      const normalizedMessage = apiMessage?.toLowerCase() ?? "";

      if (!editingUser && apiMessage) {
        if (
          normalizedMessage.includes("email") &&
          (normalizedMessage.includes("exist") ||
            normalizedMessage.includes("exists") ||
            normalizedMessage.includes("taken") ||
            normalizedMessage.includes("already") ||
            normalizedMessage.includes("duplicate") ||
            normalizedMessage.includes("username"))
        ) {
          const emailTakenMessage = t("email_taken", "Email already exists.");
          setFormErrors((prev) => ({ ...prev, email: emailTakenMessage }));
          setShowFieldGuidance((prev) => ({ ...prev, email: true }));
          toast.error(emailTakenMessage);
          setIsSavingUser(false);
          return;
        }

        toast.error(apiMessage);
        setIsSavingUser(false);
        return;
      }

      toast.error(
        apiMessage || t("failed_to_save_user", "Failed to save user."),
      );
    } finally {
      setIsSavingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("manage_users", "Users Management")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t("manage_users_desc", "Manage users, roles, and permissions.")}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          {t("add_new_user", "Add New User")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#171921] p-4 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
              isRtl ? "right-3" : "left-3",
            )}
          />
          <input
            type="text"
            placeholder={t("search_users", "Search by name or email...")}
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 dark:bg-[#1c1e27] border border-gray-200 dark:border-[#262833] text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2"
          >
            <option value="All">{t("all_roles", "All Roles")}</option>
            <option value="Admin">{t("admin", "Admin")}</option>
            <option value="HospitalAdmin">
              {t("hospital_admin", "Hospital Admin")}
            </option>
            <option value="Donor">{t("donor", "Donor")}</option>
            <option value="User">{t("user", "User")}</option>
          </select>
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
                <th
                  scope="col"
                  className={clsx(
                    "px-6 py-3",
                    isRtl ? "text-right" : "text-left",
                  )}
                >
                  {t("name", "Name")}
                </th>
                <th
                  scope="col"
                  className={clsx(
                    "px-6 py-3",
                    isRtl ? "text-right" : "text-left",
                  )}
                >
                  {t("role", "Role")}
                </th>
                <th
                  scope="col"
                  className={clsx(
                    "px-6 py-3",
                    isRtl ? "text-right" : "text-left",
                  )}
                >
                  {t("status", "Status")}
                </th>
                <th
                  scope="col"
                  className={clsx(
                    "px-6 py-3",
                    isRtl ? "text-right" : "text-left",
                  )}
                >
                  {t("joined", "Joined")}
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
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    {t("loading_users", "Loading users...")}
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    {t("failed_to_load_users", "Failed to load users.")}
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-white dark:bg-[#171921] border-b border-gray-50 dark:border-[#262833] hover:bg-gray-50 dark:hover:bg-[#1c1e27] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 flex items-center justify-center font-bold text-xs">
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                          user.role === "Admin"
                            ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-900"
                            : user.role === "Hospital Admin"
                              ? "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border-teal-100 dark:border-teal-900"
                              : user.role === "Donor"
                                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900"
                                : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900",
                        )}
                      >
                        {t(
                          user.role.toLowerCase().replace(/\s+/g, "_"),
                          user.role,
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {user.status === "Active" && (
                          <CheckCircle size={14} className="text-green-500" />
                        )}
                        {user.status === "Inactive" && (
                          <XCircle size={14} className="text-amber-500" />
                        )}
                        {user.status === "Pending" && (
                          <AlertCircle size={14} className="text-amber-500" />
                        )}
                        {user.status === "Banned" && (
                          <XCircle size={14} className="text-red-500" />
                        )}
                        <span
                          className={clsx(
                            "text-xs font-medium",
                            user.status === "Active"
                              ? "text-green-700 dark:text-green-400"
                              : user.status === "Inactive"
                                ? "text-amber-700 dark:text-amber-400"
                                : user.status === "Pending"
                                  ? "text-amber-700 dark:text-amber-400"
                                  : "text-red-700 dark:text-red-400",
                          )}
                        >
                          {t(user.status.toLowerCase(), user.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{user.joined}</td>
                    <td
                      className={clsx(
                        "px-6 py-4",
                        isRtl ? "text-left" : "text-right",
                      )}
                    >
                      <div
                        className={clsx(
                          "flex items-center gap-2",
                          isRtl ? "justify-start" : "justify-end",
                        )}
                      >
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                          aria-label={t("delete", "Delete")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    {t(
                      "no_users_found",
                      "No users found matching your search.",
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Mock */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-[#0f1117] border-t border-gray-100 dark:border-[#262833] flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t("rows_per_page", "Rows per page:")}
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white dark:bg-[#1c1e27] border border-gray-200 dark:border-[#262833] text-gray-700 dark:text-gray-300 text-sm rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
              {i18n.language.startsWith("ar") ? (
                <span>
                  عرض{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {startItem}-{endItem}
                  </span>{" "}
                  من{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {effectiveCount}
                  </span>
                </span>
              ) : (
                <span>
                  Showing{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {startItem}-{endItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {effectiveCount}
                  </span>
                </span>
              )}
            </span>
          </div>
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
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#171921] rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-[#262833] flex justify-between items-center bg-gray-50 dark:bg-[#0f1117]">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  {editingUser
                    ? t("edit_user", "Edit User")
                    : t("add_new_user", "Add New User")}
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                    setFormErrors({});
                    setShowFieldGuidance({
                      name: false,
                      email: false,
                      phone: false,
                      password: false,
                      role: false,
                      status: false,
                    });
                  }}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleSave} noValidate className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("full_name", "Full Name")}
                  </label>
                  <input
                    name="name"
                    defaultValue={editingUser?.name}
                    required
                    onFocus={() =>
                      setShowFieldGuidance((prev) => ({ ...prev, name: true }))
                    }
                    onChange={() => clearFieldError("name")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#262833] rounded-lg focus:ring-red-500 focus:border-red-500 outline-none dark:bg-[#1c1e27] dark:text-gray-200"
                  />
                  <AnimatePresence>
                    {(showFieldGuidance.name || formErrors.name) && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={clsx(
                          "mt-2 rounded-lg border px-3 py-2 text-xs flex items-start gap-2",
                          formErrors.name
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
                        )}
                      >
                        {formErrors.name ? (
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        ) : (
                          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                        )}
                        <span>
                          {formErrors.name
                            ? formErrors.name
                            : t(
                                "full_name_hint",
                                "Enter the user's full name.",
                              )}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("email", "Email Address")}
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingUser?.email}
                    required
                    disabled={!!editingUser}
                    onFocus={() =>
                      setShowFieldGuidance((prev) => ({ ...prev, email: true }))
                    }
                    onChange={handleEmailChange}
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        clearFieldError("email");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#262833] rounded-lg focus:ring-red-500 focus:border-red-500 outline-none dark:bg-[#1c1e27] dark:text-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {!editingUser && (
                    <AnimatePresence>
                      {(showFieldGuidance.email || formErrors.email) && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className={clsx(
                            "mt-2 rounded-lg border px-3 py-2 text-xs flex items-start gap-2",
                            formErrors.email
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
                          )}
                        >
                          {formErrors.email ? (
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          ) : (
                            <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                          )}
                          <span>
                            {formErrors.email
                              ? formErrors.email
                              : t(
                                  "email_hint",
                                  "Enter the user's email address.",
                                )}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("phone", "Phone")}
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={editingUser?.phone}
                    required={!editingUser}
                    disabled={!!editingUser}
                    onFocus={() =>
                      setShowFieldGuidance((prev) => ({ ...prev, phone: true }))
                    }
                    onChange={handlePhoneChange}
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        clearFieldError("phone");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#262833] rounded-lg focus:ring-red-500 focus:border-red-500 outline-none dark:bg-[#1c1e27] dark:text-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {!editingUser && (
                    <AnimatePresence>
                      {(showFieldGuidance.phone || formErrors.phone) && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className={clsx(
                            "mt-2 rounded-lg border px-3 py-2 text-xs flex items-start gap-2",
                            formErrors.phone
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
                          )}
                        >
                          {formErrors.phone ? (
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          ) : (
                            <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                          )}
                          <span>
                            {formErrors.phone
                              ? formErrors.phone
                              : t(
                                  "phone_hint",
                                  "Enter the user's phone number.",
                                )}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("password", "Password")}
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      onFocus={() =>
                        setShowFieldGuidance((prev) => ({
                          ...prev,
                          password: true,
                        }))
                      }
                      onChange={() => clearFieldError("password")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#262833] rounded-lg focus:ring-red-500 focus:border-red-500 outline-none dark:bg-[#1c1e27] dark:text-gray-200"
                    />
                    <AnimatePresence>
                      {(showFieldGuidance.password || formErrors.password) && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className={clsx(
                            "mt-2 rounded-lg border px-3 py-2 text-xs flex items-start gap-2",
                            formErrors.password
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
                          )}
                        >
                          {formErrors.password ? (
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          ) : (
                            <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                          )}
                          <span>
                            {formErrors.password
                              ? formErrors.password
                              : t(
                                  "password_hint",
                                  "Enter the user's password.",
                                )}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                <div
                  className={clsx(
                    "grid gap-4",
                    editingUser ? "grid-cols-2" : "grid-cols-1",
                  )}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("role", "Role")}
                    </label>
                    <select
                      name="role"
                      defaultValue={
                        editingUser
                          ? normalizeRoleValueForSelect(editingUser.role)
                          : "Donor"
                      }
                      onFocus={() =>
                        setShowFieldGuidance((prev) => ({
                          ...prev,
                          role: true,
                        }))
                      }
                      onChange={() => clearFieldError("role")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#262833] rounded-lg focus:ring-red-500 focus:border-red-500 outline-none dark:bg-[#1c1e27] dark:text-gray-200"
                    >
                      <option value="Admin">{t("admin", "Admin")}</option>
                      <option value="HospitalAdmin">
                        {t("hospital_admin", "Hospital Admin")}
                      </option>
                      <option value="Donor">{t("donor", "Donor")}</option>
                      <option value="User">{t("user", "User")}</option>
                    </select>
                    <AnimatePresence>
                      {(showFieldGuidance.role || formErrors.role) && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className={clsx(
                            "mt-2 rounded-lg border px-3 py-2 text-xs flex items-start gap-2",
                            formErrors.role
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
                          )}
                        >
                          {formErrors.role ? (
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          ) : (
                            <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                          )}
                          <span>
                            {formErrors.role
                              ? formErrors.role
                              : t(
                                  "role_hint",
                                  "Choose the right role for this user.",
                                )}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("status", "Status")}
                      </label>
                      <select
                        name="status"
                        defaultValue={editingUser?.status || "Active"}
                        onFocus={() =>
                          setShowFieldGuidance((prev) => ({
                            ...prev,
                            status: true,
                          }))
                        }
                        onChange={() => clearFieldError("status")}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-[#262833] rounded-lg focus:ring-red-500 focus:border-red-500 outline-none dark:bg-[#1c1e27] dark:text-gray-200"
                      >
                        <option value="Active">{t("active", "Active")}</option>
                        <option value="Inactive">
                          {t("inactive", "Inactive")}
                        </option>
                      </select>
                      <AnimatePresence>
                        {(showFieldGuidance.status || formErrors.status) && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className={clsx(
                              "mt-2 rounded-lg border px-3 py-2 text-xs flex items-start gap-2",
                              formErrors.status
                                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
                            )}
                          >
                            {formErrors.status ? (
                              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            ) : (
                              <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                            )}
                            <span>
                              {formErrors.status
                                ? formErrors.status
                                : t(
                                    "status_hint",
                                    "Set whether this user should be active.",
                                  )}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                {editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("joined", "Joined")}
                    </label>
                    <input
                      type="text"
                      defaultValue={editingUser?.joined || "-"}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#262833] rounded-lg bg-gray-50 dark:bg-[#1c1e27] text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                )}
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingUser(null);
                      setFormErrors({});
                      setShowFieldGuidance({
                        name: false,
                        email: false,
                        phone: false,
                        password: false,
                        role: false,
                        status: false,
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1c1e27] border border-gray-300 dark:border-[#262833] rounded-lg hover:bg-gray-50 dark:hover:bg-[#22242e]"
                  >
                    {t("cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingUser}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800"
                  >
                    {isSavingUser
                      ? t("saving", "Saving...")
                      : t("save_changes", "Save Changes")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteUserId !== null}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("delete_user", "Delete User")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "delete_user_confirm",
                "Are you sure you want to delete this user?",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeletingUser}
              className="bg-red-700 text-white hover:bg-red-800"
            >
              {isDeletingUser
                ? t("deleting", "Deleting...")
                : t("delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
