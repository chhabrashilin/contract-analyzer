import { db } from "@/lib/db";
import fs from "fs/promises";
import pdf from "pdf-parse";
import path from "path";
import { chunkText } from "@/lib/chunking/text-chunker";
import { generateEmbeddings } from "@/lib/embeddings/openai-embeddings";
import { vectorStore } from "@/lib/vector";
import mammoth from "mammoth";

interface ContractJobData {
    contractId: string;
    filePath: string;
    mimeType?: string;
}

export async function processContract(data: ContractJobData) {
    const { contractId, filePath, mimeType } = data;

    try {
        console.log(`[Worker] Processing Contract ID: ${contractId}`);

        // Update status to PROCESSING
        await db.contract.update({
            where: { id: contractId },
            data: { status: "PROCESSING" },
        });

        // 1. Read file
        const absolutePath = path.resolve(process.cwd(), filePath);
        const dataBuffer = await fs.readFile(absolutePath);

        // 2. Extract Text
        let text = "";
        let pageCount: number | null = null;

        if (mimeType === "application/pdf" || filePath.toLowerCase().endsWith(".pdf")) {
            const pdfData = await pdf(dataBuffer);
            text = pdfData.text;
            pageCount = pdfData.numpages;
            console.log(`[Worker] Extracted ${pdfData.numpages} pages, ${text.length} characters`);
        } else if (
            mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            filePath.toLowerCase().endsWith(".docx")
        ) {
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            text = result.value || "";
            console.log(`[Worker] Extracted DOCX text, ${text.length} characters`);
        } else {
            throw new Error(`Unsupported file type: ${mimeType || "unknown"}`);
        }

        if (!text || text.trim().length === 0) {
            throw new Error("No extractable text found in document");
        }

        // 3. PHASE 3: Chunk the text
        const chunks = chunkText(text, 1000, 100);
        console.log(`[Worker] Created ${chunks.length} chunks`);

        // 4. PHASE 3: Generate embeddings for all chunks
        const chunkTexts = chunks.map(c => c.content);
        let embeddings: number[][] = [];

        try {
            embeddings = await generateEmbeddings(chunkTexts);
            console.log(`[Worker] Generated ${embeddings.length} embeddings`);
        } catch (error) {
            console.warn("[Worker] Failed to generate embeddings (OpenAI API key might be missing):", error);
            // Continue without embeddings - semantic search won't work but parsing completes
        }

        // 5. PHASE 3: Store chunks in DB and vectors in Vector Store
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            // Create chunk record in database
            const dbChunk = await db.contractChunk.create({
                data: {
                    contractId,
                    content: chunk.content,
                    chunkIndex: chunk.index,
                },
            });

            // Store embedding in vector store if available
            if (embeddings.length > 0 && embeddings[i]) {
                await vectorStore.upsert([{
                    id: dbChunk.id,
                    values: embeddings[i],
                    metadata: {
                        contractId,
                        chunkId: dbChunk.id,
                        chunkIndex: chunk.index,
                        content: chunk.content,
                    },
                }]);
            }
        }

        // 6. Create Analysis Result (simplified for now)
        await db.analysisResult.create({
            data: {
                contractId,
                summary: `Extracted ${pageCount ? `${pageCount} pages, ` : ""}created ${chunks.length} searchable chunks.`,
                risks: [],
            },
        });

        // 7. Update status to COMPLETED
        await db.contract.update({
            where: { id: contractId },
            data: { status: "COMPLETED" },
        });

        console.log(`[Worker] Contract ${contractId} processed successfully with RAG.`);

    } catch (error) {
        console.error(`[Worker] Error processing contract ${contractId}:`, error);

        await db.contract.update({
            where: { id: contractId },
            data: { status: "FAILED" },
        });
    }
}
