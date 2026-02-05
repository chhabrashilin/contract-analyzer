import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contracts = await db.contract.findMany({
            where: { userId: user.id },
            include: {
                analysis: true,
                _count: {
                    select: { chunks: true },
                },
            },
            orderBy: { uploadDate: "desc" },
        });

        return NextResponse.json({ contracts });
    } catch (error) {
        console.error("Error fetching contracts:", error);
        return NextResponse.json(
            { error: "Failed to fetch contracts" },
            { status: 500 }
        );
    }
}
