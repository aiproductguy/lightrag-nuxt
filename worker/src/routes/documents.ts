/// <reference types="@cloudflare/workers-types" />

import type { Context } from 'hono';
import type { Bindings } from '../index';

interface Document {
  id: string;
  title: string;
  type: string;
  chunks: number;
  uploadedAt: string;
  path: 'cloud' | 'local';
}

interface D1Result<T> {
  results: T[];
  success: boolean;
  error?: string;
}

interface D1BatchResult {
  success: boolean;
  error?: string;
}

export async function handleGetDocuments(c: Context<{ Bindings: Bindings }>) {
  try {
    const { DB } = c.env;

    const documents = await DB.prepare(`
      SELECT 
        id,
        title,
        type,
        chunks,
        uploaded_at as uploadedAt,
        path
      FROM documents
      ORDER BY uploaded_at DESC
    `).all() as D1Result<Document>;

    if (!documents.success) {
      throw new Error(documents.error || 'Database query failed');
    }

    return c.json(documents.results);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return c.json({ error: 'Failed to fetch documents' }, 500);
  }
}

export async function handleUploadDocument(c: Context<{ Bindings: Bindings }>) {
  try {
    const formData = await c.req.formData();
    const title = formData.get('title');
    const fileData = formData.get('file');
    const path = (formData.get('path') as 'cloud' | 'local') || 'cloud';

    if (!title || !fileData || typeof title !== 'string' || !(fileData instanceof File)) {
      return c.json({ error: 'Missing or invalid required fields' }, 400);
    }

    const content = await fileData.text();
    const type = fileData.name.split('.').pop()?.toLowerCase() || 'txt';
    const docId = crypto.randomUUID();

    // Store document metadata
    const document: Document = {
      id: docId,
      title,
      type,
      chunks: 0, // Will be updated after processing
      uploadedAt: new Date().toISOString(),
      path
    };

    // Store in D1 and add to activity log
    const results = await c.env.DB.batch([
      c.env.DB.prepare(
        'INSERT INTO documents (id, title, type, chunks, uploaded_at, path, processing_details) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(docId, title, type, 0, document.uploadedAt, document.path, JSON.stringify({
        chunker: path === 'cloud' ? 'tiktoken' : 'nltk',
        embedder: path === 'cloud' ? '@cf/baai/bge-base-en-v1.5' : 'nano',
        llm: path === 'cloud' ? '@cf/meta/llama-2-7b-chat-int8' : 'none'
      })),
      c.env.DB.prepare(
        'INSERT INTO activity_log (action, details, timestamp) VALUES (?, ?, ?)'
      ).bind('upload', `Uploaded document: ${title} (${path})`, document.uploadedAt)
    ]) as D1BatchResult[];

    const failed = results.some(result => !result.success);
    if (failed) {
      const errors = results.map(r => r.error).filter(Boolean).join(', ');
      throw new Error(errors || 'Database operation failed');
    }

    return c.json(document);
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Failed to upload document' }, 500);
  }
}

export async function handleDeleteDocument(c: Context<{ Bindings: Bindings }>) {
  try {
    const docId = c.req.param('id');
    
    // Delete from D1 and add to activity log
    const results = await c.env.DB.batch([
      c.env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(docId),
      c.env.DB.prepare(
        'INSERT INTO activity_log (action, details, timestamp) VALUES (?, ?, ?)'
      ).bind('delete', `Deleted document: ${docId}`, new Date().toISOString())
    ]) as D1BatchResult[];

    const failed = results.some(result => !result.success);
    if (failed) {
      const errors = results.map(r => r.error).filter(Boolean).join(', ');
      throw new Error(errors || 'Database operation failed');
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return c.json({ error: 'Failed to delete document' }, 500);
  }
} 