'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Calculator, Utensils, Search, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Sidebar } from './Sidebar'; // Reusing Sidebar content for Menu Drawer if needed, or just a custom Menu

export function BottomNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const navItems = [
        { name: 'Home', href: '/', icon: LayoutDashboard },
        { name: 'Calc', href: '/calculator', icon: Calculator },
        { name: 'Pasti', href: '/meals', icon: Utensils },
        { name: 'Cibi', href: '/foods', icon: Search },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            {/* Gradient Fade above nav */}
            <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />

            <nav className="relative bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-white/20 dark:border-white/10 pb-safe-area shadow-[0_-4px_20px_rgba(0,0,0,0.05)] print:hidden">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        className="absolute top-0 w-8 h-1 rounded-b-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <item.icon className={cn("w-6 h-6", isActive && "animate-pulse-subtle")} />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}

                    {/* Menu Trigger (Opens Sidebar Drawer) */}
                    <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerTrigger asChild>
                            <button
                                className={cn(
                                    "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Menu className="w-6 h-6" />
                                <span className="text-[10px] font-medium">Menu</span>
                            </button>
                        </DrawerTrigger>
                        <DrawerContent className="h-[85vh]">
                            {/* We can render the Sidebar content here adapted for Drawer, 
                                 but for now let's just re-use the Sidebar component logic if possible 
                                 or a simplified menu. 
                                 Since Sidebar has its own mobile logic, we might need to extract the nav list.
                                 For now, let's keep it simple.
                             */}
                            <div className="h-full overflow-hidden rounded-t-[10px]">
                                <Sidebar isDrawerMode={true} />
                            </div>
                        </DrawerContent>
                    </Drawer>
                </div>
            </nav>
        </div>
    );
}
