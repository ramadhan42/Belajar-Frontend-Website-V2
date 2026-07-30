"use client";

import { useEffect, useState } from "react";
import { Mail, RefreshCw, AlertCircle } from "lucide-react";
import { SITE_STRINGS } from "@/components/constans/strings";
import { useAdminI18n } from "@/hooks/useAdminI18n";

interface Subscriber {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

export default function SubscribersPage() {
  const { t, common } = useAdminI18n();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const baseUrl = SITE_STRINGS.base_url.url_backend;
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${baseUrl}/api/admin/subscribers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data subscriber dari server");
      }

      const result = await response.json();
      setSubscribers(result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Fungsi untuk memformat tanggal ke format Indonesia yang mudah dibaca
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="text-gray-900" size={28} />
            {t("subscribers", "title", "Newsletter Subscribers", "Newsletter Subscribers")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t(
              "subscribers",
              "subtitle",
              "Kelola daftar email pelanggan yang berlangganan buletin Evomi.",
              "Manage customer emails subscribed to the Evomi newsletter.",
            )}
          </p>
        </div>

        <button
          onClick={fetchSubscribers}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          {isLoading ? common.loading : common.refresh}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                  {common.id}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {common.email}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t(
                    "subscribers",
                    "col_subscribed_at",
                    "Tanggal Berlangganan",
                    "Subscribed At",
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                // Loading Skeleton
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                  </tr>
                ))
              ) : subscribers.length > 0 ? (
                // Data Subscribers
                subscribers.map((sub, index) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      #{sub.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {sub.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(sub.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                // Empty State
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Mail size={48} className="mb-3 opacity-20" />
                      <p className="text-base font-medium text-gray-600">
                        {t(
                          "subscribers",
                          "empty_title",
                          "Belum ada subscriber",
                          "No subscribers yet",
                        )}
                      </p>
                      <p className="text-sm mt-1">
                        {t(
                          "subscribers",
                          "empty_desc",
                          "Daftar email yang berlangganan akan muncul di sini.",
                          "Subscribed emails will appear here.",
                        )}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info (Optional) */}
        {!isLoading && subscribers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              {t(
                "subscribers",
                "total_found",
                `Total ${subscribers.length} subscriber ditemukan.`,
                `Total ${subscribers.length} subscribers found.`,
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
