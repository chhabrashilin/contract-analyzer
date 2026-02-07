import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variant === "default" && "border-transparent bg-primary/10 text-primary",
                variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground",
                variant === "destructive" && "border-transparent bg-destructive/10 text-destructive",
                variant === "outline" && "text-foreground border-border",
                variant === "success" && "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                variant === "warning" && "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-500",
                className
            )}
            {...props}
        />
    );
}

export { Badge };
