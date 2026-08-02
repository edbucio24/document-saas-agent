# Document Saas Agent
**Document Saas Agent** is an intelligent, PDF-powered AI chat interface. This application allows users to upload documents and engage in context-aware conversations, leveraging real-time retrieval-augmented generation (RAG) to provide accurate, document-specific insights.

##  Overview
Document Saas Agent bridges the gap between static documents and interactive intelligence. The app uses isolated Pinecone namespaces per document ID to ensure strict tenant and document separation during semantic searches. By combining advanced vector search with generative AI, it enables users to query their own data seamlessly. Whether you are analyzing long-form reports or extracting specific data points, this tool provides a conversational interface to your PDF files.

<img width="1917" height="1017" alt="image" src="https://github.com/user-attachments/assets/34cd1c05-3f1c-426b-93db-91f0e85ea267" />


## Features

- PDF Upload — Drag-and-drop PDF upload with file validation
- Authentication — Secure sign-in/sign-up via Clerk
- Semantic Search — Documents are chunked and embedded, enabling retrieval of the most relevant passages for any question
- Streaming Chat — Real-time, token-by-token AI responses backed by document context
- Multi-Document Support — Upload and chat with multiple PDFs, each maintained as a separate conversation thread
- Grounded Answers — The assistant only answers from retrieved document context and says so when the answer isn't in the document, rather than inventing information

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Authentication | Clerk |
| Database | Neon (Serverless Postgres) |
| ORM | Drizzle ORM |
| File Storage | AWS S3 |
| Vector Database | Pinecone |
| Embeddings | Google Gemini (`gemini-embedding-001`) via `@google/genai` |
| Chat / LLM | Google Gemini (`gemini-3.5-flash`) via the Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/react`) |
| PDF Parsing | `pdf-parse-fork` |
| Text Chunking | LangChain (`langchain`, `@langchain/core`, `@langchain/community`) |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |

## Key Dependencies

```text
@ai-sdk/google
@ai-sdk/react
@aws-sdk/client-s3
@clerk/nextjs
@google/genai
@langchain/community
@langchain/core
@neondatabase/serverless
@pinecone-database/pinecone
ai
aws-sdk
drizzle-orm
langchain
md5
pdf-parse-fork
react-dropzone
react-hot-toast
```
## How It Works

1. Upload — A user drops a PDF, which is uploaded to S3.
2. Ingestion — The document is downloaded, parsed to plain text, and split into overlapping chunks (approximately 1000 characters each) using LangChain's text splitter.
3. Embedding — Each chunk is converted into a vector embedding using Gemini's embedding model.
4. Indexing — Embeddings are upserted into a dedicated Pinecone namespace, scoped to that specific document.
5. Chat — When a user asks a question, the question itself is embedded and used to query Pinecone for the most semantically similar chunks from the document.
6. Generation — The retrieved chunks are injected into the LLM's system prompt as context, and the model streams back an answer grounded in that content.

```text
PDF Upload -> S3 -> Parse -> Chunk -> Embed (Gemini) -> Store (Pinecone)
                                                              |
User Question -> Embed (Gemini) -> Vector Search (Pinecone) -> Context
                                                              |
                                        LLM (Gemini) -> Streamed Answer
```

## Getting Started[README.md](https://github.com/user-attachments/files/30566235/README.md)

### Prerequisites

- Node.js 18+
- A Neon Postgres database
- A Clerk account and application
- An AWS S3 bucket
- A Pinecone index (dimension 1024, no integrated embedding model, vectors are supplied directly)
- A Google AI Studio API key

### Installation

```bash
git clone https://github.com/edbucio24/document-saas-agent.git
cd your-repo
npm install --legacy-peer-deps
```

Note: `--legacy-peer-deps` is required due to an upstream peer dependency conflict between `@langchain/community` (which expects `@browserbasehq/stagehand`, and transitively an older `dotenv` version) and this project's own `dotenv` version. This does not affect runtime behavior.

### Environment Variables

Create a `.env` file in the project root:

```
DATABASE_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=

PINECONE_API_KEY=
PINECONE_INDEX_NAME=

GEMINI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

Note: two Gemini-related keys are required because this project uses two separate Google SDKs (`@google/genai` for embeddings and `@ai-sdk/google` for chat generation), each of which reads a different default environment variable name. Use the same key value for both.

### Database Setup

Push the Drizzle schema to your database:

```bash
npx drizzle-kit push
```

### Run Locally

```
npm run dev
```

Visit http://localhost:3000.

## Project Structure

```
app/
  api/
    chat/            Streaming chat endpoint (retrieval and generation)
    create-chat/     Creates a new chat session after upload
    s3-upload/       Handles file upload to S3
  chat/[chatId]/      Chat interface for a specific document
  page.tsx            Landing page and upload entry point
components/
  ChatComponent.tsx    Chat UI, message list, input
  ChatSideBar.tsx      Document and chat navigation
  FileUpload.tsx       Drag-and-drop upload widget
lib/
  db/
    embeddings.ts      Gemini embedding generation
    pinecone.ts        PDF ingestion pipeline: chunk, embed, upsert
    s3.ts              S3 upload and download helpers
    schema.ts          Drizzle schema (chats, messages)
  context.ts           Vector search and context retrieval for chat
  utils.ts             Shared utilities
```


## License

MIT
