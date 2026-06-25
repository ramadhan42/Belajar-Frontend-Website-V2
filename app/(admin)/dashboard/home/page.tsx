"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  ImageIcon,
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

// Pembaruan Tipe Data sesuai JSON Response Anda
interface Order {
  id: string;
  user_id: number;
  product_id: number;
  quantity: number;
  total_price: string | number;
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

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:8000";

  // Konfigurasi Map Status (Label & Warna Tailwind)
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "menunggu_konfirmasi":
        return {
          label: "Menunggu Konfirmasi",
          class: "bg-orange-50 text-orange-600 border border-orange-100",
        };
      case "pengemasan":
        return {
          label: "Pengemasan",
          class: "bg-purple-50 text-purple-600 border border-purple-100",
        };
      case "dalam_perjalanan":
        return {
          label: "Dalam Perjalanan",
          class: "bg-blue-50 text-blue-600 border border-blue-100",
        };
      case "diterima":
        return {
          label: "Diterima",
          class: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        };
      case "selesai":
        return {
          label: "Selesai",
          class: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        };
      default:
        return {
          label: status || "Diproses",
          class: "bg-gray-50 text-gray-600 border border-gray-100",
        };
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, ordersRes, usersRes, revenueRes] =
          await Promise.all([
            fetch(`${baseUrl}/api/products`),
            fetch(`${baseUrl}/api/admin/orders`),
            fetch(`${baseUrl}/api/admin/users`),
            fetch(`${baseUrl}/api/admin/revenue`),
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
          totalRevenue: revenue?.data?.total_revenue || 0,
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

          const amount = Number(order.total_price || 0);
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
      title: "Total Products",
      value: dashboardData.totalProducts.toString(),
      icon: Package,
      trend: "Aktif",
      route: "/dashboard/products",
    },
    {
      title: "Total Orders",
      value: dashboardData.totalOrders.toString(),
      icon: ShoppingBag,
      trend: "Bulan ini",
      route: "/dashboard/orders",
    },
    {
      title: "Active Users",
      value: dashboardData.activeUsers.toString(),
      icon: Users,
      trend: "Terdaftar",
      route: "/dashboard/users",
    },
    {
      title: "Total Revenue",
      value: formatRupiah(dashboardData.totalRevenue),
      icon: TrendingUp,
      trend: "Pendapatan",
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
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang kembali, lihat performa Evomi hari ini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={() => stat.route && router.push(stat.route)} // 4. Tambahkan onClick function
              className={`bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all ${
                stat.route ? "cursor-pointer hover:border-gray-200" : "" // 5. Tambahkan cursor-pointer jika route tersedia
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </h3>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <Icon size={20} className="text-gray-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                  {stat.trend}
                </span>
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
            Grafik Penjualan
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
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={(value) => `Rp${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any) => [
                      formatRupiah(value),
                      "Pendapatan",
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
                Belum ada data penjualan.
              </div>
            )}
          </div>
        </div>

        {/* Versi Lengkap Recent Orders Section dengan Gambar & Status */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 min-h-[400px]">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Pesanan Terbaru
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
                          {order.product?.title || "Produk Hilang"}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5 capitalize">
                          Oleh: {order.user?.name || "Anonim"}
                        </p>
                      </div>
                    </div>

                    {/* Harga & Badge Status */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        {formatRupiah(order.total_price)}
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
              Belum ada pesanan masuk.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
