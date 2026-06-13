import { Package, ChevronRight } from "lucide-react";

export default function HistoryPage() {
  const orders = [
    { id: "INV-20260613-001", date: "13 Jun 2026", total: 270000, status: "Menunggu Pembayaran", statusColor: "bg-yellow-100 text-yellow-800" },
    { id: "INV-20260520-089", date: "20 Mei 2026", total: 150000, status: "Selesai", statusColor: "bg-green-100 text-green-800" },
    { id: "INV-20260415-042", date: "15 Apr 2026", total: 320000, status: "Dibatalkan", statusColor: "bg-red-100 text-red-800" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Belanja</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-xl hover:shadow-sm transition-all gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{order.id}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{order.date}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="font-medium text-gray-900">Rp {order.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                {order.status}
              </span>
              <button className="p-2 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-50">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}