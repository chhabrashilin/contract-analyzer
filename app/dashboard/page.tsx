"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { FileText, Plus, Clock, CheckCircle, AlertCircle, Loader2, ChevronRight, FolderOpen } from "lucide-react";
import axios from "axios";

interface Contract {
    id: string;
    title: string;
    status: "UPLOAD_PENDING" | "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
    uploadDate: string;
    fileSize: number | null;
    mimeType: string | null;
    analysis: { summary: string } | null;
    _count: { chunks: number };
}

const statusConfig = {
    UPLOAD_PENDING: { label: "Pending", variant: "warning" as const, icon: Clock },
    UPLOADED: { label: "Queued", variant: "secondary" as const, icon: Clock },
    PROCESSING: { label: "Processing", variant: "warning" as const, icon: Loader2 },
    COMPLETED: { label: "Ready", variant: "success" as const, icon: CheckCircle },
    FAILED: { label: "Failed", variant: "destructive" as const, icon: AlertCircle },
};

export default function DashboardPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchContracts = async () => {
        try {
            const response = await axios.get("/api/contracts");
            setContracts(response.data.contracts || []);
        } catch (error) {
            console.error("Failed to fetch contracts", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchContracts();
    }, []);

    // Auto-refresh when any contract is processing
    useEffect(() => {
        const hasProcessing = contracts.some(c => c.status === "PROCESSING");
        if (!hasProcessing) return;

        const interval = setInterval(() => {
            fetchContracts();
        }, 5000);

        return () => clearInterval(interval);
    }, [contracts]);

    const stats = [
        {
            label: "Total",
            value: contracts.length,
            sublabel: "documents"
        },
        {
            label: "Ready",
            value: contracts.filter(c => c.status === "COMPLETED").length,
            sublabel: "for analysis"
        },
        {
            label: "Processing",
            value: contracts.filter(c => c.status === "PROCESSING" || c.status === "UPLOADED").length,
            sublabel: "in queue"
        },
        {
            label: "Failed",
            value: contracts.filter(c => c.status === "FAILED").length,
            sublabel: "errors"
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Contracts</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Manage and analyze your uploaded documents
                        </p>
                    </div>
                    <Link href="/">
                        <Button size="sm" className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            Upload
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {stats.map((stat, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {stat.label}
                                    </span>
                                    <span className="text-2xl font-semibold tabular-nums">
                                        {loading ? "-" : stat.value}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{stat.sublabel}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Contract List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">Loading contracts...</p>
                    </div>
                ) : contracts.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                                <FolderOpen className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-base font-medium mb-1">No contracts yet</h3>
                            <p className="text-sm text-muted-foreground mb-5 max-w-sm">
                                Upload your first document to start analyzing contracts with AI
                            </p>
                            <Link href="/">
                                <Button size="sm">Upload Contract</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {contracts.map((contract) => {
                            const status = statusConfig[contract.status];
                            const StatusIcon = status.icon;
                            const isClickable = contract.status === "COMPLETED";

                            const cardContent = (
                                <Card className={`group transition-all ${isClickable ? 'hover:shadow-md cursor-pointer' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="font-medium text-sm truncate">
                                                        {contract.title}
                                                    </h3>
                                                    <Badge variant={status.variant} className="flex-shrink-0">
                                                        <StatusIcon className={`h-3 w-3 mr-1 ${contract.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                                                        {status.label}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>
                                                        {new Date(contract.uploadDate).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric"
                                                        })}
                                                    </span>
                                                    {contract._count.chunks > 0 && (
                                                        <>
                                                            <span className="text-border">|</span>
                                                            <span>{contract._count.chunks} chunks</span>
                                                        </>
                                                    )}
                                                    {contract.fileSize && (
                                                        <>
                                                            <span className="text-border">|</span>
                                                            <span>{(contract.fileSize / 1024).toFixed(0)} KB</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {isClickable && (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );

                            return isClickable ? (
                                <Link key={contract.id} href={`/contracts/${contract.id}`}>
                                    {cardContent}
                                </Link>
                            ) : (
                                <div key={contract.id}>{cardContent}</div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
