"use client";

import { FileUpload } from "@/components/file-upload";
import { Navbar } from "@/components/navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Search, Shield, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [contractId, setContractId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto py-12 md:py-20">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary font-medium mb-6">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
              Enterprise AI Platform
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
              Intelligent Contract Analysis
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Upload legal documents and extract key insights instantly.
              AI-powered analysis with natural language Q&A capabilities.
            </p>
          </div>

          {/* Upload Section */}
          <div className="max-w-lg mx-auto mb-16">
            {contractId ? (
              <div className="p-6 border rounded-xl bg-card animate-scale-in">
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Upload Successful</h3>
                    <p className="text-sm text-muted-foreground">
                      Your document is being processed and will be ready shortly.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center pt-2">
                    <Button variant="outline" size="sm" onClick={() => setContractId(null)}>
                      Upload Another
                    </Button>
                    <Link href="/dashboard">
                      <Button size="sm" className="gap-1.5">
                        View Dashboard <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <FileUpload onUploadComplete={(id) => setContractId(id)} />
            )}
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-3 gap-4 mb-16">
            {[
              {
                icon: FileText,
                title: "Document Processing",
                desc: "Automatic text extraction and intelligent chunking for optimal analysis.",
              },
              {
                icon: Search,
                title: "Semantic Search",
                desc: "Vector-based retrieval to find relevant clauses and terms instantly.",
              },
              {
                icon: Shield,
                title: "Risk Identification",
                desc: "AI-powered detection of potential issues and important obligations.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center mb-3">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center py-10 px-6 rounded-xl bg-muted/50 border">
            <h2 className="text-xl font-semibold mb-2">Ready to get started?</h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Upload your first contract or explore existing analyses in the dashboard.
            </p>
            <Link href="/dashboard">
              <Button className="gap-1.5">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>ContractIQ - Intelligent Document Analysis</p>
            <p>Built with Next.js and Gemini AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
