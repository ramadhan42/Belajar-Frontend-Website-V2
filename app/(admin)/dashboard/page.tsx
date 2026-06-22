import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp 
} from 'lucide-react';

export default function DashboardPage() {
  // Contoh data statis untuk UI
  const stats = [
    { title: 'Total Products', value: '124', icon: Package, trend: '+12%' },
    { title: 'Total Orders', value: '856', icon: ShoppingBag, trend: '+5.4%' },
    { title: 'Active Users', value: '2,045', icon: Users, trend: '+14%' },
    { title: 'Total Revenue', value: 'Rp 45.5M', icon: TrendingUp, trend: '+24%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1">Selamat datang kembali, lihat performa Evomi hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <Icon size={20} className="text-gray-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                  {stat.trend}
                </span>
                <span className="text-xs text-gray-400">dari bulan lalu</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tempat untuk Chart / Tabel Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 min-h-[400px]">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grafik Penjualan</h2>
          {/* Anda bisa memasukkan Recharts atau Chart.js di sini */}
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            [ Area Chart Penjualan ]
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-50/50 min-h-[400px]">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pesanan Terbaru</h2>
          {/* Mapping data pesanan dari API Laravel di sini */}
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            [ List Order Tracking Singkat ]
          </div>
        </div>
      </div>
    </div>
  );
}