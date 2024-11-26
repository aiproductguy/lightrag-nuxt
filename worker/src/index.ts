/// <reference types="@cloudflare/workers-types" />
// The following code is intended to integrate the BAAI bge-base-en-v1.5 model for generating text embeddings.
// This model outputs embeddings with 768 dimensions and has a maximum input token limit of 512 tokens per text input.
// The Vectorize class is used to create an instance of the model, which is then used to generate embeddings for a given text.

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleStats } from './routes/stats';
import { handleUploadDocument, handleDeleteDocument } from './routes/documents';
import { handleSearch } from './routes/search';
import { handleChat } from './routes/chat';

export interface Bindings {
  AI: any;
  CACHE: KVNamespace;
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  DOCUMENTS: KVNamespace;
  [key: string]: unknown;
}

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('/*', cors());

// API Endpoints
app.post('/api/documents', handleUploadDocument);  // Document upload endpoint
app.delete('/api/documents/:id', handleDeleteDocument);  // Document delete endpoint
app.post('/api/query', handleSearch);           // Vector query endpoint
app.get('/api/stats', handleStats);             // Stats endpoint
app.post('/api/chat', handleChat);              // Chat endpoint with LLM

export default app; 