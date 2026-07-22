"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SITE_STRINGS } from "@/components/constans/strings";
import { userProfileApi } from "@/lib/api";
import {
  Loader2,
  User,
  Mail,
  Lock,
  MapPin,
  Phone,
  Camera,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const BASE_URL = SITE_STRINGS.base_url.url_backend;

function getAvatarUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  return `${BASE_URL}/storage/${path}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await userProfileApi.getProfile();
        if (data.success && data.data) {
          const user = data.data;
          setFormData({
            name: user.name || user.nama_lengkap || "",
            email: user.email || "",
            password: "",
            phone: user.phone || "",
            address: user.alamat_lengkap || "",
          });
          setAvatarPath(user.avatar_profile || null);
          setAvatarPreview(getAvatarUrl(user.avatar_profile));
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "processing", message: "Menyimpan perubahan..." });

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("email", formData.email);
    payload.append("phone", formData.phone);
    payload.append("alamat_lengkap", formData.address);
    payload.append("nama_lengkap", formData.name);
    if (avatarFile) {
      payload.append("avatar_profile", avatarFile);
    }

    try {
      const data = await userProfileApi.updateProfile(payload);

      if (data.success) {
        setStatus({
          type: "success",
          message: "Informasi pribadi berhasil diperbarui!",
        });
        setFormData((prev) => ({ ...prev, password: "" }));
        setAvatarFile(null);
        if (data.data?.avatar_profile) {
          setAvatarPath(data.data.avatar_profile);
          setAvatarPreview(getAvatarUrl(data.data.avatar_profile));
        }

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
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan jaringan.",
      });
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

  const initial = (formData.name || formData.email || "?").charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm shadow-gray-100/50 animate-fade-in">
      <div className="border-b border-gray-100 pb-5 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Informasi Pribadi
        </h1>
        <p className="text-sm text-gray-500 font-light mt-1">
          Perbarui foto profil, nomor telepon, email, dan alamat pengiriman
          utama Anda di sini.
        </p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-2">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center ring-1 ring-gray-100">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Foto profil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-gray-500">{initial}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors shadow-lg"
              aria-label="Ganti foto profil"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              name="avatar_profile"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-gray-900">Foto Profil</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              JPG atau PNG, maks. 2MB. Klik ikon kamera untuk mengganti foto.
            </p>
            {avatarPath && !avatarFile && (
              <p className="text-[11px] text-emerald-600 font-medium mt-1.5">
                Foto sudah tersimpan
              </p>
            )}
            {avatarFile && (
              <p className="text-[11px] text-amber-600 font-medium mt-1.5">
                Foto baru siap diunggah
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
              Nomor Telepon
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                maxLength={20}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/30 focus:bg-white text-sm text-gray-900 font-medium"
              />
            </div>
          </div>

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
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                placeholder="••••••••"
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50/30 focus:bg-white text-sm text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label={
                  showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

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
