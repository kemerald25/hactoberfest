-- Template for adding a new business to the database
-- Replace the empty strings and placeholders with actual business data

INSERT INTO public.businesses (
    business_id, 
    name, 
    system_prompt, 
    knowledge_base, 
    theme_color,
    whatsapp_number,
    support_email
) VALUES (
    '', -- [REQUIRED] business_id (Unique identifier, e.g., 'acme-corp')
    '', -- [REQUIRED] name (Business display name, e.g., 'Acme Corporation')
    '', -- [REQUIRED] system_prompt (Instructions for the AI persona and behavior)
    '', -- [OPTIONAL] knowledge_base (Business data, FAQs, context)
    '', -- [OPTIONAL] theme_color (Hex code for widget styling, e.g., '#38BDF8')
    '', -- [OPTIONAL] whatsapp_number (e.g., '+1234567890')
    ''  -- [OPTIONAL] support_email (e.g., 'support@acme.com')
) ON CONFLICT (business_id) DO UPDATE SET
    name = EXCLUDED.name,
    system_prompt = EXCLUDED.system_prompt,
    knowledge_base = EXCLUDED.knowledge_base,
    theme_color = EXCLUDED.theme_color,
    whatsapp_number = EXCLUDED.whatsapp_number,
    support_email = EXCLUDED.support_email;
