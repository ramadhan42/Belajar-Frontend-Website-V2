"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  ShieldCheck,
  CheckCircle, // Tambahkan import CheckCircle
  Clock,
  Phone,
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
}

export default function ProfilePage() {
  const { t, common } = useAdminI18n();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const baseUrl = SITE_STRINGS.base_url.url_backend;

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    const formData = new FormData(e.currentTarget); // Otomatis menangani file

    try {
      const res = await fetch(`${baseUrl}/api/user/profile`, {
        method: "POST", // Ubah ke POST jika PUT bermasalah dengan FormData
        headers: {
          Authorization: `Bearer ${token}`,
          // Jangan set Content-Type secara manual saat pakai FormData
        },
        body: formData,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        fetchProfile();
      }
    } catch (error) {
      alert(
        t(
          "profile",
          "update_error",
          "Gagal memperbarui profil",
          "Failed to update profile",
        ),
      );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!profile)
    return <div className="text-red-500">{common.empty}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
        {t("profile", "title", "Profil Saya", "My Profile")}
      </h1>
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-700"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-1 gap-4">
            <div className="h-24 w-24 rounded-2xl bg-white p-1.5 shadow-lg overflow-hidden">
              {profile.avatar_profile ? (
                <img
                  src={`${baseUrl}/storage/${profile.avatar_profile}`}
                  className="h-full w-full object-cover rounded-xl"
                  alt="Avatar"
                />
              ) : (
                <div className="h-full w-full rounded-xl bg-gray-900 flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 pb-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.name}
              </h2>
              <p className="text-gray-500 text-sm">ID #{profile.id}</p>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm"
            >
              <Edit2 size={16} /> {t("profile", "edit_button", "Edit Profil", "Edit Profile")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t">
            <InfoItem
              icon={Mail}
              label={t("profile", "email_label", "Alamat Email", "Email Address")}
              value={profile.email}
            />
            <InfoItem
              icon={User}
              label={t("profile", "fullname_label", "Nama Lengkap", "Full Name")}
              value={
                profile.nama_lengkap ||
                t("profile", "not_set", "Belum diatur", "Not set")
              }
            />
            <InfoItem
              icon={Phone}
              label={t("profile", "phone_label", "Nomor Telepon", "Phone Number")}
              value={
                profile.phone || t("profile", "not_set", "Belum diatur", "Not set")
              }
            />
            <InfoItem
              icon={profile.id === 1 ? CheckCircle : ShieldCheck}
              label={t(
                "profile",
                "verify_label",
                "Status Verifikasi",
                "Verification Status",
              )}
              value={
                profile.id === 1
                  ? t("profile", "admin_user", "Admin User", "Admin User")
                  : profile.email_verified_at
                    ? t("profile", "verified", "Terverifikasi", "Verified")
                    : t(
                        "profile",
                        "unverified",
                        "Belum Verifikasi",
                        "Not Verified",
                      )
              }
              status={profile.id === 1 ? true : !!profile.email_verified_at}
            />
          </div>
        </div>
      </motion.div>
      {/* Modal Edit */}
      <AdminModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        panelClassName="max-w-md"
      >
            <form
              onSubmit={handleUpdate}
              className="bg-white p-8 rounded-3xl w-full shadow-2xl relative space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {t("profile", "modal_edit", "Edit Profil", "Edit Profile")}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Input File Avatar dengan Preview */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                    <input
                      type="file"
                      name="avatar_profile"
                      id="avatar_profile"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const img = document.getElementById(
                              "preview-avatar",
                            ) as HTMLImageElement;
                            if (img) img.src = ev.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <img
                      id="preview-avatar"
                      src={
                        profile.avatar_profile
                          ? `${baseUrl}/storage/${profile.avatar_profile}`
                          : undefined
                      }
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <label
                    htmlFor="avatar_profile"
                    className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors shadow-lg"
                  >
                    <Edit2 size={14} />
                  </label>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {t(
                    "profile",
                    "avatar_hint",
                    "Klik icon pensil untuk ganti foto",
                    "Click the pencil icon to change photo",
                  )}
                </span>
              </div>

              <div className="space-y-4">
                <InputField
                  label={t("profile", "username_label", "Username", "Username")}
                  name="name"
                  defaultValue={profile.name}
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
                />
                <InputField
                  label={t("profile", "phone_label", "Nomor Telepon", "Phone Number")}
                  name="phone"
                  defaultValue={profile.phone || ""}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                >
                  {common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all"
                >
                  {common.save_changes}
                </button>
              </div>
            </form>
      </AdminModal>
    </div>
  );
}

// Komponen Pembantu
function InputField({ label, ...props }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-400 uppercase">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-gray-200 outline-none transition-all"
      />
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: any;
  label: string;
  value: string;
  status?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-3 mt-2 text-gray-900 font-medium">
        <Icon size={18} className="text-gray-400 shrink-0" />
        <span
          className={
            status !== undefined
              ? status
                ? "text-green-600 font-bold"
                : "text-amber-600"
              : ""
          }
        >
          {value}
        </span>
      </div>
    </div>
  );
}
