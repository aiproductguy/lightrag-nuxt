/// <reference types="@cloudflare/workers-types" />

import type { Context } from 'hono';
import type { Bindings } from '../index';

interface SearchRequest {
  query: string;
  path?: 'all' | 'cloud' | 'local';
}

interface Document {
  id: string;
  title: string;
  path: string;
  processing_details: string;
}

interface VectorMatch {
  id: string;
  score: number;
  metadata?: {
    text: string;
  };
}

interface VectorSearchResult {
  matches: VectorMatch[];
}

interface D1Result<T> {
  results: T[];
  success: boolean;
  error?: string;
}

export async function handleSearch(c: Context<{ Bindings: Bindings }>) {
  try {
    const { query, path = 'all' } = await c.req.json<SearchRequest>();
    const { AI, VECTORIZE, DB, CACHE } = c.env;

    // Validate query
    if (!query?.trim()) {
      return c.json({ error: 'Query is required' }, 400);
    }

    // Check cache first
    const cacheKey = `search:${path}:${query}`;
    const cachedResults = await CACHE.get(cacheKey);
    if (cachedResults) {
      await CACHE.put('cache_hits', ((parseInt(await CACHE.get('cache_hits') || '0')) + 1).toString());
      return c.json({ results: JSON.parse(cachedResults) });
    }
    await CACHE.put('cache_misses', ((parseInt(await CACHE.get('cache_misses') || '0')) + 1).toString());

    // Generate embeddings for the query
    const embeddings = await AI.run('@cf/baai/bge-base-en-v1.5', { text: [query] });
    
    // Search for similar vectors
    const vectorResults = await VECTORIZE.query(embeddings.data[0], {
      topK: 5,
      ...(path !== 'all' && { filter: { path } })
    }) as VectorSearchResult;

    if (!vectorResults.matches.length) {
      return c.json({ results: [] });
    }

    // Get document details
    const documentIds = [...new Set(vectorResults.matches.map(match => match.id.split(':')[0]))];
    const documents = await DB.prepare(`
      SELECT id, title, path, processing_details
      FROM documents
      WHERE id IN (${documentIds.map(() => '?').join(',')})
    `).bind(...documentIds).all() as D1Result<Document>;

    if (!documents.success || !documents.results.length) {
      return c.json({ results: [] });
    }

    // Format results
    const results = vectorResults.matches.map(match => {
      const [docId] = match.id.split(':');
      const document = documents.results.find(d => d.id === docId);
      
      if (!document || !match.metadata?.text) {
        return null;
      }

      let processingDetails: Record<string, unknown>;
      try {
        processingDetails = JSON.parse(document.processing_details);
      } catch {
        processingDetails = {};
      }

      return {
        score: match.score,
        document: {
          id: docId,
          title: document.title,
          path: document.path,
          processingDetails
        },
        chunk: match.metadata.text
      };
    }).filter((result): result is NonNullable<typeof result> => result !== null);

    // Cache results for 1 hour
    await CACHE.put(cacheKey, JSON.stringify(results), { expirationTtl: 3600 });

    // Log the query
    await DB.prepare(`
      INSERT INTO query_stats (query, hits, last_used, path)
      VALUES (?, 1, datetime('now'), ?)
      ON CONFLICT(query) DO UPDATE SET
      hits = hits + 1,
      last_used = datetime('now')
    `).bind(query, path).run();

    return c.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return c.json({ error: 'Failed to perform search' }, 500);
  }
} 