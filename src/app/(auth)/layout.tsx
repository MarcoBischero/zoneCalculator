export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background p-4">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 z-0"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay z-0"></div>

            {/* Floating Orbs for "Premium" feel */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-subtle"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-subtle delay-1000"></div>

            {/* Content Container - Glass Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="glass-card rounded-2xl p-8 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl">
                    {children}
                </div>

                <div className="mt-8 text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} ZoneCalculator Pro. All rights reserved.
                </div>
            </div>
        </div>
    );
}
