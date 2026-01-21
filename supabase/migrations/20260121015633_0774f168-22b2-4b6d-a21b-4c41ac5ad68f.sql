-- Tabela para variáveis personalizadas do chatbot de cada revendedor
CREATE TABLE IF NOT EXISTS public.seller_chatbot_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    variable_key TEXT NOT NULL,
    variable_value TEXT NOT NULL DEFAULT '',
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(seller_id, variable_key)
);

-- Enable RLS
ALTER TABLE public.seller_chatbot_variables ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Sellers can view their own variables"
    ON public.seller_chatbot_variables FOR SELECT
    USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own variables"
    ON public.seller_chatbot_variables FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own variables"
    ON public.seller_chatbot_variables FOR UPDATE
    USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own variables"
    ON public.seller_chatbot_variables FOR DELETE
    USING (auth.uid() = seller_id AND is_system = false);

-- Trigger for updated_at
CREATE TRIGGER update_seller_chatbot_variables_updated_at
    BEFORE UPDATE ON public.seller_chatbot_variables
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar variáveis padrão para novo revendedor
CREATE OR REPLACE FUNCTION public.create_default_chatbot_variables(p_seller_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.seller_chatbot_variables (seller_id, variable_key, variable_value, description, is_system)
    VALUES 
        (p_seller_id, 'empresa', '', 'Nome da sua empresa/revenda', true),
        (p_seller_id, 'pix', '', 'Chave PIX para pagamentos', true),
        (p_seller_id, 'whatsapp', '', 'Número de WhatsApp de contato', true),
        (p_seller_id, 'horario', '08:00 às 22:00', 'Horário de atendimento', true),
        (p_seller_id, 'suporte', '', 'Link ou contato de suporte', false),
        (p_seller_id, 'site', '', 'URL do seu site', false),
        (p_seller_id, 'instagram', '', 'Usuário do Instagram', false),
        (p_seller_id, 'telegram', '', 'Link ou usuário do Telegram', false)
    ON CONFLICT (seller_id, variable_key) DO NOTHING;
END;
$$;

-- Tabela para configuração do menu interativo do revendedor (similar ao admin_chatbot_config)
CREATE TABLE IF NOT EXISTS public.seller_chatbot_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    node_key TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_key TEXT,
    options JSONB DEFAULT '[]'::jsonb,
    response_type TEXT DEFAULT 'menu',
    icon TEXT DEFAULT '📋',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(seller_id, node_key)
);

-- Enable RLS
ALTER TABLE public.seller_chatbot_menu ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Sellers can view their own menu"
    ON public.seller_chatbot_menu FOR SELECT
    USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own menu"
    ON public.seller_chatbot_menu FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own menu"
    ON public.seller_chatbot_menu FOR UPDATE
    USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own menu"
    ON public.seller_chatbot_menu FOR DELETE
    USING (auth.uid() = seller_id);

-- Trigger for updated_at
CREATE TRIGGER update_seller_chatbot_menu_updated_at
    BEFORE UPDATE ON public.seller_chatbot_menu
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela para contatos do chatbot do revendedor com estado de navegação
CREATE TABLE IF NOT EXISTS public.seller_chatbot_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    name TEXT,
    current_node_key TEXT DEFAULT 'inicial',
    last_response_at TIMESTAMPTZ,
    last_interaction_at TIMESTAMPTZ,
    interaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(seller_id, phone)
);

-- Enable RLS
ALTER TABLE public.seller_chatbot_contacts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Sellers can view their own contacts"
    ON public.seller_chatbot_contacts FOR SELECT
    USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own contacts"
    ON public.seller_chatbot_contacts FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own contacts"
    ON public.seller_chatbot_contacts FOR UPDATE
    USING (auth.uid() = seller_id);

-- Trigger for updated_at
CREATE TRIGGER update_seller_chatbot_contacts_updated_at
    BEFORE UPDATE ON public.seller_chatbot_contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela para palavras-chave do revendedor
CREATE TABLE IF NOT EXISTS public.seller_chatbot_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    response_text TEXT NOT NULL,
    image_url TEXT,
    is_exact_match BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(seller_id, keyword)
);

-- Enable RLS
ALTER TABLE public.seller_chatbot_keywords ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Sellers can view their own keywords"
    ON public.seller_chatbot_keywords FOR SELECT
    USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own keywords"
    ON public.seller_chatbot_keywords FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own keywords"
    ON public.seller_chatbot_keywords FOR UPDATE
    USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own keywords"
    ON public.seller_chatbot_keywords FOR DELETE
    USING (auth.uid() = seller_id);

-- Trigger for updated_at
CREATE TRIGGER update_seller_chatbot_keywords_updated_at
    BEFORE UPDATE ON public.seller_chatbot_keywords
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela para configurações do menu interativo do revendedor
CREATE TABLE IF NOT EXISTS public.seller_chatbot_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    menu_enabled BOOLEAN DEFAULT false,
    response_mode TEXT DEFAULT '12h',
    delay_min INTEGER DEFAULT 2,
    delay_max INTEGER DEFAULT 5,
    typing_enabled BOOLEAN DEFAULT true,
    silent_mode BOOLEAN DEFAULT true,
    use_admin_menu BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_chatbot_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Sellers can view their own settings"
    ON public.seller_chatbot_settings FOR SELECT
    USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own settings"
    ON public.seller_chatbot_settings FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own settings"
    ON public.seller_chatbot_settings FOR UPDATE
    USING (auth.uid() = seller_id);

-- Trigger for updated_at
CREATE TRIGGER update_seller_chatbot_settings_updated_at
    BEFORE UPDATE ON public.seller_chatbot_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();