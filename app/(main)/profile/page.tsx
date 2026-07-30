"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Settings,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useCms } from "@/context/CmsContext";
import { L } from "@/lib/localeText";
import ProfileBrandShell, {
  useProfileBrand,
} from "@/components/profile/ProfileBrandShell";

const BASE_URL = SITE_STRINGS.base_url.url_backend;

function getAvatarUrl(path?: string | null) {
  if (!path) return null;
  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  return `${BASE_URL}/storage/${path}`;
}

export default function ProfilePage() {
  const { tUi } = useCms();
  const { locale } = useLocale();
  const router = useRouter();
  const brand = useProfileBrand();
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
  const [toast, setToast] = useState<string | null>(null);

  const copy = useMemo(
    () => ({
      title: tUi(
        "profile",
        "settings",
        L(locale, "Pengaturan Profil", "Profile Settings"),
      ),
      subtitle: L(
        locale,
        "Perbarui foto, kontak, dan alamat pengiriman utama Anda.",
        "Update your photo, contact info, and primary shipping address.",
      ),
      saving: L(locale, "Menyimpan perubahan...", "Saving changes..."),
      savingShort: L(locale, "Menyimpan...", "Saving..."),
      updateSuccess: L(
        locale,
        "Profil berhasil diperbarui.",
        "Profile updated successfully.",
      ),
      updateFailed: L(
        locale,
        "Gagal memperbarui informasi.",
        "Failed to update information.",
      ),
      networkError: L(
        locale,
        "Terjadi kesalahan jaringan.",
        "A network error occurred.",
      ),
      loadingTitle: L(locale, "Memuat profil...", "Loading profile..."),
      changePhoto: L(locale, "Ganti foto profil", "Change profile photo"),
      photoLabel: L(locale, "Foto Profil", "Profile Photo"),
      photoHint: L(
        locale,
        "JPG atau PNG, maks. 2MB.",
        "JPG or PNG, max. 2MB.",
      ),
      photoSaved: L(locale, "Foto sudah tersimpan", "Photo already saved"),
      photoReady: L(
        locale,
        "Foto baru siap diunggah",
        "New photo ready to upload",
      ),
      fullName: L(locale, "Nama Lengkap", "Full Name"),
      emailAddress: L(locale, "Alamat Email", "Email Address"),
      phoneNumber: L(locale, "Nomor Telepon", "Phone Number"),
      newPassword: L(locale, "Kata Sandi Baru", "New Password"),
      passwordHint: L(
        locale,
        "(kosongkan jika tidak diubah)",
        "(leave blank if unchanged)",
      ),
      passwordMin: L(
        locale,
        "Minimal 8 karakter",
        "At least 8 characters",
      ),
      hidePassword: L(locale, "Sembunyikan kata sandi", "Hide password"),
      showPassword: L(locale, "Tampilkan kata sandi", "Show password"),
      defaultAddress: L(
        locale,
        "Alamat Pengiriman Default",
        "Default Shipping Address",
      ),
      addressPlaceholder: L(
        locale,
        "Tuliskan alamat lengkap beserta kode pos...",
        "Write your full address including postal code...",
      ),
      saveButton: L(locale, "Simpan Perubahan", "Save Changes"),
      photoTooLarge: L(
        locale,
        "Ukuran foto maksimal 2MB.",
        "Photo must be 2MB or smaller.",
      ),
    }),
    [locale, tUi],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

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
    if (status.type) setStatus({ type: "", message: "" });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast(copy.photoTooLarge);
      e.target.value = "";
      return;
    }
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password.length < 8) {
      setStatus({ type: "error", message: copy.passwordMin });
      return;
    }

    setStatus({ type: "processing", message: copy.saving });

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("email", formData.email);
    payload.append("phone", formData.phone);
    payload.append("alamat_lengkap", formData.address);
    payload.append("nama_lengkap", formData.name);
    if (formData.password.trim()) {
      payload.append("password", formData.password.trim());
    }
    if (avatarFile) {
      payload.append("avatar_profile", avatarFile);
    }

    try {
      const data = await userProfileApi.updateProfile(payload);

      if (data.success) {
        setStatus({ type: "", message: "" });
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
        showToast(copy.updateSuccess);
      } else {
        setStatus({
          type: "error",
          message: data.message || copy.updateFailed,
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : copy.networkError,
      });
    }
  };

  const initial = (formData.name || formData.email || "?")
    .charAt(0)
    .toUpperCase();

  const inputClass =
    "w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 outline-none transition-all bg-white text-sm text-slate-900 font-medium focus:ring-2";
  const labelClass =
    "block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 mb-2";

  return (
    <>
      <ProfileBrandShell
        title={copy.title}
        subtitle={copy.subtitle}
        icon={Settings}
        loading={loading}
        loadingText={copy.loadingTitle}
      >
        {status.message && (
          <div
            className={`mb-5 p-4 rounded-2xl text-sm font-medium flex items-center gap-3 border ${
              status.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : status.type === "error"
                  ? "bg-rose-50 border-rose-100 text-rose-800"
                  : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            {status.type === "success" && (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            {status.type === "error" && (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            {status.type === "processing" && (
              <Loader2
                className="w-5 h-5 animate-spin shrink-0"
                style={{ color: brand }}
              />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 max-w-3xl bg-white rounded-2xl border border-gray-100 p-5 sm:p-7"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-2">
            <div className="relative group">
              <div
                className="h-24 w-24 rounded-full border-4 border-white overflow-hidden flex items-center justify-center ring-2"
                style={{
                  backgroundColor: `${brand}14`,
                  ["--tw-ring-color" as string]: `${brand}33`,
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Foto profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span
                    className="text-3xl font-bold"
                    style={{ color: brand }}
                  >
                    {initial}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 text-white p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: brand }}
                aria-label={copy.changePhoto}
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
              <p className="text-sm font-semibold text-slate-900">
                {copy.photoLabel}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {copy.photoHint}
              </p>
              {avatarPath && !avatarFile && (
                <p className="text-[11px] text-emerald-600 font-medium mt-1.5">
                  {copy.photoSaved}
                </p>
              )}
              {avatarFile && (
                <p className="text-[11px] text-amber-600 font-medium mt-1.5">
                  {copy.photoReady}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>{copy.fullName}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  style={{ ["--tw-ring-color" as string]: `${brand}55` }}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{copy.emailAddress}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  style={{ ["--tw-ring-color" as string]: `${brand}55` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>{copy.phoneNumber}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  maxLength={20}
                  className={inputClass}
                  style={{ ["--tw-ring-color" as string]: `${brand}55` }}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {copy.newPassword}{" "}
                <span className="text-slate-400 font-normal lowercase italic">
                  {copy.passwordHint}
                </span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  placeholder="••••••••"
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 outline-none transition-all bg-white text-sm text-slate-900 focus:ring-2"
                  style={{ ["--tw-ring-color" as string]: `${brand}55` }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label={
                    showPassword ? copy.hidePassword : copy.showPassword
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>{copy.defaultAddress}</label>
            <div className="relative">
              <span className="absolute top-4 left-0 flex items-start pl-4 text-slate-400">
                <MapPin className="w-4 h-4" />
              </span>
              <textarea
                name="address"
                rows={4}
                value={formData.address}
                onChange={handleChange}
                placeholder={copy.addressPlaceholder}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 outline-none transition-all bg-white text-sm text-slate-900 resize-none min-h-[100px] leading-relaxed focus:ring-2"
                style={{ ["--tw-ring-color" as string]: `${brand}55` }}
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={status.type === "processing"}
              className="w-full sm:w-auto text-white px-8 py-3.5 rounded-2xl font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: brand,
              }}
            >
              {status.type === "processing"
                ? copy.savingShort
                : copy.saveButton}
            </button>
          </div>
        </form>
      </ProfileBrandShell>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
