"use client";

import { useState, useEffect } from "react";
import { User, Mail, MapPin, Calendar, Edit2, ShieldCheck, Clock, Phone } from "lucide-react";

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

  useEffect(() => { fetchProfile(); }, []);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${baseUrl}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
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
  if (!profile) return <div className="text-red-500">Data tidak ditemukan.</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>

      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <span className="text-sm text-gray-500">ID User: #{profile.id}</span>
            </div>
          </div>
          {/* TOMBOL EDIT DITAMPILKAN DI SINI */}
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 text-sm bg-gray-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            <Edit2 size={14} /> Edit Profil
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <InfoItem icon={Mail} label="Email Address" value={profile.email} />
            <InfoItem icon={User} label="Nama Lengkap" value={profile.nama_lengkap || "Belum diatur"} />
            <InfoItem icon={ShieldCheck} label="Status Verifikasi" value={profile.email_verified_at ? "Terverifikasi" : "Belum Verifikasi"} status={!!profile.email_verified_at} />
          </div>
          <div className="space-y-6">
            <InfoItem icon={MapPin} label="Alamat Pengiriman" value={profile.alamat_lengkap || "Belum diatur"} />
            <InfoItem icon={Calendar} label="Dibuat Pada" value={new Date(profile.created_at).toLocaleDateString("id-ID", {dateStyle: 'long'})} />
            <InfoItem icon={Clock} label="Terakhir Diupdate" value={new Date(profile.updated_at).toLocaleDateString("id-ID", {dateStyle: 'long'})} />
          </div>
        </div>
      </div>

      {/* MODAL EDIT */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
          <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Edit Profil</h2>
            <input name="name" defaultValue={profile.name} className="w-full border p-2.5 rounded-xl" placeholder="Nama" required />
            <input name="email" type="email" defaultValue={profile.email} className="w-full border p-2.5 rounded-xl" placeholder="Email" required />
            <input name="phone" className="w-full border p-2.5 rounded-xl" placeholder="Nomor Telepon" />
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 rounded-xl border hover:bg-gray-50">Batal</button>
              <button type="submit" className="flex-1 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, status }: { icon: any, label: string, value: string, status?: boolean }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3 mt-2 text-gray-900 font-medium">
        <Icon size={18} className="text-gray-400 shrink-0" />
        <span className={status !== undefined ? (status ? "text-green-600" : "text-amber-600") : ""}>{value}</span>
      </div>
    </div>
  );
}