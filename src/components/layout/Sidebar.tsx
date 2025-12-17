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
    Zap,
    CalendarDays,
    Search,
    Users,
    Sparkles,
    Package,
    X,
    Scale,
    HelpCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useLanguage } from '@/lib/language-context';
import { useSession } from 'next-auth/react';

interface SidebarProps {
    isDrawerMode?: boolean;
}

const GamificationStats = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch('/api/user/gamification')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setStats(data);
            })
            .catch(err => console.error(err));
    }, []);

    if (!stats) return null;

    const progress = Math.min((stats.currentXp / stats.nextLevelXp) * 100, 100);

    return (
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 mb-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Lvl {stats.level}
                </span>
                <span className="text-[10px] text-muted-foreground">{stats.currentXp}/{stats.nextLevelXp} XP</span>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden border border-border/50">
                <div
                    className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
            {stats.streak > 0 && (
                <div className="mt-2 text-[10px] flex items-center gap-1 text-orange-500 font-medium">
                    <Zap className="w-3 h-3 fill-current" /> {stats.streak} day streak!
                </div>
            )}
        </div>
    );
};

export function Sidebar({ isDrawerMode = false }: SidebarProps) {
    const { t } = useLanguage();
    const { data: session } = useSession();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const mainNav = [
        { name: t('sidebar.dashboard'), href: '/', icon: LayoutDashboard },
        { name: t('sidebar.calculator'), href: '/calculator', icon: Calculator },
        { name: t('sidebar.calendar'), href: '/calendar', icon: CalendarDays },
        { name: t('sidebar.shopping'), href: '/shopping-list', icon: UtensilsCrossed },
        { name: t('sidebar.foods'), href: '/foods', icon: Search },
        { name: t('sidebar.meals'), href: '/meals', icon: UtensilsCrossed },
        { name: t('sidebar.chef'), href: '/chef', icon: Sparkles },
        { name: t('sidebar.coach'), href: '/coach', icon: Sparkles },
    ];

    const gameNav = [
        { name: 'Achievements', href: '/achievements', icon: Trophy },
        { name: 'Leaderboard', href: '/leaderboard', icon: Medal },
    ];

    const adminNav = [
        { name: t('sidebar.admin_users'), href: '/admin/users', icon: Users },
        { name: 'Packages', href: '/admin/packages', icon: Package },
        { name: t('sidebar.admin_settings'), href: '/admin/settings', icon: Settings },
    ];

    const systemNav = [
        { name: 'Misure', href: '/measurements', icon: Scale },
        { name: 'Reports', href: '/reports', icon: FileText },
        { name: 'FAQ & Supporto', href: '/faq', icon: HelpCircle },
        { name: t('sidebar.settings'), href: '/settings', icon: Settings },
    ];

    // Helper for role display
    const getRoleLabel = () => {
        const role = (session?.user as any)?.role;
        if (role === 1) return t('settings.role_admin');
        if (role === 2) return t('settings.role_dietician');
        return t('settings.role_patient');
    };

    const NavItem = ({ item }: { item: any }) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
            <Link
                key={item.href}
                href={item.href}
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

    const SidebarContent = () => (
        <div className={cn("h-full flex flex-col overflow-hidden print:hidden", isDrawerMode ? "bg-background" : "glass-panel rounded-2xl")}>
            {/* Header */}
            <div className="p-6 border-b border-border/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Zap className="text-primary-foreground w-6 h-6 fill-current" />
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

            {/* Gamification Stats */}
            <div className="px-6 py-2">
                <GamificationStats />
            </div>

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

            {/* Footer / User / Theme Toggle */}
            <div className="p-4 border-t border-border/10 space-y-4">
                {/* User Mini Profile */}
                <div className={cn("p-3 rounded-xl flex items-center gap-3", isDrawerMode ? "bg-secondary/50" : "glass-card")}>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                            {session?.user?.username || session?.user?.email || 'Utente'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            {getRoleLabel()}
                        </p>
                    </div>
                    <Link href="/api/auth/signout" className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                    </Link>
                </div>

                <div className={cn("p-4 rounded-xl flex items-center justify-between", isDrawerMode ? "bg-secondary/50" : "glass-card")}>
                    <span className="text-xs font-medium text-muted-foreground">Theme</span>
                    <ThemeToggle />
                </div>
            </div>
        </div>
    );

    if (isDrawerMode) {
        return <SidebarContent />;
    }

    return (
        <aside className="hidden lg:flex relative inset-y-0 left-0 z-50 w-72 flex-col h-full p-4 gap-4 print:hidden">
            <SidebarContent />
        </aside>
    );
}
