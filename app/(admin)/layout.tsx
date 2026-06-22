import SidebarAdmin from '@/components/admin/SidebarAdmin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar Navigation */}
      <SidebarAdmin />

      {/* Main Content Area */}
      {/* Margin left 64 (16rem) sesuai dengan lebar w-64 pada Sidebar */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}