"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-6 p-8 max-w-md">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Something went wrong</h2>
                    <p className="text-muted-foreground">
                        An unexpected error occurred. Please try again or contact support if the problem persists.
                    </p>
                </div>
                <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => window.location.href = "/"}>
                        Go Home
                    </Button>
                    <Button onClick={reset} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>
                </div>
                {process.env.NODE_ENV === "development" && (
                    <pre className="mt-6 p-4 bg-muted rounded-lg text-left text-xs overflow-auto max-h-40">
                        {error.message}
                    </pre>
                )}
            </div>
        </div>
    );
}
