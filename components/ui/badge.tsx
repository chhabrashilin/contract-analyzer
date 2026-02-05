import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variant === "default" && "border-transparent bg-primary text-primary-foreground",
                variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground",
                variant === "destructive" && "border-transparent bg-destructive text-destructive-foreground",
                variant === "outline" && "text-foreground",
                variant === "success" && "border-transparent bg-green-500/10 text-green-600 dark:text-green-400",
                variant === "warning" && "border-transparent bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
                className
            )}
            {...props}
        />
    );
}

export { Badge };
