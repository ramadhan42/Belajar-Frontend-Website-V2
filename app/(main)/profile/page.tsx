"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SITE_STRINGS } from "@/components/constans/strings";


const BASE_URL =
  process.env.NEXT_PUBLIC_URL || SITE_STRINGS.base_url.url_backend_deploy;

export default function ProfilePage() {
  const router = useRouter();
  
  // State form mengikuti struktur desain awal
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "" 
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || BASE_URL + "/api"}/user/profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        const data = await res.json();
        if (res.ok && data.success) {
          setFormData({
            name: data.data.name || data.data.nama_lengkap || "",
            email: data.data.email || "",
            password: "", // Jangan tampilkan password lama
            address: data.data.alamat_lengkap || "" // Menyesuaikan dengan kolom DB
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. UPDATE: Menyimpan data ketika tombol form disubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "Menyimpan perubahan..." });

    const token = localStorage.getItem("auth_token");
    
    // Siapkan payload, map 'address' dari form ke 'alamat_lengkap' di backend
    const payload: any = {
      name: formData.name,
      email: formData.email,
      alamat_lengkap: formData.address
    };

    // Hanya kirim password jika pengguna mengisi kolom password baru
    if (formData.password.trim() !== "") {
      payload.password = formData.password;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://belajar-be-website-evomi-v2-main-gbcsym.free.laravel.cloud/api"}/user/profile`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({ type: "success", message: "Informasi pribadi berhasil diperbarui!" });
        setFormData(prev => ({ ...prev, password: "" })); // Kosongkan input password setelah sukses
        
        // (Opsional) Sinkronisasi ke localStorage agar Navbar langsung terupdate
        const userRaw = localStorage.getItem("auth_user");
        if (userRaw) {
          const user = JSON.parse(userRaw);
          localStorage.setItem("auth_user", JSON.stringify({ ...user, ...data.data }));
          window.dispatchEvent(new Event("auth-change"));
        }
      } else {
        setStatus({ type: "error", message: data.message || "Gagal memperbarui informasi." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Terjadi kesalahan jaringan." });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 animate-pulse">
        Memuat informasi Anda...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Informasi Pribadi</h1>
      
      {/* Notifikasi Status Penyimpanan */}
      {status.message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium transition-all ${status.type === 'success' ? 'bg-green-50 text-green-700' : status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>
          {status.message}
        </div>
      )}
      
      {/* Menambahkan onSubmit pada form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Email</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Password Baru */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kata Sandi Baru (Kosongkan jika tidak diubah)</label>
          <input 
            type="password" name="password" value={formData.password} placeholder="••••••••" onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Pengiriman Default</label>
          <textarea 
            name="address" rows={3} value={formData.address} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        {/* Mengubah type menjadi submit agar memicu onSubmit di form */}
        <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}