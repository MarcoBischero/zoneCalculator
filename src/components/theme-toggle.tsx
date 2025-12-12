"use client"

import * as React from "react"
import { Moon, Sun, Zap, Leaf } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themes = [
    {
        id: "professional-light",
        name: "Ocean Serenity",
        icon: Sun,
        preview: "from-cyan-300 via-teal-400 to-blue-500",
        description: "Calmo e rinfrescante",
        emoji: "🌊"
    },
    {
        id: "midnight-pro",
        name: "Deep Sea",
        icon: Moon,
        preview: "from-cyan-400 via-teal-500 to-indigo-900",
        description: "Profondità oceanica",
        emoji: "🌑"
    },
    {
        id: "tokyo-nights",
        name: "Tokyo Nights",
        icon: Zap,
        preview: "from-cyan-400 via-pink-500 to-purple-500",
        description: "Cyberpunk autentico",
        emoji: "🌃"
    },
    {
        id: "zen-garden",
        name: "Zen Garden",
        icon: Leaf,
        preview: "from-[#F8F4E3] via-[#6B9080] to-[#E07A5F]",
        description: "Naturale e rilassante",
        emoji: "🌿"
    },
]

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
            >
                <Sun className="h-4 w-4" />
                <span className="flex-1 text-left">Select Theme</span>
            </Button>
        )
    }

    const currentTheme = themes.find(t => t.id === theme) || themes[0]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 hover:bg-accent transition-colors"
                >
                    <span className="text-lg">{currentTheme.emoji}</span>
                    <span className="flex-1 text-left text-sm font-medium">
                        {currentTheme.name}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
                {themes.map((t) => (
                    <DropdownMenuItem
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className="flex items-start gap-3 p-3 cursor-pointer rounded-lg hover:bg-accent/50 transition-all"
                    >
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${t.preview} flex items-center justify-center shadow-lg ring-2 ring-offset-2 ${theme === t.id ? 'ring-primary' : 'ring-transparent'} transition-all`}>
                            <span className="text-2xl drop-shadow-lg">{t.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm mb-0.5">{t.name}</div>
                            <div className="text-xs text-muted-foreground">{t.description}</div>
                        </div>
                        {theme === t.id && (
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
