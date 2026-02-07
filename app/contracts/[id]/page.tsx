"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ChatInterface } from "@/components/chat-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Clock, Layers, CheckCircle, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";

interface Risk {
    severity: string;
    description: string;
    clause?: string;
}

interface Contract {
    id: string;
    title: string;
    status: string;
    uploadDate: string;
    fileSize: number | null;
    mimeType: string | null;
    analysis: { summary: string; risks: Risk[] } | null;
    chunks: { id: string; content: string; chunkIndex: number }[];
    _count: { chunks: number };
}

type StatusIconComponent = React.ComponentType<{ className?: string }>;

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary"; icon: StatusIconComponent }> = {
    UPLOAD_PENDING: { label: "Pending", variant: "warning", icon: Clock },
    UPLOADED: { label: "Queued", variant: "secondary", icon: Clock },
    PROCESSING: { label: "Processing", variant: "warning", icon: Loader2 },
    COMPLETED: { label: "Ready", variant: "success", icon: CheckCircle },
    FAILED: { label: "Failed", variant: "destructive", icon: AlertCircle },
};

export default function ContractPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [showChunks, setShowChunks] = useState(false);

    useEffect(() => {
        async function fetchContract() {
            try {
                const response = await axios.get(`/api/contracts/${id}`);
                setContract(response.data.contract);
            } catch (error) {
                console.error("Failed to fetch contract", error);
            } finally {
                setLoading(false);
            }
        }
        fetchContract();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Loading contract...</p>
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <h2 className="text-lg font-medium mb-1">Contract Not Found</h2>
                    <p className="text-sm text-muted-foreground mb-4">The requested document could not be found.</p>
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm">Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const status = statusConfig[contract.status] || statusConfig.PROCESSING;
    const StatusIcon = status.icon;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumb */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Contracts
                </Link>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Document Info */}
                        <Card>
                            <CardContent className="p-5">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="font-medium text-sm truncate mb-0.5">
                                            {contract.title}
                                        </h1>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(contract.uploadDate).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3 border-t">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge variant={status.variant}>
                                            <StatusIcon className={`h-3 w-3 mr-1 ${contract.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                                            {status.label}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Chunks</span>
                                        <span className="font-medium">{contract._count.chunks}</span>
                                    </div>
                                    {contract.fileSize && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Size</span>
                                            <span className="font-medium">{(contract.fileSize / 1024).toFixed(0)} KB</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Analysis Summary */}
                        {contract.analysis?.summary && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-sm text-foreground leading-relaxed">
                                        {contract.analysis.summary}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Document Chunks */}
                        <Card>
                            <CardHeader className="pb-2">
                                <button
                                    onClick={() => setShowChunks(!showChunks)}
                                    className="flex items-center justify-between w-full text-left"
                                >
                                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Layers className="h-3.5 w-3.5" />
                                        Document Chunks
                                    </CardTitle>
                                    {showChunks ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </button>
                            </CardHeader>
                            {showChunks && (
                                <CardContent className="pt-0 max-h-72 overflow-y-auto">
                                    <div className="space-y-2">
                                        {contract.chunks.map((chunk) => (
                                            <div
                                                key={chunk.id}
                                                className="p-2.5 rounded-lg bg-muted/50 border"
                                            >
                                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                                    Chunk {chunk.chunkIndex + 1}
                                                </div>
                                                <p className="text-xs text-foreground line-clamp-3 leading-relaxed">
                                                    {chunk.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </div>

                    {/* Chat Interface */}
                    <div className="lg:col-span-2">
                        <Card className="h-[calc(100vh-180px)] min-h-[500px] flex flex-col">
                            <CardHeader className="border-b py-3 px-5">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    AI Assistant
                                </CardTitle>
                            </CardHeader>
                            <div className="flex-1 overflow-hidden">
                                <ChatInterface contractId={contract.id} />
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
