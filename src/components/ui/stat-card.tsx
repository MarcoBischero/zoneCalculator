'use client';

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon?: React.ReactNode;
    className?: string;
    delay?: number;
}

export function StatCard({ label, value, trend, trendUp, icon, className, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={cn("glass-card p-4 rounded-xl flex items-start justify-between group hover:border-primary/40", className)}
        >
            <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">{label}</p>
                <h4 className="text-2xl font-bold tracking-tight text-foreground">{value}</h4>
                {trend && (
                    <div className={cn("flex items-center mt-1 text-xs font-medium", trendUp ? "text-green-500" : "text-red-500")}>
                        <span>{trend}</span>
                    </div>
                )}
            </div>
            {icon && (
                <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="p-2 rounded-lg bg-surface-elevated text-primary opacity-80"
                >
                    {icon}
                </motion.div>
            )}
        </motion.div>
    )
}
