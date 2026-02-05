"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ChatInterface } from "@/components/chat-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Clock, Layers, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

interface Contract {
    id: string;
    title: string;
    status: string;
    uploadDate: string;
    fileSize: number | null;
    mimeType: string | null;
    analysis: { summary: string; risks: any[] } | null;
    chunks: { id: string; content: string; chunkIndex: number }[];
    _count: { chunks: number };
}

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary"; icon: any }> = {
    UPLOAD_PENDING: { label: "Pending", variant: "warning", icon: Clock },
    UPLOADED: { label: "Uploaded", variant: "secondary", icon: Clock },
    PROCESSING: { label: "Processing", variant: "warning", icon: Loader2 },
    COMPLETED: { label: "Completed", variant: "success", icon: CheckCircle },
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
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
                <Navbar />
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-32">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Contract Not Found</h2>
                    <Link href="/dashboard">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const status = statusConfig[contract.status] || statusConfig.PROCESSING;
    const StatusIcon = status.icon;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Contract Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contract Header */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
                                        <FileText className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg truncate">{contract.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {new Date(contract.uploadDate).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge variant={status.variant} className="flex items-center gap-1">
                                        <StatusIcon className={`h-3 w-3 ${contract.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                                        {status.label}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Chunks</span>
                                    <span className="text-sm font-medium">{contract._count.chunks}</span>
                                </div>
                                {contract.fileSize && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Size</span>
                                        <span className="text-sm font-medium">{(contract.fileSize / 1024).toFixed(1)} KB</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Analysis Summary */}
                        {contract.analysis && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Analysis Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{contract.analysis.summary}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Chunks Preview */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Layers className="h-4 w-4" />
                                    Document Chunks
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setShowChunks(!showChunks)}>
                                    {showChunks ? "Hide" : "Show"}
                                </Button>
                            </CardHeader>
                            {showChunks && (
                                <CardContent className="max-h-64 overflow-y-auto space-y-2">
                                    {contract.chunks.map((chunk) => (
                                        <div key={chunk.id} className="p-3 rounded-lg bg-muted text-xs">
                                            <span className="font-medium text-muted-foreground">Chunk {chunk.chunkIndex + 1}:</span>
                                            <p className="mt-1 line-clamp-3">{chunk.content}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            )}
                        </Card>
                    </div>

                    {/* Right: Chat Interface */}
                    <div className="lg:col-span-2">
                        <Card className="h-[700px] flex flex-col">
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    AI Contract Assistant
                                </CardTitle>
                            </CardHeader>
                            <div className="flex-1 overflow-hidden">
                                <ChatInterface contractId={contract.id} contractTitle={contract.title} />
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
