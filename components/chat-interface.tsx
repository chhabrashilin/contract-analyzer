"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2, FileText, MessageSquare } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
    sources?: { chunkId: string; content: string; score: number }[];
}

interface ChatInterfaceProps {
    contractId: string;
    contractTitle: string;
}

export function ChatInterface({ contractId, contractTitle }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await axios.post(`/api/contracts/${contractId}/ask`, {
                question: userMessage,
            });

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: response.data.answer,
                    sources: response.data.sources,
                },
            ]);
        } catch (error) {
            let errorMessage = "Sorry, I couldn't process your question. Please try again.";

            if (axios.isAxiosError(error) && error.response?.data?.error) {
                const apiError = error.response.data.error;
                if (error.response.status === 503) {
                    errorMessage = "AI features are temporarily unavailable. Please try again later.";
                } else if (error.response.status === 400) {
                    errorMessage = apiError;
                } else {
                    errorMessage = `Error: ${apiError}`;
                }
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: errorMessage,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedQuestions = [
        "Key terms?",
        "Termination clause?",
        "Payment terms?",
        "Liability limits?",
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
                            <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-sm font-medium mb-1">Ask about this contract</h3>
                        <p className="text-xs text-muted-foreground mb-5 max-w-xs">
                            Get answers about terms, clauses, obligations, and more.
                        </p>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(q)}
                                    className="text-xs px-2.5 py-1 rounded-md border bg-card hover:bg-muted transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex gap-2.5",
                                message.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            {message.role === "assistant" && (
                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-3.5 w-3.5 text-primary" />
                                </div>
                            )}

                            <div
                                className={cn(
                                    "max-w-[85%] rounded-xl px-3.5 py-2.5",
                                    message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                )}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {message.content}
                                </p>

                                {/* Sources */}
                                {message.sources && message.sources.length > 0 && (
                                    <div className="mt-2.5 pt-2.5 border-t border-border/30">
                                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                                            Sources
                                        </p>
                                        <div className="space-y-1.5">
                                            {message.sources.slice(0, 2).map((source, i) => (
                                                <div
                                                    key={i}
                                                    className="text-xs p-2 rounded-md bg-background/60 flex items-start gap-1.5"
                                                >
                                                    <FileText className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                                    <span className="line-clamp-2 text-muted-foreground">
                                                        {source.content}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {message.role === "user" && (
                                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                                    <User className="h-3.5 w-3.5 text-secondary-foreground" />
                                </div>
                            )}
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="bg-muted rounded-xl px-3.5 py-2.5">
                            <div className="flex items-center gap-1.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Analyzing...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 border-t bg-card">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        disabled={isLoading}
                        className="flex-1 text-sm"
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="flex-shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
