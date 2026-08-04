"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  Eye,
  X,
  User,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Edit2,
  Camera,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";
import AdminModal from "@/components/admin/AdminModal";
import AdminAlertModal from "@/components/admin/AdminAlertModal";
import AdminTablePagination from "@/components/admin/AdminTablePagination";
import { useAdminI18n } from "@/hooks/useAdminI18n";
import {
  formatPresenceDateTime,
  formatPresenceRelative,
} from "@/lib/formatPresence";

interface UserData {
  id: number;
  name: string;
  email: string;
  nama_lengkap: string | null;
  alamat_lengkap: string | null;
  avatar_profile?: string | null;
  phone?: string | null;
  is_admin?: boolean;
  created_at: string;
  last_login_at?: string | null;
  last_seen_at?: string | null;
}

type EditFormState = {
  name: string;
  email: string;
  nama_lengkap: string;
  alamat_lengkap: string;
  phone: string;
  password: string;
  is_admin: boolean;
};

function getAvatarUrl(path?: string | null) {
  if (!path) return null;
  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  return `${SITE_STRINGS.base_url.url_backend}/storage/${path}`;
}

function UserAvatar({
  user,
  size = "md",
}: {
  user: Pick<UserData, "name" | "avatar_profile" | "is_admin">;
  size?: "sm" | "md" | "lg";
}) {
  const url = getAvatarUrl(user.avatar_profile);
  const sizeClass =
    size === "lg" ? "w-16 h-16" : size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconClass = size === "lg" ? "w-8 h-8" : size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const initial = (user.name || "?").trim().charAt(0).toUpperCase() || "?";

  if (url) {
    return (
      <div
        className={`${sizeClass} rounded-full overflow-hidden border border-gray-100 shadow-sm bg-gray-50 shrink-0`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={user.name || "Avatar"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm shrink-0`}
      title={initial}
    >
      {user.is_admin ? (
        <ShieldCheck className={`${iconClass} text-blue-600`} />
      ) : (
        <User className={iconClass} />
      )}
    </div>
  );
}

export default function UsersPage() {
  const { t, common, locale } = useAdminI18n();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // View Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    name: "",
    email: "",
    nama_lengkap: "",
    alamat_lengkap: "",
    phone: "",
    password: "",
    is_admin: false,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [alertDialog, setAlertDialog] = useState<{
    title: string;
    message: string;
    variant: "info" | "success" | "error";
  } | null>(null);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const baseUrl = SITE_STRINGS.base_url.url_backend;

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const result = await res.json();
        setUsers(result.data || result);
      } else {
        console.error("Gagal mengambil data users.");
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const openViewModal = (user: UserData) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const openEditModal = (user: UserData) => {
    setUserToEdit(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      nama_lengkap: user.nama_lengkap || "",
      alamat_lengkap: user.alamat_lengkap || "",
      phone: user.phone || "",
      password: "",
      is_admin: Boolean(user.is_admin),
    });
    setAvatarFile(null);
    setAvatarPreview(getAvatarUrl(user.avatar_profile));
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setUserToEdit(null);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleAvatarPick = (file?: File | null) => {
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveEdit = async () => {
    if (!userToEdit) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      showNotification(
        t(
          "users",
          "edit_required",
          "Nama dan email wajib diisi.",
          "Name and email are required.",
        ),
        "error",
      );
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem("auth_token");
    const formData = new FormData();
    formData.append("name", editForm.name.trim());
    formData.append("email", editForm.email.trim());
    formData.append("nama_lengkap", editForm.nama_lengkap.trim());
    formData.append("alamat_lengkap", editForm.alamat_lengkap.trim());
    formData.append("phone", editForm.phone.trim());
    formData.append("is_admin", editForm.is_admin ? "1" : "0");
    if (editForm.password.trim()) {
      formData.append("password", editForm.password.trim());
    }
    if (avatarFile) {
      formData.append("avatar_profile", avatarFile);
    }

    try {
      const res = await fetch(`${baseUrl}/api/admin/users/${userToEdit.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            t(
              "users",
              "edit_error",
              "Gagal memperbarui pengguna.",
              "Failed to update user.",
            ),
        );
      }

      const updated = data.data as UserData;
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
      );
      if (selectedUser?.id === updated.id) {
        setSelectedUser({ ...selectedUser, ...updated });
      }
      closeEditModal();
      showNotification(
        t(
          "users",
          "edit_success",
          "Data pengguna berhasil diperbarui.",
          "User updated successfully.",
        ),
        "success",
      );
    } catch (error) {
      showNotification(
        error instanceof Error
          ? error.message
          : t(
              "users",
              "edit_error",
              "Gagal memperbarui pengguna.",
              "Failed to update user.",
            ),
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (user: UserData) => {
    if (user.is_admin) return;
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Fungsi Eksekusi Hapus User
  const confirmDelete = async () => {
    if (!userToDelete) return;

    if (userToDelete.is_admin) {
      setAlertDialog({
        title: t(
          "users",
          "admin_protected_title",
          "Aksi tidak diizinkan",
          "Action not allowed",
        ),
        message: t(
          "users",
          "admin_protected",
          "Admin utama tidak dapat dihapus.",
          "The primary admin cannot be deleted.",
        ),
        variant: "error",
      });
      setIsDeleteModalOpen(false);
      return;
    }

    setIsDeleting(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(`${baseUrl}/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        // Hapus user dari state tanpa perlu refresh halaman
        setUsers(users.filter((u) => u.id !== userToDelete.id));
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        const errorData = await res.json();
        setAlertDialog({
          title: t(
            "users",
            "delete_failed_title",
            "Gagal menghapus",
            "Delete failed",
          ),
          message:
            errorData.message ||
            t(
              "users",
              "delete_error",
              "Gagal menghapus pengguna.",
              "Failed to delete user.",
            ),
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      setAlertDialog({
        title: t(
          "users",
          "network_error_title",
          "Koneksi bermasalah",
          "Connection issue",
        ),
        message: t(
          "users",
          "server_contact_error",
          "Gagal menghubungi server.",
          "Failed to contact the server.",
        ),
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification ? (
        <div
          className={`fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-rose-50 text-rose-700 border border-rose-100"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {notification.message}
        </div>
      ) : null}

      <AdminAlertModal
        open={!!alertDialog}
        onClose={() => setAlertDialog(null)}
        title={alertDialog?.title || ""}
        message={alertDialog?.message || ""}
        variant={alertDialog?.variant || "info"}
        buttonLabel={common.close}
      />

      {/* Header & Pencarian */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("users", "title", "Semua Pengguna", "All Users")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              "users",
              "subtitle",
              "Kelola dan lihat daftar semua pengguna terdaftar.",
              "Manage and view all registered users.",
            )}
          </p>
        </div>

        <div className="relative w-full sm:w-72 text-gray-500 focus-within:text-gray-900">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder={t(
              "users",
              "search_ph",
              "Cari nama atau email...",
              "Search name or email...",
            )}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">{common.id}</th>
                  <th className="px-6 py-4 font-semibold">
                    {t("users", "col_avatar", "Avatar", "Avatar")}
                  </th>
                  <th className="px-6 py-4 font-semibold">{common.user}</th>
                  <th className="px-6 py-4 font-semibold">
                    {t("users", "col_address", "Alamat / Info", "Address / Info")}
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    {t("users", "col_joined", "Bergabung", "Joined")}
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    {t("users", "col_last_login", "Last Login", "Last Login")}
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    {t("users", "col_last_seen", "Last Seen", "Last Seen")}
                  </th>
                  <th className="px-6 py-4 font-semibold text-center">{common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        #{user.id}
                      </td>
                      <td className="px-6 py-4">
                        <UserAvatar user={user} size="md" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-gray-900">
                                {user.email}
                              </div>
                              {user.is_admin && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-blue-50 text-blue-600 border border-blue-100">
                                  ADMIN USER
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="truncate max-w-[200px] block">
                          {user.alamat_lengkap || t("users", "no_address", "Belum ada alamat", "No address yet")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                        {formatPresenceDateTime(user.last_login_at, locale)}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-xs text-gray-600"
                        title={formatPresenceDateTime(user.last_seen_at, locale)}
                      >
                        {formatPresenceRelative(user.last_seen_at, locale)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openViewModal(user)}
                            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t("users", "view_detail", "Lihat Detail", "View Detail")}
                          >
                            <Eye className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => openEditModal(user)}
                            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title={t("users", "edit_user", "Edit Pengguna", "Edit User")}
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>

                          {/* Logic Render Button Hapus */}
                          <button
                            onClick={() =>
                              !user.is_admin && openDeleteModal(user)
                            }
                            disabled={!!user.is_admin}
                            className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                              user.is_admin
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                            }`}
                            title={
                              user.is_admin
                                ? t(
                                    "users",
                                    "admin_no_delete",
                                    "Admin tidak dapat dihapus",
                                    "Admin cannot be deleted",
                                  )
                                : t(
                                    "users",
                                    "delete_user",
                                    "Hapus Pengguna",
                                    "Delete User",
                                  )
                            }
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchQuery
                        ? t(
                            "users",
                            "empty_search",
                            "Tidak ada pengguna yang cocok dengan pencarian.",
                            "No users match your search.",
                          )
                        : t(
                            "users",
                            "empty",
                            "Belum ada data pengguna.",
                            "No users yet.",
                          )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          {!loading && filteredUsers.length > 0 && (
            <AdminTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              itemLabel={t("users", "users_word", "pengguna", "users")}
              onPageChange={setCurrentPage}
              hideWhenSinglePage={false}
              className="bg-gray-50/50 px-6 py-4"
            />
          )}
        </>
      </div>

      {/* Modal Hapus Pengguna */}
      <AdminModal
        open={isDeleteModalOpen && !!userToDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        panelClassName="max-w-sm"
      >
          <div className="bg-white rounded-2xl w-full shadow-2xl border border-gray-100 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {t("users", "confirm_delete_title", "Hapus Pengguna?", "Delete User?")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t(
                    "users",
                    "confirm_delete_desc_1",
                    "Tindakan ini tidak dapat dibatalkan. Pengguna",
                    "This action cannot be undone. The user",
                  )}{" "}
                  <span className="font-semibold text-gray-700">
                    {userToDelete?.name}
                  </span>{" "}
                  {t(
                    "users",
                    "confirm_delete_desc_2",
                    "akan dihapus secara permanen dari sistem.",
                    "will be permanently deleted from the system.",
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                {common.cancel}
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("users", "deleting", "Menghapus...", "Deleting...")}
                  </>
                ) : (
                  common.yes_delete
                )}
              </button>
            </div>
          </div>
      </AdminModal>

      {/* Modal View Detail Pengguna */}
      <AdminModal
        open={isViewModalOpen && !!selectedUser}
        onClose={() => setIsViewModalOpen(false)}
        panelClassName="max-w-lg max-h-[80vh]"
      >
          <div className="bg-white rounded-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">
                {t("users", "detail_title", "Detail Pengguna", "User Detail")}
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
              <div className="flex items-center gap-3 pb-1">
                {selectedUser ? (
                  <UserAvatar user={selectedUser} size="lg" />
                ) : null}
                <div className="min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 flex flex-wrap items-center gap-2">
                    <span className="truncate">{selectedUser?.name}</span>
                    {selectedUser?.is_admin && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-blue-50 text-blue-600 border border-blue-100">
                        ADMIN
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    {selectedUser?.email}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {selectedUser?.avatar_profile
                      ? t(
                          "users",
                          "avatar_set",
                          "Avatar tersedia",
                          "Avatar available",
                        )
                      : t(
                          "users",
                          "avatar_empty",
                          "Belum mengunggah avatar",
                          "No avatar uploaded",
                        )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {t("users", "user_id", "ID Pengguna", "User ID")}
                  </p>
                  <p className="text-gray-900 font-medium">
                    #{selectedUser?.id}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {t("users", "joined_date", "Tanggal Bergabung", "Joined Date")}
                  </p>
                  <p className="text-gray-900 font-medium">
                    {selectedUser ? formatDate(selectedUser.created_at) : ""}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {t("users", "last_login", "Last Login", "Last Login")}
                  </p>
                  <p className="text-gray-900 font-medium">
                    {selectedUser
                      ? formatPresenceDateTime(selectedUser.last_login_at, locale)
                      : ""}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {t("users", "last_seen", "Last Seen", "Last Seen")}
                  </p>
                  <p
                    className="text-gray-900 font-medium"
                    title={
                      selectedUser
                        ? formatPresenceDateTime(selectedUser.last_seen_at, locale)
                        : undefined
                    }
                  >
                    {selectedUser
                      ? formatPresenceRelative(selectedUser.last_seen_at, locale)
                      : ""}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {t("users", "full_name", "Nama Lengkap", "Full Name")}
                  </p>
                  <p className="text-gray-900 font-medium">
                    {selectedUser?.nama_lengkap || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {t("users", "phone", "Telepon", "Phone")}
                  </p>
                  <p className="text-gray-900 font-medium">
                    {selectedUser?.phone || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {t("users", "full_address", "Alamat Lengkap", "Full Address")}
                  </p>
                  <p className="text-gray-900 font-medium leading-relaxed">
                    {selectedUser?.alamat_lengkap ||
                      t(
                        "users",
                        "no_address_registered",
                        "Belum ada alamat yang didaftarkan.",
                        "No address registered yet.",
                      )}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end gap-2">
              <button
                onClick={() => {
                  if (!selectedUser) return;
                  setIsViewModalOpen(false);
                  openEditModal(selectedUser);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {common.edit}
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                {common.close}
              </button>
            </div>
          </div>
      </AdminModal>

      {/* Modal Edit Pengguna */}
      <AdminModal
        open={isEditModalOpen && !!userToEdit}
        onClose={closeEditModal}
        panelClassName="max-w-lg max-h-[80vh]"
      >
        <div className="bg-white rounded-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h3 className="text-lg font-bold text-gray-900">
              {t("users", "edit_title", "Edit Pengguna", "Edit User")}
            </h3>
            <button
              onClick={closeEditModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-400">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-800">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      handleAvatarPick(e.target.files?.[0] ?? null)
                    }
                  />
                </label>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userToEdit?.email}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t(
                    "users",
                    "edit_avatar_hint",
                    "Klik ikon kamera untuk ganti avatar.",
                    "Click the camera icon to change avatar.",
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider sm:col-span-2">
                {t("users", "field_name", "Nama", "Name")}
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
                />
              </label>

              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider sm:col-span-2">
                Email
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
                />
              </label>

              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider sm:col-span-2">
                {t("users", "full_name", "Nama Lengkap", "Full Name")}
                <input
                  value={editForm.nama_lengkap}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      nama_lengkap: e.target.value,
                    }))
                  }
                  className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
                />
              </label>

              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider sm:col-span-2">
                {t("users", "phone", "Telepon", "Phone")}
                <input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
                />
              </label>

              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider sm:col-span-2">
                {t("users", "full_address", "Alamat Lengkap", "Full Address")}
                <textarea
                  rows={3}
                  value={editForm.alamat_lengkap}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      alamat_lengkap: e.target.value,
                    }))
                  }
                  className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                />
              </label>

              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider sm:col-span-2">
                {t(
                  "users",
                  "password_optional",
                  "Password baru (opsional)",
                  "New password (optional)",
                )}
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder={t(
                    "users",
                    "password_placeholder",
                    "Kosongkan jika tidak diganti",
                    "Leave blank to keep current",
                  )}
                  className="mt-1.5 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
                  autoComplete="new-password"
                />
              </label>

              <label className="flex items-center gap-3 sm:col-span-2 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-3">
                <input
                  type="checkbox"
                  checked={editForm.is_admin}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      is_admin: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300"
                />
                <span>
                  {t(
                    "users",
                    "toggle_admin",
                    "Jadikan Admin Evomi",
                    "Make Evomi Admin",
                  )}
                </span>
              </label>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeEditModal}
              disabled={isSaving}
              className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-60"
            >
              {common.cancel}
            </button>
            <button
              type="button"
              onClick={() => void saveEdit()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit2 className="w-4 h-4" />
              )}
              {isSaving ? common.saving : common.save_changes}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
