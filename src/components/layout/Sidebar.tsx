'use client';
import { useState, useEffect } from 'react';
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Utensils, Calculator, Calendar, Settings, LogOut, ChevronRight, User, PieChart, Ruler, FileText, Sparkles, Shield, Trophy } from 'lucide-react';
import { cn } from "@/lib/utils";

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Meal Builder', href: '/calculator', icon: Calculator },
    { name: 'My Meals', href: '/meals', icon: Utensils },
    { name: 'Protein Calc', href: '/protein', icon: Ruler },
    { name: 'Weekly Planner', href: '/calendar', icon: Calendar },
    { name: 'Food Database', href: '/foods', icon: Utensils },
    { name: 'AI Chef', href: '/chef', icon: Sparkles },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy }, // Gamification
    { name: 'My Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
];

import { ThemeToggle } from "@/components/theme-toggle";

import { useSession } from "next-auth/react";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Completely hide sidebar if not authenticated
    if (status !== 'authenticated') return null;

    const userRole = (session?.user as any)?.role;
    const username = (session?.user as any)?.username || 'User';

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Overlay on mobile when open */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                backgroundColor: `hsl(var(--sidebar-bg))`,
                color: `hsl(var(--sidebar-fg))`
            }} className={`
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                fixed md:sticky top-0 left-0 h-screen
                w-64 border-r shadow-2xl
                flex flex-col transition-all duration-300 ease-in-out z-40
            `}>
                {/* Header */}
                <div className="flex h-20 items-center px-6 border-b border-white/10">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: `hsl(var(--sidebar-fg))` }}>
                            Zone<span className="opacity-70">Calc</span>
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-[10px] font-semibold uppercase tracking-widest opacity-70">System Online</span>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                    "group flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ease-in-out border border-transparent",
                                    isActive
                                        ? "bg-white/20 border-white/30 shadow-sm"
                                        : "hover:bg-white/10"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                                    )}
                                    aria-hidden="true"
                                />
                                <span className={cn(isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100")}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}

                    {(userRole === 1 || userRole === 2) && (
                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Admin</p>
                            <Link
                                href="/admin/users"
                                className={cn(
                                    "group flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ease-in-out border border-transparent",
                                    pathname === '/admin/users'
                                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-red-500"
                                )}
                            >
                                <Shield className="mr-3 h-5 w-5 flex-shrink-0" />
                                User Management
                            </Link>
                        </div>
                    )}
                </nav>

                {/* User Section */}
                <div className="p-4 bg-muted/30 border-t border-border">
                    <div className="mb-4">
                        <ThemeToggle />
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm border border-border group hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold shadow-md ring-2 ring-background">
                            {username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">{username}</p>
                            <p className="text-xs text-muted-foreground truncate">{userRole === 1 ? 'Administrator' : 'Pro Membership'}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            title="Sign Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
