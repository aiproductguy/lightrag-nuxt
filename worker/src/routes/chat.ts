/// <reference types="@cloudflare/workers-types" />

import type { Context } from 'hono';
import type { Bindings } from '../index';
import { AI_MODELS } from '../../../config/ai-models';

interface ChatRequest {
  message: string;
  settings: {
    embeddingModel: string;
    chatModel?: string;
    processingPath: 'cloud' | 'local';
  };
}

export async function handleChat(c: Context<{ Bindings: Bindings }>) {
  try {
    const { message, settings } = await c.req.json<ChatRequest>();
    const { AI, VECTORIZE, DB } = c.env;

    // Get the chat model to use - default to Llama 3.1 8B
    const chatModel = settings.chatModel || AI_MODELS.chat.default;

    // Skip processing for local path
    if (settings.processingPath === 'local') {
      return c.json({ 
        response: "Local processing is not supported for chat. Please switch to cloud processing.",
        model: chatModel
      });
    }

    // First, get relevant context using vector search
    const embeddings = await AI.run(settings.embeddingModel || AI_MODELS.embedding.default, { text: [message] });
    const vectorResults = await VECTORIZE.query(embeddings.data[0], {
      topK: 3,
      filter: { path: settings.processingPath }
    });

    // Get document details for context
    const documentIds = [...new Set(vectorResults.matches.map(match => match.id.split(':')[0]))];
    const documents = await DB.prepare(`
      SELECT id, title, path, processing_details
      FROM documents
      WHERE id IN (${documentIds.map(() => '?').join(',')})
    `).bind(...documentIds).all();

    // Format context for LLM
    const context = vectorResults.matches
      .map(match => match.metadata?.text || '')
      .filter(Boolean)
      .join('\n\n');

    // Generate LLM response using context
    const prompt = `Based on the following context, please answer the question. If the answer cannot be found in the context, say so.

Context:
${context}

Question: ${message}

Answer:`;

    const response = await AI.run(chatModel, {
      messages: [{ role: 'user', content: prompt }]
    });

    // Log the chat interaction
    await DB.prepare(`
      INSERT INTO activity_log (action, details, timestamp)
      VALUES (?, ?, datetime('now'))
    `).bind('chat', `Chat query: ${message} (${settings.processingPath} path)`).run();

    return c.json({ 
      response: response.response,
      model: chatModel
    });

  } catch (error) {
    console.error('Chat error:', error);
    return c.json({ error: 'Failed to process chat message' }, 500);
  }
} 