import { db } from "@/lib/db";

// TODO: Replace with actual Auth provider (Clerk/NextAuth)
export async function getCurrentUser() {
    // For development, ensure a mock user exists in the DB
    const mockUserId = "mock-user-id";

    try {
        let user = await db.user.findUnique({
            where: { id: mockUserId }
        });

        if (!user) {
            // Create the mock user if it doesn't exist
            user = await db.user.create({
                data: {
                    id: mockUserId,
                    email: "demo@example.com",
                    name: "Demo User",
                    role: "ADMIN"
                }
            });
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role
        };
    } catch {
        // If DB is not available, return mock data
        console.warn("Database not available, using mock user");
        return {
            id: mockUserId,
            email: "demo@example.com",
            role: "ADMIN"
        };
    }
}

export async function getSession() {
    const user = await getCurrentUser();
    return { user };
}
