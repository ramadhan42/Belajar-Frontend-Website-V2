"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  ShieldCheck,
  Clock,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  nama_lengkap: string | null;
  alamat_lengkap: string | null;
  phone?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:8000";

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
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${baseUrl}/api/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        fetchProfile(); // Refresh data
      }
    } catch (error) {
      alert("Gagal memperbarui profil");
    }
  };

  if (isLoading) return <div className="text-gray-500">Memuat profil...</div>;
  if (!profile)
    return <div className="text-red-500">Data tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
        Profil Saya
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
            <div className="h-24 w-24 rounded-2xl bg-white p-1.5 shadow-lg">
              <div className="h-full w-full rounded-xl bg-gray-900 flex items-center justify-center text-white text-3xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
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
              <Edit2 size={16} /> Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t">
            <InfoItem icon={Mail} label="Email Address" value={profile.email} />
            <InfoItem
              icon={User}
              label="Nama Lengkap"
              value={profile.nama_lengkap || "Belum diatur"}
            />
            <InfoItem
              icon={Phone}
              label="Nomor Telepon"
              value={profile.phone || "Belum diatur"}
            />
            <InfoItem
              icon={ShieldCheck}
              label="Status Verifikasi"
              value={
                profile.email_verified_at ? "Terverifikasi" : "Belum Verifikasi"
              }
              status={!!profile.email_verified_at}
            />
          </div>
        </div>
      </motion.div>

      {/* Modal Edit */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.form
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onSubmit={handleUpdate}
              className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative z-10 space-y-5"
            >
              <h2 className="text-xl font-bold text-gray-900">
                Edit Informasi Profil
              </h2>

              <div className="space-y-4">
                <InputField
                  label="Nama Lengkap"
                  name="name"
                  defaultValue={profile.nama_lengkap}
                />
                <InputField
                  label="Nama"
                  name="name"
                  defaultValue={profile.name}
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={profile.email}
                />
                <InputField
                  label="Nomor Telepon"
                  name="phone"
                  defaultValue={profile.phone || ""}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-semibold border hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
                >
                  Simpan
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
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
                ? "text-green-600"
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
