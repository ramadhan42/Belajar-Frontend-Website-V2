"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  Eye,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";

interface UserData {
  id: number;
  name: string;
  email: string;
  nama_lengkap: string | null;
  alamat_lengkap: string | null;
  is_admin?: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // View Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const baseUrl = SITE_STRINGS.base_url.url_backend;

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

  const openDeleteModal = (user: UserData) => {
    if (user.is_admin) return;
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Fungsi Eksekusi Hapus User
  const confirmDelete = async () => {
    if (!userToDelete) return;

    if (userToDelete.is_admin) {
      alert("Admin utama tidak dapat dihapus.");
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
        alert(errorData.message || "Gagal menghapus pengguna.");
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      alert("Gagal menghubungi server.");
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
      {/* Header & Pencarian */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semua Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan lihat daftar semua pengguna terdaftar.
          </p>
        </div>

        <div className="relative w-full sm:w-72 text-gray-500 focus-within:text-gray-900">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Cari nama atau email..."
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
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Pengguna</th>
                  <th className="px-6 py-4 font-semibold">Alamat / Info</th>
                  <th className="px-6 py-4 font-semibold">Bergabung</th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
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
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
                            {user.is_admin ? (
                              <ShieldCheck className="w-5 h-5 text-blue-600" />
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </div>
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
                          {user.alamat_lengkap || "Belum ada alamat"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openViewModal(user)}
                            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-5 h-5" />
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
                                ? "Admin tidak dapat dihapus"
                                : "Hapus Pengguna"
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
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "Tidak ada pengguna yang cocok dengan pencarian."
                        : "Belum ada data pengguna."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          {!loading && filteredUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 gap-4">
              <div className="text-xs text-gray-500 text-center sm:text-left">
                Menampilkan{" "}
                <span className="font-semibold text-gray-700">
                  {startIndex + 1}
                </span>{" "}
                sampai{" "}
                <span className="font-semibold text-gray-700">
                  {Math.min(startIndex + itemsPerPage, filteredUsers.length)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-gray-700">
                  {filteredUsers.length}
                </span>{" "}
                pengguna
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>
                <span className="text-xs text-gray-500 font-medium min-w-[50px] text-center">
                  Hal {currentPage} dari {totalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      </div>

      {/* Modal Hapus Pengguna */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Hapus Pengguna?
                </h3>
                <p className="text-sm text-gray-500">
                  Tindakan ini tidak dapat dibatalkan. Pengguna{" "}
                  <span className="font-semibold text-gray-700">
                    {userToDelete.name}
                  </span>{" "}
                  akan dihapus secara permanen dari sistem.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal View Detail Pengguna */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Detail Pengguna
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  {selectedUser.is_admin ? (
                    <ShieldCheck className="w-8 h-8" />
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {selectedUser.name}
                    {selectedUser.is_admin && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-blue-50 text-blue-600 border border-blue-100">
                        ADMIN
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    ID Pengguna
                  </p>
                  <p className="text-gray-900 font-medium">
                    #{selectedUser.id}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Nama Lengkap
                  </p>
                  <p className="text-gray-900 font-medium">
                    {selectedUser.nama_lengkap || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Tanggal Bergabung
                  </p>
                  <p className="text-gray-900 font-medium">
                    {formatDate(selectedUser.created_at)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Alamat Lengkap
                  </p>
                  <p className="text-gray-900 font-medium leading-relaxed">
                    {selectedUser.alamat_lengkap ||
                      "Belum ada alamat yang didaftarkan."}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
