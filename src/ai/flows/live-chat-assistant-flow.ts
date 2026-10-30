
'use server';
/**
 * @fileOverview An AI customer assistant flow that handles multi-turn conversations using Cloudflare Workers AI.
 *
 * - liveChatAssistant - A function that initiates the AI chat interaction.
 * - ChatHistoryInput - The input type for the liveChatAssistant function, representing conversation history.
 * - ChatResponseOutput - The return type for the liveChatAssistant function, containing the AI's response.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { supabase } from '@/lib/supabase';
import { logMessageToTrainingData } from '@/lib/training-logger';

const ChatHistoryInputSchema = z.array(
  z.object({
    role: z.enum(['user', 'model']).describe('The role of the message sender (user or model).'),
    content: z.string().describe('The text content of the message.'),
  })
).describe('An array representing the conversation history, including user and AI messages.');

export type ChatHistoryInput = z.infer<typeof ChatHistoryInputSchema>;

const WidgetChatInputSchema = z.object({
  businessId: z.string().optional().describe('The ID of the business.'),
  history: ChatHistoryInputSchema.optional(),
  channel: z.enum(['widget', 'standalone', 'whatsapp']).optional().describe('The channel source.'),
  sessionId: z.string().optional().describe('The session or conversation ID.'),
});

export type WidgetChatInput = z.infer<typeof WidgetChatInputSchema>;

const ChatResponseOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s generated response.'),
});

export type ChatResponseOutput = z.infer<typeof ChatResponseOutputSchema>;

export async function liveChatAssistant(input: WidgetChatInput): Promise<ChatResponseOutput> {
  return liveChatAssistantFlow(input);
}

const liveChatAssistantFlow = ai.defineFlow(
  {
    name: 'liveChatAssistantFlow',
    inputSchema: WidgetChatInputSchema,
    outputSchema: ChatResponseOutputSchema,
  },
  async (input: WidgetChatInput) => {
    const { businessId, history, channel = 'widget', sessionId = 'unknown' } = input;
    const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

    if (!ACCOUNT_ID || !API_TOKEN || ACCOUNT_ID === 'your_account_id_here') {
      return { 
        response: "Cloudflare credentials are not configured. Please add your ACCOUNT_ID and API_TOKEN to the .env file to enable chatting." 
      };
    }

    let dynamicSystemContent = "You are ARIA, a professional and friendly AI customer assistant for a business. You help customers with questions about products, services, hours, and policies. Keep responses concise (2–4 sentences), warm, and professional. If you don't know something specific, offer to connect them with a human agent.";

    if (businessId && supabase) {
      const { data: business } = await supabase
        .from('businesses')
        .select('name, system_prompt, knowledge_base, whatsapp_number, support_email')
        .eq('business_id', businessId)
        .single();
        
      if (business) {
        let contactInstruction = "offer to connect them with a human agent or ask for their contact details.";
        
        if (business.whatsapp_number || business.support_email) {
          contactInstruction = "provide them with the following clickable links to reach our human team directly:\n";
          if (business.whatsapp_number) {
            const waNumber = business.whatsapp_number.replace(/\D/g, ''); // strip non-numeric characters
            contactInstruction += `- WhatsApp: https://wa.me/${waNumber}\n`;
          }
          if (business.support_email) {
            contactInstruction += `- Email: mailto:${business.support_email}\n`;
          }
        }

        dynamicSystemContent = `You are a strict but polite AI assistant representing ${business.name}.
${business.system_prompt}

CRITICAL INSTRUCTIONS:
1. You MUST answer questions based ONLY on the "Business Knowledge Base" provided below.
2. DO NOT invent, guess, or assume any information. This includes pricing, services, hours, and policies.
3. If the user asks about something (like pricing) that is NOT explicitly stated in the knowledge base, you MUST politely state that you do not have that information and ${contactInstruction}
4. Keep your responses concise (2-4 sentences max) and do not over-explain. Do not list things they didn't ask for.

Business Knowledge Base:
${business.knowledge_base || 'No additional context provided.'}`;
      }
    }

    const systemMessage = {
      role: 'system',
      content: dynamicSystemContent,
    };

    // Map Genkit/Gemini roles ('user', 'model') to Cloudflare/Llama roles ('user', 'assistant')
    const messages = [
      systemMessage,
      ...((history || []) as ChatHistoryInput).map((msg) => ({
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.content,
      })),
    ];

    try {
      const startTime = Date.now();
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct-fast`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        console.error('Cloudflare AI API Error:', data.errors);
        return { response: "I'm having some trouble processing that right now. Could you try again in a moment?" };
      }

      // Cloudflare Workers AI for Llama 3.1 returns the result in { result: { response: "..." } }
      const aiResponse = data.result.response;

      if (!aiResponse) {
        return { response: "I processed your request but couldn't generate a text response. Please try again." };
      }

      const duration = Date.now() - startTime;

      // Log to training_logs table in a non-blocking/silent manner
      if (businessId) {
        const userMessageContent = history && history.length > 0
          ? history[history.length - 1].content
          : '';

        const now = Date.now();
        const userCreatedAt = new Date(now - 100).toISOString();
        const assistantCreatedAt = new Date(now).toISOString();

        if (userMessageContent) {
          // Log User message
          logMessageToTrainingData({
            businessId,
            channel: channel || 'widget',
            sessionId: sessionId || 'unknown',
            role: 'user',
            content: userMessageContent,
            metadata: {},
            rawContext: history || [],
            createdAt: userCreatedAt,
          });
        }

        // Log Assistant message
        logMessageToTrainingData({
          businessId,
          channel: channel || 'widget',
          sessionId: sessionId || 'unknown',
          role: 'assistant',
          content: aiResponse,
          metadata: { response_time_ms: duration },
          rawContext: [
            ...(history || []),
            { role: 'model', content: aiResponse }
          ],
          createdAt: assistantCreatedAt,
        });
      }

      return { response: aiResponse };
    } catch (error) {
      console.error('Cloudflare Fetch Error:', error);
      return { response: "I'm sorry, I'm having trouble connecting to my services. Please check your internet connection or try again later." };
    }
  }
);
