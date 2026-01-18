-- Add downloader_code column to server_apps table
ALTER TABLE public.server_apps
ADD COLUMN IF NOT EXISTS downloader_code TEXT DEFAULT NULL;

COMMENT ON COLUMN public.server_apps.downloader_code IS 'Código para download via app Downloader (cada servidor tem o seu próprio)';