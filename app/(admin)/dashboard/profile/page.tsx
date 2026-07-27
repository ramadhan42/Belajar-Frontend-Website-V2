"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  Camera,
  AlertCircle,
  KeyRound,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { SITE_STRINGS } from "@/components/constans/strings";
import AdminModal from "@/components/admin/AdminModal";
import { useAdminI18n } from "@/hooks/useAdminI18n";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  nama_lengkap: string | null;
  alamat_lengkap: string | null;
  phone: string | null;
  avatar_profile: string | null;
  is_admin?: boolean;
}

function getAvatarUrl(baseUrl: string, path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  return `${baseUrl}/storage/${path}`;
}

function formatAdminDate(value: string, locale: "id" | "en") {
  try {
    return new Date(value).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function ProfilePage() {
  const { t, common, locale } = useAdminI18n();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const baseUrl = SITE_STRINGS.base_url.url_backend;

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3200);
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${baseUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data?.data || null);
    } catch (error) {
      console.error("Gagal ambil profil:", error);
      showNotification(
        t("profile", "load_error", "Gagal memuat profil.", "Failed to load profile."),
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAdmin = profile?.id === 1 || profile?.is_admin === true;
  const isVerified = isAdmin || Boolean(profile?.email_verified_at);
  const displayName = profile?.nama_lengkap || profile?.name || "—";
  const avatarSrc = avatarPreview || getAvatarUrl(baseUrl, profile?.avatar_profile);

  const copy = useMemo(
    () => ({
      subtitle: t(
        "profile",
        "subtitle",
        "Kelola identitas admin, kontak, dan alamat utama Anda.",
        "Manage your admin identity, contact info, and primary address.",
      ),
      memberSince: t("profile", "member_since", "Bergabung sejak", "Member since"),
      lastUpdated: t("profile", "last_updated", "Terakhir diperbarui", "Last updated"),
      accountOverview: t(
        "profile",
        "account_overview",
        "Ringkasan Akun",
        "Account Overview",
      ),
      contactInfo: t("profile", "contact_info", "Informasi Kontak", "Contact Information"),
      shippingAddress: t(
        "profile",
        "address_label",
        "Alamat Pengiriman",
        "Shipping Address",
      ),
      noAddress: t(
        "profile",
        "no_address",
        "Belum ada alamat. Tambahkan lewat Edit Profil.",
        "No address yet. Add one via Edit Profile.",
      ),
      passwordOptional: t(
        "profile",
        "password_optional",
        "Kata Sandi Baru (opsional)",
        "New Password (optional)",
      ),
      passwordHint: t(
        "profile",
        "password_hint",
        "Kosongkan jika tidak ingin mengubah",
        "Leave blank to keep current password",
      ),
      updateSuccess: t(
        "profile",
        "update_success",
        "Profil berhasil diperbarui.",
        "Profile updated successfully.",
      ),
    }),
    [t],
  );

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    const formData = new FormData(e.currentTarget);

    try {
      setSaving(true);
      const res = await fetch(`${baseUrl}/api/user/profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message ||
            t(
              "profile",
              "update_error",
              "Gagal memperbarui profil",
              "Failed to update profile",
            ),
        );
      }

      if (data?.data) {
        const userRaw = localStorage.getItem("auth_user") || localStorage.getItem("user");
        const prev = userRaw ? JSON.parse(userRaw) : {};
        const merged = { ...prev, ...data.data };
        localStorage.setItem("auth_user", JSON.stringify(merged));
        localStorage.setItem("user", JSON.stringify(merged));
        window.dispatchEvent(new Event("auth-change"));
      }

      setIsEditModalOpen(false);
      setAvatarPreview(null);
      showNotification(copy.updateSuccess, "success");
      fetchProfile();
    } catch (error: unknown) {
      showNotification(
        error instanceof Error
          ? error.message
          : t(
              "profile",
              "update_error",
              "Gagal memperbarui profil",
              "Failed to update profile",
            ),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = () => {
    setAvatarPreview(null);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 pb-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2"
        >
          <div className="h-9 w-56 bg-gray-200 rounded-xl animate-pulse" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left center" }}
            className="h-1 w-16 rounded-full bg-[#1172BA]/40"
          />
          <div className="h-4 w-80 max-w-full bg-gray-100 rounded-lg animate-pulse" />
        </motion.div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="h-36 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse" />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="px-6 sm:px-8 pb-8 -mt-12"
          >
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
              <div className="h-28 w-28 rounded-2xl bg-gray-200 animate-pulse ring-4 ring-white shadow-lg" />
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="flex-1 space-y-2 pb-1"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "12rem" }}
                  transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="h-7 bg-gray-200 rounded-lg max-w-full"
                />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
              </motion.div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.28 + i * 0.06 }}
                  className="h-20 bg-gray-50 rounded-xl border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (!profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-gray-700 font-semibold">{common.empty}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {notification ? (
        <div
          className={`fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {notification.message}
        </div>
      ) : null}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-[#1172BA]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#1172BA]" />
            </span>
            {t("profile", "title", "Profil Saya", "My Profile")}
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm max-w-xl">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={openEditModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition shadow-sm"
        >
          <Edit2 size={16} />
          {t("profile", "edit_button", "Edit Profil", "Edit Profile")}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-2xl shadow-[0_2px_24px_rgb(0,0,0,0.05)] border border-gray-100 overflow-hidden"
      >
        {/* Cover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-36 sm:h-40 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1172BA] via-[#0d5f9e] to-slate-900" />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_50%,white_0%,transparent_50%)]" />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end"
          >
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-white/15 text-white border border-white/25 backdrop-blur-sm">
                <ShieldCheck size={13} />
                {t("profile", "admin_user", "Admin User", "Admin User")}
              </span>
            ) : null}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide backdrop-blur-sm border ${
                isVerified
                  ? "bg-emerald-500/20 text-emerald-50 border-emerald-300/30"
                  : "bg-amber-500/20 text-amber-50 border-amber-300/30"
              }`}
            >
              {isVerified ? <BadgeCheck size={13} /> : <Clock size={13} />}
              {isVerified
                ? t("profile", "verified", "Terverifikasi", "Verified")
                : t("profile", "unverified", "Belum Verifikasi", "Not Verified")}
            </span>
          </motion.div>
        </motion.div>

        <div className="px-6 sm:px-8 pb-8 relative z-10">
          {/* Avatar overlap cover; nama tetap di area putih di bawah banner */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
            <div className="relative shrink-0 -mt-14 sm:-mt-12 z-20">
              <div className="h-28 w-28 rounded-2xl bg-white p-1 shadow-xl ring-4 ring-white overflow-hidden">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.1 }}
                    className="h-full w-full rounded-xl bg-gradient-to-br from-[#1172BA] to-slate-800 flex items-center justify-center text-white text-3xl font-bold"
                  >
                    {(profile.name || "A").charAt(0).toUpperCase()}
                  </motion.div>
                )}
              </div>
              {isAdmin ? (
                <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <Sparkles size={14} />
                </span>
              ) : null}
            </div>

            <div className="flex-1 min-w-0 relative z-10 sm:pt-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                {displayName}
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">@{profile.name}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">ID #{profile.id}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
            <StatPill
              icon={Calendar}
              label={copy.memberSince}
              value={formatAdminDate(profile.created_at, locale)}
            />
            <StatPill
              icon={Clock}
              label={copy.lastUpdated}
              value={formatAdminDate(profile.updated_at, locale)}
            />
            <StatPill
              icon={Mail}
              label={t("profile", "email_label", "Alamat Email", "Email Address")}
              value={profile.email}
              truncate
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
          >
            {/* Contact card */}
            <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 sm:p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                  <User size={16} className="text-[#1172BA]" />
                </span>
                {copy.contactInfo}
              </h3>
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
                }}
                className="space-y-4"
              >
                <InfoRow
                  icon={User}
                  label={t("profile", "fullname_label", "Nama Lengkap", "Full Name")}
                  value={
                    profile.nama_lengkap ||
                    t("profile", "not_set", "Belum diatur", "Not set")
                  }
                />
                <InfoRow
                  icon={Phone}
                  label={t("profile", "phone_label", "Nomor Telepon", "Phone Number")}
                  value={
                    profile.phone || t("profile", "not_set", "Belum diatur", "Not set")
                  }
                />
                <InfoRow
                  icon={Mail}
                  label={t("profile", "email_label", "Alamat Email", "Email Address")}
                  value={profile.email}
                />
              </motion.div>
            </section>

            {/* Address + account */}
            <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 sm:p-6 flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                  <MapPin size={16} className="text-[#1172BA]" />
                </span>
                {copy.shippingAddress}
              </h3>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.18 }}
                className="flex-1 rounded-xl bg-white border border-gray-100 p-4 text-sm text-gray-700 leading-relaxed"
              >
                {profile.alamat_lengkap ? (
                  profile.alamat_lengkap
                ) : (
                  <span className="text-gray-400 italic">{copy.noAddress}</span>
                )}
              </motion.div>

              <div className="mt-5 pt-5 border-t border-gray-200/80">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  {copy.accountOverview}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-600">
                    <ShieldCheck size={13} className="text-[#1172BA]" />
                    {isAdmin
                      ? t("profile", "admin_user", "Admin User", "Admin User")
                      : t("profile", "user_role", "Pengguna", "User")}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      isVerified
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-amber-50 border-amber-100 text-amber-700"
                    }`}
                  >
                    {isVerified ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Clock size={13} />
                    )}
                    {isVerified
                      ? t("profile", "verified", "Terverifikasi", "Verified")
                      : t("profile", "unverified", "Belum Verifikasi", "Not Verified")}
                  </span>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </motion.div>

      {/* Edit modal */}
      <AdminModal
        open={isEditModalOpen}
        onClose={() => {
          if (!saving) {
            setIsEditModalOpen(false);
            setAvatarPreview(null);
          }
        }}
        panelClassName="max-w-lg"
      >
        <form
          onSubmit={handleUpdate}
          className="bg-white rounded-2xl w-full shadow-2xl overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900">
              {t("profile", "modal_edit", "Edit Profil", "Edit Profile")}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{copy.subtitle}</p>
          </motion.div>

          <div className="px-6 sm:px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative group"
              >
                <div className="h-24 w-24 rounded-2xl bg-gray-100 border-4 border-white shadow-lg overflow-hidden ring-2 ring-gray-100">
                  {avatarPreview || getAvatarUrl(baseUrl, profile.avatar_profile) ? (
                    <img
                      src={
                        avatarPreview ||
                        getAvatarUrl(baseUrl, profile.avatar_profile) ||
                        undefined
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <motion.div
                      initial={{ scale: 0.92 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1172BA] to-slate-800 text-white text-2xl font-bold"
                    >
                      {profile.name.charAt(0).toUpperCase()}
                    </motion.div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white p-2 rounded-xl shadow-lg group-hover:bg-black transition-colors">
                  <Camera size={14} />
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                name="avatar_profile"
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    showNotification(
                      t(
                        "profile",
                        "avatar_too_large",
                        "Ukuran foto maks. 2MB.",
                        "Photo must be 2MB or smaller.",
                      ),
                      "error",
                    );
                    e.target.value = "";
                    return;
                  }
                  setAvatarPreview(URL.createObjectURL(file));
                }}
              />
              <span className="text-xs text-gray-400 font-medium text-center">
                {t(
                  "profile",
                  "avatar_hint",
                  "Klik foto untuk ganti — JPG/PNG, maks. 2MB",
                  "Click photo to change — JPG/PNG, max 2MB",
                )}
              </span>
            </div>

            <motion.div className="space-y-4">
              <InputField
                label={t("profile", "username_label", "Username", "Username")}
                name="name"
                defaultValue={profile.name}
                required
              />
              <InputField
                label={t("profile", "fullname_label", "Nama Lengkap", "Full Name")}
                name="nama_lengkap"
                defaultValue={profile.nama_lengkap || ""}
              />
              <InputField
                label={common.email}
                name="email"
                type="email"
                defaultValue={profile.email}
                required
              />
              <InputField
                label={t("profile", "phone_label", "Nomor Telepon", "Phone Number")}
                name="phone"
                type="tel"
                defaultValue={profile.phone || ""}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin size={12} />
                  {copy.shippingAddress}
                </label>
                <textarea
                  name="alamat_lengkap"
                  rows={3}
                  defaultValue={profile.alamat_lengkap || ""}
                  placeholder={copy.noAddress}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-[#1172BA]/20 focus:border-[#1172BA]/40 outline-none transition-all resize-none"
                />
              </div>
              <InputField
                label={copy.passwordOptional}
                name="password"
                type="password"
                placeholder={copy.passwordHint}
                autoComplete="new-password"
              />
            </motion.div>
          </div>

          <div className="px-6 sm:px-8 py-4 border-t border-gray-100 bg-gray-50/80 flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setIsEditModalOpen(false);
                setAvatarPreview(null);
              }}
              className="flex-1 py-3 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:bg-white transition-all disabled:opacity-50"
            >
              {common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {common.saving ?? "..."}
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  {common.save_changes}
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
  truncate: shouldTruncate,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm"
    >
      <span className="w-10 h-10 rounded-xl bg-[#1172BA]/8 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-[#1172BA]" />
      </span>
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="min-w-0"
      >
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p
          className={`text-sm font-semibold text-gray-900 mt-0.5 ${
            shouldTruncate ? "truncate" : ""
          }`}
          title={value}
        >
          {value}
        </p>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -8 },
        show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
      }}
      className="flex items-start gap-3"
    >
      <span className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
        <Icon size={16} className="text-gray-400" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5 break-words">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

function InputField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-[#1172BA]/20 focus:border-[#1172BA]/40 outline-none transition-all"
      />
    </div>
  );
}
