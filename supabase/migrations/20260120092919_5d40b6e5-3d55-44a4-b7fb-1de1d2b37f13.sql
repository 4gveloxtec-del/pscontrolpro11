-- Create table for reseller device apps (download apps for clients)
CREATE TABLE public.reseller_device_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📱',
  company_name TEXT,
  -- Device compatibility (stored as JSON array for multiple selection)
  device_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- App source type
  app_source TEXT NOT NULL DEFAULT 'direct' CHECK (app_source IN ('play_store', 'app_store', 'direct')),
  -- Download/store URL
  download_url TEXT,
  -- Server association (optional - for server-specific apps)
  server_id UUID REFERENCES public.servers(id) ON DELETE SET NULL,
  -- Is this a "Gerencia App" type?
  is_gerencia_app BOOLEAN NOT NULL DEFAULT false,
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_reseller_device_apps_seller_id ON public.reseller_device_apps(seller_id);
CREATE INDEX idx_reseller_device_apps_server_id ON public.reseller_device_apps(server_id);
CREATE INDEX idx_reseller_device_apps_is_active ON public.reseller_device_apps(is_active);

-- Enable RLS
ALTER TABLE public.reseller_device_apps ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Sellers can only see/manage their own apps
CREATE POLICY "Sellers can view their own device apps"
ON public.reseller_device_apps FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own device apps"
ON public.reseller_device_apps FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own device apps"
ON public.reseller_device_apps FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own device apps"
ON public.reseller_device_apps FOR DELETE
USING (auth.uid() = seller_id);

-- Add trigger for updated_at
CREATE TRIGGER update_reseller_device_apps_updated_at
BEFORE UPDATE ON public.reseller_device_apps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table to associate apps with clients
CREATE TABLE public.client_device_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  app_id UUID NOT NULL REFERENCES public.reseller_device_apps(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_client_device_apps_client_id ON public.client_device_apps(client_id);
CREATE INDEX idx_client_device_apps_seller_id ON public.client_device_apps(seller_id);
CREATE INDEX idx_client_device_apps_app_id ON public.client_device_apps(app_id);

-- Enable RLS
ALTER TABLE public.client_device_apps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sellers can view their own client apps"
ON public.client_device_apps FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own client apps"
ON public.client_device_apps FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own client apps"
ON public.client_device_apps FOR DELETE
USING (auth.uid() = seller_id);