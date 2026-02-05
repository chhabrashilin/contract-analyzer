import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { contractQueue } from "@/lib/queue/in-memory-queue";
import { processContract } from "@/lib/workers/contract-parser";
import { writeFile } from "fs/promises";
import path from "path";

// REGISTER WORKER (Ideally this goes in an instrumentation hook, but for simple dev server it works here or in a separate init file)
// We ensure we only register once if possible, or the queue handles duplicates
contractQueue.onProcess(async (job) => {
    if (job.data.type === "CONTRACT_UPLOAD") {
        await processContract(job.data);
    }
});

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validation
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public/uploads (Mock S3)
        const fileName = `${Date.now()}-${file.name}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        // Create Contract Record
        const relativePath = `/uploads/${fileName}`; // URL accessible path if we served it statically

        const contract = await db.contract.create({
            data: {
                userId: user.id,
                title: file.name,
                fileUrl: relativePath,
                status: "UPLOADED",
                mimeType: file.type,
                fileSize: file.size,
            },
        });

        // Enqueue Job
        // We pass 'public/uploads/...' path for the worker to read from disk
        const workerFilePath = path.join("public", "uploads", fileName);

        await contractQueue.enqueue(contract.id, {
            type: "CONTRACT_UPLOAD",
            contractId: contract.id,
            filePath: workerFilePath
        });

        return NextResponse.json({ success: true, contractId: contract.id });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
