import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const contract = await db.contract.findFirst({
            where: {
                id,
                userId: user.id,
            },
            include: {
                analysis: true,
                chunks: {
                    orderBy: { chunkIndex: "asc" },
                    take: 20,
                },
                _count: {
                    select: { chunks: true },
                },
            },
        });

        if (!contract) {
            return NextResponse.json({ error: "Contract not found" }, { status: 404 });
        }

        return NextResponse.json({ contract });
    } catch (error) {
        console.error("Error fetching contract:", error);
        return NextResponse.json(
            { error: "Failed to fetch contract" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership before deletion
        const contract = await db.contract.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!contract) {
            return NextResponse.json({ error: "Contract not found" }, { status: 404 });
        }

        // Delete the contract (chunks and analysis cascade via Prisma schema)
        await db.contract.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: "Contract deleted" });
    } catch (error) {
        console.error("Error deleting contract:", error);
        return NextResponse.json(
            { error: "Failed to delete contract" },
            { status: 500 }
        );
    }
}
