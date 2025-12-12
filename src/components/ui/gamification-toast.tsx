"use client"

import * as React from "react"
import { Trophy, Flame, Star } from "lucide-react"

interface ToastProps {
    message: string
    type?: 'xy' | 'level' | 'streak'
    points?: number
    isVisible: boolean
    onClose: () => void
}

export function GamificationToast({ message, type = 'xy', points, isVisible, onClose }: ToastProps) {
    React.useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 3000)
            return () => clearTimeout(timer)
        }
    }, [isVisible, onClose])

    if (!isVisible) return null

    const getIcon = () => {
        switch (type) {
            case 'level': return <Trophy className="w-6 h-6 text-yellow-500" />
            case 'streak': return <Flame className="w-6 h-6 text-orange-500" />
            default: return <Star className="w-6 h-6 text-zone-blue-500" />
        }
    }

    return (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right fade-in duration-300">
            <div className="glass-card flex items-center gap-3 p-4 rounded-xl border-l-4 border-l-zone-blue-500 shadow-2xl">
                <div className="p-2 bg-white/10 rounded-full animate-bounce">
                    {getIcon()}
                </div>
                <div>
                    <h4 className="font-bold text-sm text-foreground">{message}</h4>
                    {points && <p className="text-xs text-muted-foreground">+{points} XP Earned!</p>}
                </div>
            </div>
        </div>
    )
}
