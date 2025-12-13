'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
    LayoutDashboard,
    UtensilsCrossed,
    Calculator,
    Trophy,
    Medal,
    FileText,
    Settings,
    Menu,
    X,
    Zap,
    Leaf,
    CalendarDays,
    Search,
    Users,
    Sparkles,
    Package
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

import { useLanguage } from '@/lib/language-context';

export function Sidebar() {
    const { t } = useLanguage();
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const mainNav = [
        { name: t('sidebar.dashboard'), href: '/', icon: LayoutDashboard },
        { name: t('sidebar.calculator'), href: '/calculator', icon: Calculator },
        { name: t('sidebar.calendar'), href: '/calendar', icon: CalendarDays },
        { name: t('sidebar.shopping'), href: '/shopping-list', icon: UtensilsCrossed }, // Note: shopping key in dict
        { name: t('sidebar.foods'), href: '/foods', icon: Search },
        { name: t('sidebar.meals'), href: '/meals', icon: UtensilsCrossed },
        { name: t('sidebar.chef'), href: '/chef', icon: Sparkles },
        { name: t('sidebar.coach'), href: '/coach', icon: Sparkles },
    ];

    const gameNav = [
        { name: 'Achievements', href: '/achievements', icon: Trophy }, // TODO: Add keys
        { name: 'Leaderboard', href: '/leaderboard', icon: Medal },
    ];

    const adminNav = [
        { name: t('sidebar.admin_users'), href: '/admin/users', icon: Users },
        { name: 'Packages', href: '/admin/packages', icon: Package },
        { name: t('sidebar.admin_settings'), href: '/admin/settings', icon: Settings },
    ];

    const systemNav = [
        { name: 'Reports', href: '/reports', icon: FileText },
        { name: t('sidebar.settings'), href: '/settings', icon: Settings },
    ];

    const NavItem = ({ item }: { item: any }) => {
        // ... (NavItem implementation remains)
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                    isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
            >
                <item.icon className={cn("w-5 h-5", isActive ? "animate-pulse-subtle" : "group-hover:scale-110 transition-transform")} />
                <span>{item.name}</span>
                {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                )}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Trigger */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button variant="outline" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)} className="glass-panel">
                    {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Mobile Sidebar & Backdrop */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setIsMobileOpen(false)}
                        />

                        {/* Sidebar Container */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 h-full p-4 flex flex-col lg:hidden"
                        >
                            <div className="h-full glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                                {/* Header */}
                                <div className="p-6 border-b border-border/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                            <Zap className="text-white w-6 h-6 fill-current" />
                                        </div>
                                        <div>
                                            <h1 className="font-bold text-xl tracking-tight leading-none">ZoneOS</h1>
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Pro Platform</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation */}
                                <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
                                    {/* Main App */}
                                    <div className="space-y-1">
                                        {mainNav.map((item) => <NavItem key={item.href} item={item} />)}
                                    </div>

                                    <div className="mt-auto space-y-6 pt-6">
                                        {/* Gamification Section */}
                                        <div className="space-y-1">
                                            <div className="px-4 text-xs font-bold text-muted-foreground/40 uppercase tracking-widest mb-2">
                                                Gamification
                                            </div>
                                            {gameNav.map((item) => <NavItem key={item.href} item={item} />)}
                                        </div>

                                        {/* User Section */}
                                        <div className="space-y-1">
                                            <div className="px-4 text-xs font-bold text-muted-foreground/40 uppercase tracking-widest mb-2">
                                                User
                                            </div>
                                            {systemNav.map((item) => <NavItem key={item.href} item={item} />)}
                                        </div>

                                        {/* Admin Section */}
                                        <div className="space-y-1">
                                            <div className="px-4 text-xs font-bold text-muted-foreground/40 uppercase tracking-widest mb-2">
                                                Admin
                                            </div>
                                            {adminNav.map((item) => <NavItem key={item.href} item={item} />)}
                                        </div>
                                    </div>
                                </nav>

                                {/* Footer / Theme Toggle */}
                                <div className="p-4 border-t border-border/10">
                                    <div className="glass-card p-4 rounded-xl flex items-center justify-between">
                                        <span className="text-xs font-medium text-muted-foreground">Theme</span>
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar (Static) */}
            <aside className="hidden lg:flex relative inset-y-0 left-0 z-50 w-72 flex-col h-full p-4 gap-4">
                <div className="h-full glass-panel rounded-2xl flex flex-col overflow-hidden">


                    {/* Header */}
                    <div className="p-6 border-b border-border/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Zap className="text-white w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <h1 className="font-bold text-xl tracking-tight leading-none">ZoneOS</h1>
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Pro Platform</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                        {mainNav.map((item) => <NavItem key={item.href} item={item} />)}
                    </nav>

                    {/* Bottom Sections (Gamification, User, Admin) */}
                    <div className="px-4 pb-2 mt-auto space-y-6">
                        {/* Gamification Section */}
                        <div>
                            <div className="mb-2 px-4 text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
                                Gamification
                            </div>
                            {gameNav.map((item) => <NavItem key={item.href} item={item} />)}
                        </div>

                        {/* User Section */}
                        <div>
                            <div className="mb-2 px-4 text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
                                User
                            </div>
                            {systemNav.map((item) => <NavItem key={item.href} item={item} />)}
                        </div>

                        {/* Admin Section */}
                        <div>
                            <div className="mb-2 px-4 text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
                                Admin
                            </div>
                            {adminNav.map((item) => <NavItem key={item.href} item={item} />)}
                        </div>
                    </div>

                    {/* Footer / Theme Toggle */}
                    <div className="p-4 border-t border-border/10">
                        <div className="glass-card p-4 rounded-xl flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Theme</span>
                            <ThemeToggle />
                        </div>
                    </div>

                </div>
            </aside>
        </>
    );
}
