"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, Loader2, FileText, Sparkles } from "lucide-react";
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
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I couldn't process your question. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedQuestions = [
        "What are the key terms of this contract?",
        "Is there a termination clause?",
        "What are the payment terms?",
        "Are there any liability limitations?",
    ];

    return (
        <div className="flex flex-col h-[600px]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mb-4">
                            <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Ask about {contractTitle}</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                            I've analyzed this contract and can answer questions about its terms, clauses, and conditions.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(q)}
                                    className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors"
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
                                "flex gap-3",
                                message.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            {message.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                            )}

                            <div
                                className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-3",
                                    message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                )}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                {/* Sources */}
                                {message.sources && message.sources.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border/50">
                                        <p className="text-xs font-medium mb-2 opacity-70">Sources:</p>
                                        <div className="space-y-2">
                                            {message.sources.slice(0, 2).map((source, i) => (
                                                <div
                                                    key={i}
                                                    className="text-xs p-2 rounded bg-background/50 flex items-start gap-2"
                                                >
                                                    <FileText className="h-3 w-3 mt-0.5 flex-shrink-0 opacity-50" />
                                                    <span className="line-clamp-2 opacity-70">{source.content}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {message.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                    <User className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-muted rounded-2xl px-4 py-3">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about this contract..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
