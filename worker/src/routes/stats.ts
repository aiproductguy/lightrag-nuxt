/// <reference types="@cloudflare/workers-types" />

import type { Context } from 'hono';
import type { Bindings } from '../index';

interface D1Result<T> {
  results: T[];
  success: boolean;
  error?: string;
}

interface DocumentStats {
  total_documents: number;
  total_chunks: number;
}

interface PathStats {
  path: 'cloud' | 'local';
  count: number;
}

interface TypeStats {
  type: string;
  count: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

interface ActivityLog {
  action: 'upload' | 'delete' | 'search';
  details: string;
  timestamp: string;
}

interface CacheStats {
  hitRate: string;
  totalCached: number;
}

interface DocumentDetails {
  id: string;
  title: string;
  timestamp: string;
  type: string;
  chunks: number;
  path: string;
}

export async function handleStats(c: Context<{ Bindings: Bindings }>) {
  try {
    const { DB, CACHE } = c.env;

    // Get document details
    const documentDetails = await DB.prepare(`
      SELECT 
        id,
        title,
        type,
        chunks,
        uploaded_at as timestamp,
        path,
        processing_details
      FROM documents
      ORDER BY uploaded_at DESC
    `).all() as D1Result<DocumentDetails>;

    if (!documentDetails.success) {
      throw new Error(documentDetails.error || 'Failed to fetch document details');
    }

    // Get document stats
    const docStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_documents, 
        SUM(chunks) as total_chunks
      FROM documents
    `).all() as D1Result<DocumentStats>;

    if (!docStats.success) {
      throw new Error(docStats.error || 'Failed to fetch document stats');
    }

    // Get path distribution
    const pathStats = await DB.prepare(`
      SELECT path, COUNT(*) as count
      FROM documents
      GROUP BY path
    `).all() as D1Result<PathStats>;

    if (!pathStats.success) {
      throw new Error(pathStats.error || 'Failed to fetch path stats');
    }

    // Get document type distribution
    const typeStats = await DB.prepare(`
      SELECT type, COUNT(*) as count
      FROM documents
      GROUP BY type
    `).all() as D1Result<TypeStats>;

    if (!typeStats.success) {
      throw new Error(typeStats.error || 'Failed to fetch type stats');
    }

    // Get recent activity
    const recentActivity = await DB.prepare(`
      SELECT action, details, timestamp
      FROM activity_log
      ORDER BY timestamp DESC
      LIMIT 10
    `).all() as D1Result<ActivityLog>;

    if (!recentActivity.success) {
      throw new Error(recentActivity.error || 'Failed to fetch activity log');
    }

    // Calculate cache stats
    const cacheStats = await calculateCacheHitRate(CACHE);

    // Prepare chart data for path distribution
    const pathChartData: ChartData = {
      labels: pathStats.results.map(r => r.path),
      datasets: [{
        label: 'Documents by Path',
        data: pathStats.results.map(r => r.count),
        backgroundColor: ['rgba(59, 130, 246, 0.5)', 'rgba(16, 185, 129, 0.5)'],
        borderColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)'],
        borderWidth: 1
      }]
    };

    // Prepare chart data for document types
    const typeChartData: ChartData = {
      labels: typeStats.results.map(r => r.type),
      datasets: [{
        label: 'Documents by Type',
        data: typeStats.results.map(r => r.count),
        backgroundColor: typeStats.results.map((_, i) => 
          `hsla(${(i * 137.5) % 360}, 70%, 50%, 0.5)`
        ),
        borderColor: typeStats.results.map((_, i) => 
          `hsl(${(i * 137.5) % 360}, 70%, 50%)`
        ),
        borderWidth: 1
      }]
    };

    return c.json({
      totalDocuments: docStats.results[0]?.total_documents || 0,
      totalChunks: docStats.results[0]?.total_chunks || 0,
      pathDistribution: Object.fromEntries(
        pathStats.results.map(r => [r.path, r.count])
      ),
      documentTypes: Object.fromEntries(
        typeStats.results.map(r => [r.type, r.count])
      ),
      charts: {
        pathDistribution: pathChartData,
        documentTypes: typeChartData
      },
      recentActivity: recentActivity.results,
      cacheStats,
      documents: documentDetails.results.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        chunks: doc.chunks,
        timestamp: doc.timestamp,
        path: doc.path
      }))
    });
  } catch (error) {
    console.error('Stats error:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
}

async function calculateCacheHitRate(CACHE: KVNamespace): Promise<CacheStats> {
  const hits = await CACHE.get('cache_hits') || '0';
  const misses = await CACHE.get('cache_misses') || '0';
  const total = parseInt(hits) + parseInt(misses);
  
  return {
    hitRate: total > 0 ? ((parseInt(hits) / total) * 100).toFixed(2) : "0.00",
    totalCached: parseInt(hits)
  };
} 