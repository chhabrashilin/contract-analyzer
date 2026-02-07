// Database client with graceful fallback
// When DATABASE_URL is not available, we use mock data

import { hasDatabase } from "./env";

// Type definitions for mock DB
type MockUser = { id: string; email: string; name: string; role: string };
type MockContract = {
  id: string;
  userId: string;
  title: string;
  fileUrl: string;
  status: string;
  uploadDate: Date;
  updatedAt: Date;
  fileSize: number | null;
  mimeType: string | null;
};
type MockAnalysisResult = { id: string; contractId: string; summary: string; risks: any[] };
type MockContractChunk = { id: string; contractId: string; content: string; chunkIndex: number };

// In-memory storage for development without DB
const mockStorage = {
  users: new Map<string, MockUser>(),
  contracts: new Map<string, MockContract>(),
  analysisResults: new Map<string, MockAnalysisResult>(),
  contractChunks: new Map<string, MockContractChunk>(),
};

// Generate unique IDs
const generateId = () => `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock database client that mirrors Prisma's API
const mockDb = {
  user: {
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      if (where.id) return mockStorage.users.get(where.id) || null;
      for (const user of mockStorage.users.values()) {
        if (user.email === where.email) return user;
      }
      return null;
    },
    create: async ({ data }: { data: Partial<MockUser> & { email: string } }) => {
      const user: MockUser = {
        id: data.id || generateId(),
        email: data.email,
        name: data.name ?? "",
        role: data.role || "USER",
      };
      mockStorage.users.set(user.id, user);
      return user;
    },
  },
  contract: {
    findMany: async ({ where, include, orderBy }: any = {}) => {
      let contracts = Array.from(mockStorage.contracts.values());
      if (where?.userId) {
        contracts = contracts.filter(c => c.userId === where.userId);
      }
      // Sort by uploadDate desc if specified
      contracts.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());

      // Add related data if include specified
      return contracts.map(c => ({
        ...c,
        analysis: include?.analysis ? mockStorage.analysisResults.get(c.id) || null : undefined,
        chunks: include?.chunks ? Array.from(mockStorage.contractChunks.values()).filter(ch => ch.contractId === c.id) : undefined,
        _count: include?._count ? {
          chunks: Array.from(mockStorage.contractChunks.values()).filter(ch => ch.contractId === c.id).length
        } : undefined,
      }));
    },
    findFirst: async ({ where, include }: any = {}) => {
      const contracts = await mockDb.contract.findMany({ where, include });
      return contracts[0] || null;
    },
    create: async ({ data }: { data: any }) => {
      const contract: MockContract = {
        id: data.id || generateId(),
        userId: data.userId,
        title: data.title,
        fileUrl: data.fileUrl,
        status: data.status || "UPLOAD_PENDING",
        uploadDate: new Date(),
        updatedAt: new Date(),
        fileSize: data.fileSize || null,
        mimeType: data.mimeType || null,
      };
      mockStorage.contracts.set(contract.id, contract);
      return contract;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const contract = mockStorage.contracts.get(where.id);
      if (!contract) throw new Error("Contract not found");
      const updated = { ...contract, ...data, updatedAt: new Date() };
      mockStorage.contracts.set(where.id, updated);
      return updated;
    },
  },
  analysisResult: {
    create: async ({ data }: { data: any }) => {
      const result: MockAnalysisResult = {
        id: generateId(),
        contractId: data.contractId,
        summary: data.summary || "",
        risks: data.risks || [],
      };
      mockStorage.analysisResults.set(data.contractId, result);
      return result;
    },
  },
  contractChunk: {
    create: async ({ data }: { data: any }) => {
      const chunk: MockContractChunk = {
        id: generateId(),
        contractId: data.contractId,
        content: data.content,
        chunkIndex: data.chunkIndex,
      };
      mockStorage.contractChunks.set(chunk.id, chunk);
      return chunk;
    },
  },
};

// Real Prisma client (only imported if DATABASE_URL exists)
let prismaClient: any = null;

async function getPrismaClient() {
  if (!hasDatabase) return null;

  if (!prismaClient) {
    try {
      // Dynamic import for Prisma client
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prismaModule = await import("@prisma/client") as any;
      const PrismaClient = prismaModule.PrismaClient || prismaModule.default?.PrismaClient;

      if (!PrismaClient) {
        console.warn("PrismaClient not found in module. Run 'npx prisma generate' first.");
        return null;
      }

      prismaClient = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    } catch (error) {
      console.warn("Failed to initialize Prisma client:", error);
      return null;
    }
  }
  return prismaClient;
}

// Export a proxy that uses real DB if available, otherwise mock
export const db = new Proxy({} as typeof mockDb, {
  get(_, prop: keyof typeof mockDb) {
    // In development without DB, use mock
    if (!hasDatabase) {
      console.log(`[MockDB] Using mock database for: ${String(prop)}`);
      return mockDb[prop];
    }

    // With DB, try to use Prisma
    return new Proxy({}, {
      get(_, method) {
        return async (...args: any[]) => {
          const client = await getPrismaClient();
          if (client && (client as any)[prop]) {
            return (client as any)[prop][method](...args);
          }
          // Fallback to mock if Prisma fails
          return (mockDb[prop] as any)[method](...args);
        };
      },
    });
  },
});
