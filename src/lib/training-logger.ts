import { supabaseAdmin, supabase as publicSupabase } from './supabase';
import { after } from 'next/server';

interface LogMessageParams {
  businessId: string;
  channel: 'widget' | 'standalone' | 'whatsapp';
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
  isConsented?: boolean;
  rawContext?: any;
  createdAt?: string;
}

/**
 * Basic and naive language detection to support metadata enrichment.
 */
function detectLanguage(text: string): string {
  const lowercase = text.toLowerCase();
  // Simple check for Nigerian languages commonly used in chat
  if (lowercase.includes('bawo') || lowercase.includes('koni') || lowercase.includes('o da bo')) return 'yo';
  if (lowercase.includes('sannu') || lowercase.includes('lafiya') || lowercase.includes('na gode')) return 'ha';
  if (lowercase.includes('ndewo') || lowercase.includes('kachifo')) return 'ig';
  // Common English words
  if (lowercase.includes('the ') || lowercase.includes('hello') || lowercase.includes(' how ') || lowercase.includes('please')) return 'en';
  return 'en';
}

/**
 * Log a message to the training_logs table asynchronously and non-blockingly.
 * Fails silently if there is any error.
 */
export function logMessageToTrainingData(params: LogMessageParams) {
  const client = supabaseAdmin || publicSupabase;
  if (!client) {
    console.warn('Supabase client is not available for training logs.');
    return;
  }

  const runInsert = async () => {
    const language = detectLanguage(params.content);
    const finalMetadata = {
      language,
      message_length: params.content.length,
      ...params.metadata,
    };

    const { error } = await client.from('training_logs').insert({
      business_id: params.businessId,
      channel: params.channel,
      session_id: params.sessionId,
      role: params.role,
      content: params.content,
      metadata: finalMetadata,
      is_consented: params.isConsented ?? true,
      raw_context: params.rawContext || [],
      created_at: params.createdAt || new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to save training log:', error.message);
    }
  };

  try {
    // unstable_after allows executing logic after Next.js finishes sending the response
    after(async () => {
      try {
        await runInsert();
      } catch (err) {
        console.error('Error executing background training log insert:', err);
      }
    });
  } catch {
    // Fallback to plain asynchronous execution if unstable_after is not available
    runInsert().catch((err) => {
      console.error('Error executing fallback training log insert:', err);
    });
  }
}
