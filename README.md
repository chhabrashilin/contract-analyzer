# ContractAI - Intelligent Contract Analysis Platform

An **Amazon Senior Developer** level project showcasing production-grade Next.js architecture with RAG (Retrieval Augmented Generation) for legal document analysis.

## 🚀 Features

- **Smart Document Processing**: Asynchronous parsing of PDF/DOCX contracts with queue-based architecture
- **RAG-Powered Search**: Semantic search using OpenAI embeddings and vector similarity
- **Event-Driven Architecture**: Decoupled processing pipeline using in-memory queue (production-ready for Redis/BullMQ)
- **Type-Safe Database**: PostgreSQL with Prisma ORM and comprehensive schema
- **Modern UI**: Beautiful, responsive interface built with Next.js 15 and TailwindCSS

## 📋 Architecture

```
┌─────────────┐
│   Next.js   │  ← User uploads contract
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Routes     │  ← Validates, saves file, enqueues job
│  /api/upload    │
└──────┬──────────┘
       │
       ▼
┌──────────────────┐
│  Queue Service   │  ← In-memory (dev) / Redis (prod)
│  (Async Jobs)    │
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│  Contract Parser     │  ← Extracts text, chunks, embeds
│  Worker              │
└──────┬───────────────┘
       │
       ├─────────────────────┐
       ▼                     ▼
┌─────────────┐      ┌────────────────┐
│  PostgreSQL │      │  Vector Store  │
│  (Metadata) │      │  (Embeddings)  │
└─────────────┘      └────────────────┘
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma
- **Vector DB**: In-Memory (dev) / Pinecone (production-ready)
- **AI**: OpenAI (GPT-4, text-embedding-3-small)
- **Queue**: In-Memory / BullMQ (Redis)
- **Styling**: TailwindCSS 4

## 📦 Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Add your DATABASE_URL and OPENAI_API_KEY

# Generate Prisma Client (optional if DB available)
npx prisma generate

# Run development server
npm run dev
```

## 🔑 Environment Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/contractai"
OPENAI_API_KEY="sk-..."
```

## 🎯 Usage

1. **Upload Contract**: Drag & drop a PDF or DOCX file
2. **Processing**: System parses, chunks, and generates embeddings asynchronously
3. **Query**: Ask questions via `/api/contracts/[id]/ask`

### Example API Request

```bash
curl -X POST http://localhost:3000/api/contracts/abc123/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the termination clause?"}'
```

**Response**:
```json
{
  "answer": "The termination clause (Chunk 3) allows either party to terminate with 30 days written notice.",
  "sources": [...]
}
```

## 🏗️ Project Structure

```
contract-analyzer/
├── app/
│   ├── page.tsx              # Main upload interface
│   └── api/
│       ├── upload/           # File upload endpoint
│       └── contracts/[id]/
│           └── ask/          # RAG question-answering
├── lib/
│   ├── db.ts                 # Prisma client
│   ├── auth.ts               # Auth utilities
│   ├── queue/                # Queue abstraction
│   ├── workers/              # Background job processors
│   ├── chunking/             # Text chunking logic
│   ├── embeddings/           # OpenAI embedding generation
│   └── vector/               # Vector store interface
├── components/
│   └── file-upload.tsx       # Drag & drop component
└── prisma/
    └── schema.prisma         # Database schema
```

## 🔐 Security Features

- File validation (MIME type, size)
- User authentication (mock for dev, ready for Clerk/NextAuth)
- Database-level cascading deletes
- Error handling with graceful failures

## 🚀 Production Deployment

### Recommended Setup
- **Frontend**: Vercel
- **Database**: Supabase / AWS RDS
- **Vector DB**: Pinecone
- **Queue**: Redis (Upstash) + BullMQ

## 📊 Database Schema

- `User`: User accounts with role-based access
- `Contract`: Contract metadata and status
- `ContractChunk`: Text chunks for RAG
- `AnalysisResult`: AI-generated summaries and risk analysis

## 🎓 Learning Highlights

This project demonstrates:
- ✅ Event-driven architecture patterns
- ✅ RAG implementation from scratch
- ✅ Queue-based async processing
- ✅ Type-safe database operations
- ✅ Modular, testable code structure
- ✅ Production-ready Next.js patterns

## 📝 License

MIT

---

**Built with ambition.** 🚀
