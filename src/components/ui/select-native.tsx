import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    className={cn(
                        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </select>
                <span className="absolute right-3 top-3 pointer-events-none opacity-50 text-[10px]">▼</span>
            </div>
        )
    }
)
Select.displayName = "Select"

// Shim for Shadcn Select parts to avoid rewriting the consumer too much if possible, 
// BUT simpler to just export the parts as simple pass-throughs or just use native structure in consumer.
// In PackagesPage I used: Select, SelectContent, SelectItem, SelectTrigger, SelectValue.
// This requires a Context-based implementation to mimic Radix.
// Given the time, I will rewrite PackagesPage to use native <select> instead of creating a complex shim.
// AND I will export a "SimpleSelect" here if needed.
// Actually, I already decided to rewrite PackagesPage. So this file might be unused or I can make it a simple wrapper.
// Let's make it a simple wrapper and I'll update PackagesPage.

export { Select }
