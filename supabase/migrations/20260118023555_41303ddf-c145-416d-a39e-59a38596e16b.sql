-- Add column for additional servers (beyond the primary server)
-- This will store an array of server objects with encrypted credentials
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS additional_servers JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.clients.additional_servers IS 'Array of additional servers: [{server_id, server_name, login, password}]';