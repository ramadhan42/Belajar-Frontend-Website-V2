"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SITE_STRINGS } from "@/components/constans/strings";
import {
  Loader2,
  User,
  Mail,
  Lock,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const BASE_URL =
  process.env.NEXT_PUBLIC_URL || SITE_STRINGS.base_url.url_backend_deploy;

export default function ProfilePage() {
  const router = useRouter();

  // State form mengikuti struktur desain awal
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });

  // 1. READ: Mengambil data profil saat halaman pertama kali dimuat
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login"); // Lempar ke login jika belum ada token
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || BASE_URL + "/api"}/user/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await res.json();
        if (res.ok && data.success) {
          setFormData({
            name: data.data.name || data.data.nama_lengkap || "",
            email: data.data.email || "",
            password: "", // Jangan tampilkan password lama
            address: data.data.alamat_lengkap || "", // Menyesuaikan dengan kolom DB
          });
        }
      } catch (error) {
        console.error("Gagal mengambil profil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. UPDATE: Menyimpan data ketika tombol form disubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "processing", message: "Menyimpan perubahan..." });

    const token = localStorage.getItem("auth_token");

    // Siapkan payload, map 'address' dari form ke 'alamat_lengkap' di backend
    const payload: any = {
      name: formData.name,
      email: formData.email,
      alamat_lengkap: formData.address,
    };

    // Hanya kirim password jika pengguna mengisi kolom password baru
    if (formData.password.trim() !== "") {
      payload.password = formData.password;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://belajar-be-website-evomi-v2-main-gbcsym.free.laravel.cloud/api"}/user/profile`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: "success",
          message: "Informasi pribadi berhasil diperbarui!",
        });
        setFormData((prev) => ({ ...prev, password: "" })); // Kosongkan input password setelah sukses

        // Sinkronisasi ke localStorage agar Navbar langsung terupdate
        const userRaw = localStorage.getItem("auth_user");
        if (userRaw) {
          const user = JSON.parse(userRaw);
          localStorage.setItem(
            "auth_user",
            JSON.stringify({ ...user, ...data.data }),
          );
          window.dispatchEvent(new Event("auth-change"));
        }
      } else {
        setStatus({
          type: "error",
          message: data.message || "Gagal memperbarui informasi.",
        });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Terjadi kesalahan jaringan." });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[450px] shadow-sm shadow-gray-100/50">
        <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-50 mb-4 animate-pulse">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
        </div>
        <p className="text-gray-800 font-semibold text-base">
          Sinkronisasi Data
        </p>
        <p className="text-gray-400 text-sm font-light mt-1">
          Mengambil profil akun Anda...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm shadow-gray-100/50 animate-fade-in">
      <div className="border-b border-gray-100 pb-5 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Informasi Pribadi
        </h1>
        <p className="text-sm text-gray-500 font-light mt-1">
          Perbarui informasi akun, email, dan alamat pengiriman utama Anda di
          sini.
        </p>
      </div>

      {/* Notifikasi Status Penyimpanan */}
      {status.message && (
        <div
          className={`mb-6 p-4 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center gap-3 border ${
            status.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : status.type === "error"
                ? "bg-rose-50 border-rose-100 text-rose-800"
                : "bg-gray-50 border-gray-100 text-gray-700 animate-pulse"
          }`}
        >
          {status.type === "success" && (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          {status.type === "error" && (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          {status.type === "processing" && (
            <Loader2 className="w-5 h-5 text-gray-600 animate-spin shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Form dengan UI Modern */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nama Lengkap */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/30 focus:bg-white text-sm text-gray-900 font-medium"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
              Alamat Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/30 focus:bg-white text-sm text-gray-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Password Baru */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
            Kata Sandi Baru{" "}
            <span className="text-gray-400 font-normal lowercase italic">
              (kosongkan jika tidak diubah)
            </span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              name="password"
              value={formData.password}
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/30 focus:bg-white text-sm text-gray-900"
            />
          </div>
        </div>

        {/* Alamat */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
            Alamat Pengiriman Default
          </label>
          <div className="relative">
            <span className="absolute top-4 left-0 flex items-start pl-4 text-gray-400">
              <MapPin className="w-4 h-4" />
            </span>
            <textarea
              name="address"
              rows={4}
              value={formData.address}
              onChange={handleChange}
              placeholder="Tuliskan alamat lengkap beserta kode pos..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/30 focus:bg-white text-sm text-gray-900 resize-none min-h-[100px] leading-relaxed"
            />
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={status.type === "processing"}
            className="w-full sm:w-auto bg-black text-white px-8 py-3.5 rounded-2xl font-semibold text-sm hover:bg-gray-800 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-black/5 uppercase tracking-wider"
          >
            {status.type === "processing" ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
