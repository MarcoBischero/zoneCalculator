import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative h-full">
        <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        {children}
      </main>
    </div>
  )
}