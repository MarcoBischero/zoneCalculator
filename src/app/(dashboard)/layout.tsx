import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

import { TrialGuard } from "@/components/auth/TrialGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block w-72 fixed inset-y-0 z-50 print:hidden">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen pb-20 lg:pb-0">
        <BottomNav />
        <TrialGuard>
          {children}
        </TrialGuard>
      </div>
    </div>
  );
}