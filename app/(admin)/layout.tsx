"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import SidebarAdmin from "@/components/admin/SidebarAdmin";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // State khusus untuk mengatur Custom Modal
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      router.replace("/admin-login");
      return;
    }

    try {
      const user = JSON.parse(userString);
      
      if (user.id !== 1) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        
        // PANGGIL MODAL (JANGAN langsung redirect di sini)
        setModal({
          isOpen: true,
          message: "Akses ditolak! Anda tidak memiliki izin sebagai Administrator.",
        });
        return;
      }

      setIsAuthorized(true);
      
    } catch (error) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      router.replace("/admin-login");
    }
  }, [router]);

  // Fungsi saat tombol di dalam modal diklik
  const handleCloseModal = () => {
    setModal({ isOpen: false, message: "" });
    router.replace("/admin-login"); // Redirect dieksekusi dari sini
  };

  // Tampilan penahan saat sistem mengecek auth atau menampilkan modal error
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative">
        
        {/* Spinner Loading - Disembunyikan jika modal error muncul */}
        {!modal.isOpen && (
          <>
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-500">Memverifikasi akses...</p>
          </>
        )}

        {/* CUSTOM MODAL ERROR/PENOLAKAN */}
        {modal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 relative animate-in zoom-in-95 fade-in duration-200">
              <div className="text-center mt-2">
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="w-14 h-14 text-red-500" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Akses Dilarang
                </h3>
                <p className="text-sm text-gray-600 mb-6">{modal.message}</p>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Kembali ke Login
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Jika Authorized = true, render anak / konten dashboard sesungguhnya
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar Navigation */}
      <SidebarAdmin />

      {/* Main Content Area */}
      {/* Margin left 64 (16rem) sesuai dengan lebar w-64 pada Sidebar */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}