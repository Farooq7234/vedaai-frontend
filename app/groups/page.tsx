import DashboardLayout from "@/components/DashboardLayout";

export default function ComingSoonPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <p className="text-4xl mb-4">🚧</p>
          <h2 className="text-xl font-bold text-gray-800">Coming Soon</h2>
          <p className="text-gray-500 text-sm mt-2">This section is under construction.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
