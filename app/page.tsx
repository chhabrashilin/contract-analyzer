"use client";

import { FileUpload } from "@/components/file-upload";
import { Navbar } from "@/components/navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [contractId, setContractId] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-muted/50 text-sm">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span>Powered by RAG + GPT-4</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Intelligent
            </span>{" "}
            Contract Analysis
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your legal documents and get instant AI-powered insights.
            Ask questions, identify risks, and understand complex terms in seconds.
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-xl mx-auto mb-16">
          {contractId ? (
            <div className="p-8 border rounded-2xl bg-card shadow-lg animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Upload Successful!</h3>
                <p className="text-muted-foreground">
                  Your contract is being processed in the background.
                </p>
                <div className="flex gap-3 justify-center pt-4">
                  <Button variant="outline" onClick={() => setContractId(null)}>
                    Upload Another
                  </Button>
                  <Link href="/dashboard">
                    <Button className="gap-2">
                      View Dashboard <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <FileUpload onUploadComplete={(id) => setContractId(id)} />
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: "Instant Processing",
              desc: "Asynchronous queue-based processing. Upload and go.",
              gradient: "from-amber-500 to-orange-500",
            },
            {
              icon: Shield,
              title: "Smart Analysis",
              desc: "RAG-powered semantic search over document chunks.",
              gradient: "from-violet-500 to-indigo-500",
            },
            {
              icon: Sparkles,
              title: "AI Q&A",
              desc: "Ask natural language questions, get cited answers.",
              gradient: "from-emerald-500 to-teal-500",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 py-12 px-8 rounded-2xl bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-purple-600/10 border">
          <h2 className="text-2xl font-bold mb-3">Ready to analyze your contracts?</h2>
          <p className="text-muted-foreground mb-6">
            Join the future of document analysis. Event-driven, AI-powered, production-ready.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              View Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Built with Next.js 15, OpenAI, and ambition. 🚀</p>
        </div>
      </footer>
    </div>
  );
}
