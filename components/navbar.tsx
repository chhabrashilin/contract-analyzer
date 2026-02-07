"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Upload, FileSearch } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "Upload", icon: Upload },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
            <div className="container mx-auto flex h-14 items-center px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-2.5 mr-8">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <FileSearch className="h-4.5 w-4.5" />
                    </div>
                    <span className="font-semibold text-lg tracking-tight text-foreground">
                        ContractIQ
                    </span>
                </Link>

                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="ml-auto flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="font-medium">Online</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
