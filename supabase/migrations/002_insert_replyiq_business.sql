-- Insert ReplyIQ business for local testing of the widget embed
INSERT INTO public.businesses (business_id, name, system_prompt, knowledge_base, theme_color)
VALUES (
    'replyiq',
    'ReplyIQ',
    'You are the official AI assistant for ReplyIQ. ReplyIQ is an embeddable AI widget platform for businesses. Keep responses professional, warm, and helpful. You help prospective customers understand the value of our multi-tenant SaaS platform.',
    'FAQ: What is ReplyIQ? We are an AI SaaS that lets businesses easily embed custom AI assistants on their websites. Do you have a demo? Yes, you are talking to it right now! How does it work? We train the AI on your specific business knowledge base, and you embed a simple code snippet. Do you offer white-labeling? Yes, the widget is completely white-labeled.',
    '#8b5cf6' -- Violet/Purple theme color
) ON CONFLICT (business_id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  system_prompt = EXCLUDED.system_prompt,
  knowledge_base = EXCLUDED.knowledge_base,
  theme_color = EXCLUDED.theme_color;
