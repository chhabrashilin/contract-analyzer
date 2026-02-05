"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { FileText, Plus, Clock, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
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
    UPLOADED: { label: "Uploaded", variant: "secondary" as const, icon: Clock },
    PROCESSING: { label: "Processing", variant: "warning" as const, icon: Loader2 },
    COMPLETED: { label: "Completed", variant: "success" as const, icon: CheckCircle },
    FAILED: { label: "Failed", variant: "destructive" as const, icon: AlertCircle },
};

export default function DashboardPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContracts() {
            try {
                const response = await axios.get("/api/contracts");
                setContracts(response.data.contracts || []);
            } catch (error) {
                console.error("Failed to fetch contracts", error);
            } finally {
                setLoading(false);
            }
        }
        fetchContracts();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Your Contracts</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and analyze your uploaded contracts
                        </p>
                    </div>
                    <Link href="/">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Upload New
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Contracts", value: contracts.length, color: "text-foreground" },
                        { label: "Completed", value: contracts.filter(c => c.status === "COMPLETED").length, color: "text-green-600" },
                        { label: "Processing", value: contracts.filter(c => c.status === "PROCESSING").length, color: "text-yellow-600" },
                        { label: "Failed", value: contracts.filter(c => c.status === "FAILED").length, color: "text-red-600" },
                    ].map((stat, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{stat.label}</span>
                                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Contract List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : contracts.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No contracts yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Upload your first contract to get started with AI analysis
                            </p>
                            <Link href="/">
                                <Button>Upload Contract</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {contracts.map((contract) => {
                            const status = statusConfig[contract.status];
                            const StatusIcon = status.icon;

                            return (
                                <Card key={contract.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-lg bg-primary/10">
                                                    <FileText className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-semibold">{contract.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Uploaded {new Date(contract.uploadDate).toLocaleDateString()}
                                                        {contract._count.chunks > 0 && ` • ${contract._count.chunks} chunks`}
                                                    </p>
                                                    {contract.analysis?.summary && (
                                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                                                            {contract.analysis.summary}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Badge variant={status.variant} className="flex items-center gap-1">
                                                    <StatusIcon className={`h-3 w-3 ${contract.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                                                    {status.label}
                                                </Badge>

                                                {contract.status === "COMPLETED" && (
                                                    <Link href={`/contracts/${contract.id}`}>
                                                        <Button variant="ghost" size="sm" className="gap-1">
                                                            Analyze <ArrowRight className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
