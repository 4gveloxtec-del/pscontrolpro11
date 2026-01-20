-- Tabela para rastrear contatos do chatbot do admin
CREATE TABLE IF NOT EXISTS public.admin_chatbot_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL UNIQUE,
  name text,
  current_node_key text DEFAULT 'inicial',
  last_response_at timestamp with time zone,
  last_interaction_at timestamp with time zone,
  interaction_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_chatbot_contacts ENABLE ROW LEVEL SECURITY;

-- Policy for service role (webhook uses service key)
CREATE POLICY "Service role full access on admin_chatbot_contacts"
ON public.admin_chatbot_contacts
FOR ALL
USING (true)
WITH CHECK (true);

-- Tabela para log de interações do admin chatbot
CREATE TABLE IF NOT EXISTS public.admin_chatbot_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  incoming_message text,
  response_sent text,
  node_key text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_chatbot_interactions ENABLE ROW LEVEL SECURITY;

-- Policy for service role
CREATE POLICY "Service role full access on admin_chatbot_interactions"
ON public.admin_chatbot_interactions
FOR ALL
USING (true)
WITH CHECK (true);

-- Triggers para updated_at
CREATE TRIGGER update_admin_chatbot_contacts_updated_at
  BEFORE UPDATE ON public.admin_chatbot_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();