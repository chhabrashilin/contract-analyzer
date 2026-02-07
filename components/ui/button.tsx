"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "active:scale-[0.98]",
                    // Variants
                    variant === "default" && [
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90",
                        "shadow-sm hover:shadow-md",
                    ],
                    variant === "destructive" && [
                        "bg-destructive text-destructive-foreground",
                        "hover:bg-destructive/90",
                        "shadow-sm hover:shadow-md",
                    ],
                    variant === "outline" && [
                        "border border-input bg-background",
                        "hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20",
                    ],
                    variant === "secondary" && [
                        "bg-secondary text-secondary-foreground",
                        "hover:bg-secondary/80",
                    ],
                    variant === "ghost" && [
                        "hover:bg-accent hover:text-accent-foreground",
                    ],
                    variant === "link" && [
                        "text-primary underline-offset-4 hover:underline",
                    ],
                    // Sizes
                    size === "default" && "h-9 px-4 py-2",
                    size === "sm" && "h-8 rounded-md px-3 text-xs",
                    size === "lg" && "h-10 rounded-lg px-6",
                    size === "icon" && "h-9 w-9",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
