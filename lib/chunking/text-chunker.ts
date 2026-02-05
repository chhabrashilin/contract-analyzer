export interface TextChunk {
    content: string;
    index: number;
}

/**
 * Chunks text into semantic segments
 * - Prefers splitting at paragraph boundaries
 * - Respects max chunk size
 * - Maintains context with slight overlap
 */
export function chunkText(text: string, maxChunkSize = 1000, overlap = 100): TextChunk[] {
    const chunks: TextChunk[] = [];

    // Split by double newline (paragraphs) or single newline
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    let currentChunk = "";
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const trimmedParagraph = paragraph.trim();

        // If adding this paragraph exceeds max size, save current chunk and start new one
        if (currentChunk.length + trimmedParagraph.length > maxChunkSize && currentChunk.length > 0) {
            chunks.push({
                content: currentChunk.trim(),
                index: chunkIndex++
            });

            // Start new chunk with overlap from previous chunk
            const words = currentChunk.split(/\s+/);
            const overlapWords = words.slice(-Math.min(overlap / 5, words.length)); // Approx overlap
            currentChunk = overlapWords.join(" ") + "\n\n" + trimmedParagraph;
        } else {
            currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + trimmedParagraph;
        }
    }

    // Add final chunk
    if (currentChunk.trim().length > 0) {
        chunks.push({
            content: currentChunk.trim(),
            index: chunkIndex
        });
    }

    console.log(`[Chunker] Created ${chunks.length} chunks from text`);
    return chunks;
}
