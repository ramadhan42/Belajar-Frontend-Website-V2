"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  ImageIcon,
  Info,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SITE_STRINGS } from "@/components/constans/strings";
import { getAdminHeaders, orderGrandTotal } from "@/lib/api";
import { useAdminI18n } from "@/hooks/useAdminI18n";
import { useAdminTheme } from "@/context/AdminThemeContext";

// Pembaruan Tipe Data sesuai JSON Response Anda
interface Order {
  id: string;
  user_id: number;
  product_id: number;
  quantity: number;
  total_price: string | number;
  shipping_cost?: string | number;
  promo_discount?: string | number;
  grand_total?: string | number;
  status: string;
  created_at: string;
  updated_at: string;
  metode_pembayaran: string;
  product?: {
    id: number;
    title: string;
    price: string;
    image_1: string;
    personality_type: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function HomeDashboard() {
  const { t, locale } = useAdminI18n();
  const { isDark } = useAdminTheme();
  const router = useRouter(); // 2. Inisialisasi router
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalOrders: 0,
    activeUsers: 0,
    totalRevenue: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const baseUrl = SITE_STRINGS.base_url.url_backend;

  // Konfigurasi Map Status (Label & Warna Tailwind)
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "menunggu_konfirmasi":
        return {
          label: t(
            "home",
            "status_menunggu_konfirmasi",
            "Menunggu Konfirmasi",
            "Awaiting Confirmation",
          ),
          class: "bg-orange-50 text-orange-600 border border-orange-100",
        };
      case "pengemasan":
        return {
          label: t("home", "status_pengemasan", "Pengemasan", "Packing"),
          class: "bg-purple-50 text-purple-600 border border-purple-100",
        };
      case "dalam_perjalanan":
        return {
          label: t(
            "home",
            "status_dalam_perjalanan",
            "Dalam Perjalanan",
            "In Transit",
          ),
          class: "bg-blue-50 text-blue-600 border border-blue-100",
        };
      case "diterima":
        return {
          label: t("home", "status_diterima", "Diterima", "Received"),
          class: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        };
      case "selesai":
        return {
          label: t("home", "status_selesai", "Selesai", "Completed"),
          class: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        };
      default:
        return {
          label: status || t("home", "status_diproses", "Diproses", "Processing"),
          class: "bg-gray-50 text-gray-600 border border-gray-100",
        };
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = getAdminHeaders();
        const [productsRes, ordersRes, usersRes, revenueRes] =
          await Promise.all([
            fetch(`${baseUrl}/api/products`),
            fetch(`${baseUrl}/api/admin/orders`, { headers }),
            fetch(`${baseUrl}/api/admin/users`, { headers }),
            fetch(`${baseUrl}/api/admin/revenue`, { headers }),
          ]);

        const products = await productsRes.json();
        const orders = await ordersRes.json();
        const users = await usersRes.json();
        const revenue = await revenueRes.json();

        const ordersList = orders?.data || orders || [];

        setDashboardData({
          totalProducts: products?.data?.length || products?.length || 0,
          totalOrders: ordersList.length || 0,
          activeUsers: users?.data?.length || users?.length || 0,
          totalRevenue: revenue?.data?.total_revenue_clean || 0,
        });

        // Olah Data Grafik Penjualan
        const salesByDate = ordersList.reduce((acc: any, order: Order) => {
          const date = new Date(order.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          });

          if (!acc[date]) {
            acc[date] = 0;
          }

          const amount = orderGrandTotal(order);
          acc[date] += amount;

          return acc;
        }, {});

        const formattedChartData = Object.keys(salesByDate).map((date) => ({
          name: date,
          total: salesByDate[date],
        }));

        setChartData(formattedChartData);

        // Olah Pesanan Terbaru
        const sortedOrders = [...ordersList].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setRecentOrders(sortedOrders.slice(0, 5));
      } catch (error) {
        console.error("Gagal mengambil data dari API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [baseUrl]);

  // Utility format Rupiah
  const formatRupiah = (value: number | string) => {
    const numberValue = Number(value) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numberValue);
  };

  // 3. Tambahkan properti route untuk card yang bisa diklik
  const stats = [
    {
      key: "products",
      title: t("home", "stat_products", "Total Produk", "Total Products"),
      value: dashboardData.totalProducts.toString(),
      icon: Package,
      trend: t("home", "trend_active", "Aktif", "Active"),
      route: "/dashboard/products",
      tipTitle: t(
        "home",
        "tip_products_title",
        "Katalog produk",
        "Product catalog",
      ),
      tipBody: t(
        "home",
        "tip_products_body",
        "Jumlah seluruh produk parfum yang tersimpan di inventaris Evomi.",
        "Total perfume products currently stored in Evomi inventory.",
      ),
    },
    {
      key: "orders",
      title: t("home", "stat_orders", "Total Pesanan", "Total Orders"),
      value: dashboardData.totalOrders.toString(),
      icon: ShoppingBag,
      trend: t("home", "trend_month", "Bulan ini", "This month"),
      route: "/dashboard/orders",
      tipTitle: t(
        "home",
        "tip_orders_title",
        "Semua pesanan",
        "All orders",
      ),
      tipBody: t(
        "home",
        "tip_orders_body",
        "Total pesanan masuk dari pelanggan, termasuk status menunggu hingga selesai.",
        "Total customer orders across all statuses, from pending to completed.",
      ),
    },
    {
      key: "users",
      title: t("home", "stat_users", "Pengguna Aktif", "Active Users"),
      value: dashboardData.activeUsers.toString(),
      icon: Users,
      trend: t("home", "trend_registered", "Terdaftar", "Registered"),
      route: "/dashboard/users",
      tipTitle: t(
        "home",
        "tip_users_title",
        "Akun terdaftar",
        "Registered accounts",
      ),
      tipBody: t(
        "home",
        "tip_users_body",
        "Jumlah seluruh pengguna yang sudah membuat akun di Evomi (termasuk admin).",
        "Total users who have registered an Evomi account (including admins).",
      ),
    },
    {
      key: "revenue",
      title: t("home", "stat_revenue", "Total Pendapatan", "Total Revenue"),
      value: formatRupiah(dashboardData.totalRevenue),
      icon: TrendingUp,
      trend: t("home", "trend_revenue", "Pendapatan", "Revenue"),
      route: "/dashboard/orders",
      tipTitle: t(
        "home",
        "tip_revenue_title",
        "Pendapatan bersih",
        "Net revenue",
      ),
      tipBody: t(
        "home",
        "tip_revenue_body",
        "Akumulasi pendapatan dari pesanan yang dihitung sebagai revenue bersih di sistem.",
        "Accumulated revenue from orders counted as net revenue in the system.",
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("home", "title", "Overview", "Overview")}
        </h1>
        <p className="text-gray-500 mt-1">
          {t(
            "home",
            "subtitle",
            "Selamat datang kembali, lihat performa Evomi hari ini.",
            "Welcome back — here's Evomi's performance today.",
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              onClick={() => stat.route && router.push(stat.route)}
              className={`group/stat relative bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all ${
                stat.route ? "cursor-pointer hover:border-gray-200" : ""
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                      aria-label={
                        locale === "en"
                          ? `About ${stat.title}`
                          : `Tentang ${stat.title}`
                      }
                    >
                      <Info size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">
                    {stat.value}
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl shrink-0">
                  <Icon size={20} className="text-gray-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                  {stat.trend}
                </span>
              </div>

              <div
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-[calc(100%+12px)] z-40 w-[min(100%,18rem)] -translate-x-1/2 opacity-0 scale-95 translate-y-1 transition-all duration-200 ease-out group-hover/stat:opacity-100 group-hover/stat:scale-100 group-hover/stat:translate-y-0 group-focus-within/stat:opacity-100 group-focus-within/stat:scale-100 group-focus-within/stat:translate-y-0"
              >
                <div className="relative rounded-2xl border border-slate-200/90 bg-slate-900 px-3.5 py-3 text-left shadow-[0_18px_40px_-16px_rgba(15,23,42,0.55)]">
                  <span
                    className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[3px] border-l border-t border-slate-200/90 bg-slate-900"
                    aria-hidden
                  />
                  <div className="relative flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
                      <Icon size={14} />
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {stat.tipTitle}
                    </p>
                  </div>
                  <p className="relative mt-2 text-sm font-semibold text-white leading-snug">
                    {stat.value}
                  </p>
                  <p className="relative mt-1.5 text-[11px] leading-relaxed text-slate-400">
                    {stat.tipBody}
                  </p>
                  {stat.route ? (
                    <p className="relative mt-2 text-[10px] font-medium text-emerald-400/90">
                      {locale === "en"
                        ? "Click card to open details →"
                        : "Klik kartu untuk buka detail →"}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart & Tabel Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 min-h-[400px] flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {t("home", "sales_chart", "Grafik Penjualan", "Sales Chart")}
          </h2>
          <div className="flex-1 w-full h-full min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#10B981"
                        stopOpacity={isDark ? 0.28 : 0.1}
                      />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? "#2a3344" : "#f3f4f6"}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? "#9aa3b2" : "#9ca3af", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? "#9aa3b2" : "#9ca3af", fontSize: 12 }}
                    tickFormatter={(value) => `Rp${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{
                      stroke: isDark ? "#3b465c" : "#e5e7eb",
                      strokeWidth: 1,
                    }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: isDark
                        ? "1px solid #2a3344"
                        : "1px solid #e5e7eb",
                      backgroundColor: isDark ? "#1a2030" : "#ffffff",
                      color: isDark ? "#e8eaed" : "#111827",
                      boxShadow: isDark
                        ? "0 12px 28px rgba(0,0,0,0.45)"
                        : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{
                      color: isDark ? "#e8eaed" : "#111827",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                    itemStyle={{
                      color: isDark ? "#d1d5db" : "#374151",
                    }}
                    wrapperClassName="admin-chart-tooltip"
                    formatter={(value: any) => [
                      formatRupiah(value),
                      t("home", "trend_revenue", "Pendapatan", "Revenue"),
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                {t("home", "empty_sales", "Belum ada data penjualan.", "No sales data yet.")}
              </div>
            )}
          </div>
        </div>

        {/* Versi Lengkap Recent Orders Section dengan Gambar & Status */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 min-h-[400px]">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {t("home", "recent_orders", "Pesanan Terbaru", "Recent Orders")}
          </h2>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order, index) => {
                const statusConfig = getStatusConfig(order.status);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Thumbnail Gambar 1 Produk */}
                      <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        {order.product?.image_1 ? (
                          <img
                            src={`${baseUrl}/storage/${order.product.image_1}`}
                            alt={order.product.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "";
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      {/* Detail Informasi Pesanan */}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {order.id}
                        </p>
                        <p className="text-sm font-bold text-gray-900 truncate mt-0.5">
                          {order.product?.title ||
                            t("home", "product_missing", "Produk Hilang", "Missing Product")}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5 capitalize">
                          {t("home", "by_label", "Oleh", "By")}:{" "}
                          {order.user?.name ||
                            t("home", "anonymous", "Anonim", "Anonymous")}
                        </p>
                      </div>
                    </div>

                    {/* Harga & Badge Status */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        {formatRupiah(orderGrandTotal(order))}
                      </p>
                      <span
                        className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md font-semibold ${statusConfig.class}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm pb-10">
              {t("home", "empty_orders", "Belum ada pesanan masuk.", "No orders yet.")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
