"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, Eye, X, User } from "lucide-react";

// Tipe data berdasarkan contoh JSON Anda sebelumnya
interface UserData {
  id: number;
  name: string;
  email: string;
  nama_lengkap: string | null;
  alamat_lengkap: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk modal View
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:8000";

  // Fetch data dari API
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
        // Tergantung respon API Anda, jika dibungkus "data", gunakan result.data
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

  // Filter pencarian (mencari berdasarkan nama atau email)
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Format tanggal untuk tampilan yang lebih rapi
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm">Memuat data pengguna...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold pl-25">Pengguna</th>
                  <th className="px-6 py-4 font-semibold">Alamat / Info</th>
                  <th className="px-6 py-4 font-semibold">Bergabung</th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        #{user.id}
                      </td>
                      <td className="px-6 py-4 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.email}
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
                        <button
                          onClick={() => openViewModal(user)}
                          className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
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
        )}
      </div>

      {/* Modal View Detail Pengguna */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
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

            {/* Content Modal */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {selectedUser.name}
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

            {/* Footer Modal */}
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
