import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateEmbedding } from "@/lib/embeddings/openai-embeddings";
import { vectorStore } from "@/lib/vector";
import { hasGemini } from "@/lib/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Only initialize Gemini if API key is available
const genAI = hasGemini
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    : null;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: contractId } = await params;
        const { question } = await request.json();

        if (!question || typeof question !== "string") {
            return NextResponse.json({ error: "Question is required" }, { status: 400 });
        }

        // Verify contract exists and belongs to user
        const contract = await db.contract.findFirst({
            where: {
                id: contractId,
                userId: user.id,
            },
        });

        if (!contract) {
            return NextResponse.json({ error: "Contract not found" }, { status: 404 });
        }

        if (contract.status !== "COMPLETED") {
            return NextResponse.json(
                { error: "Contract is still being processed" },
                { status: 400 }
            );
        }

        // Check if AI features are available
        if (!genAI) {
            return NextResponse.json(
                { error: "AI features are not available. Please configure the GEMINI_API_KEY." },
                { status: 503 }
            );
        }

        // RAG Pipeline
        // 1. Embed the question
        const questionEmbedding = await generateEmbedding(question);

        // 2. Query vector store for relevant chunks
        const topK = 5;
        const relevantChunks = await vectorStore.query(
            questionEmbedding,
            topK,
            { contractId }
        );

        if (relevantChunks.length === 0) {
            return NextResponse.json({
                answer: "I couldn't find relevant information in this contract to answer your question.",
                sources: [],
            });
        }

        // 3. Build context from retrieved chunks
        const context = relevantChunks
            .map((chunk, idx) => `[Chunk ${idx + 1}]:\n${chunk.metadata.content}`)
            .join("\n\n");

        // 4. Generate answer using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a legal contract analysis assistant. Answer the user's question based ONLY on the provided contract excerpts. 
If the answer cannot be found in the excerpts, say so. Always cite which chunk(s) you're referencing.

Contract Excerpts:
${context}

Question: ${question}`;

        const result = await model.generateContent(prompt);
        const answer = result.response.text() || "No answer generated.";

        // 5. Return answer with sources
        return NextResponse.json({
            answer,
            sources: relevantChunks.map((chunk) => ({
                chunkId: chunk.id,
                content: chunk.metadata.content,
                score: chunk.score,
            })),
        });
    } catch (error) {
        console.error("Error in /ask endpoint:", error);
        return NextResponse.json(
            { error: "Failed to process question" },
            { status: 500 }
        );
    }
}
