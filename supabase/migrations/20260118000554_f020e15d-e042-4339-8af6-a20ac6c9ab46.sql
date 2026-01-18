-- Habilitar extensões necessárias para CRON
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar CRON para verificar bloqueios diariamente às 6h da manhã (horário UTC)
SELECT cron.schedule(
  'check-instance-blocks-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://kgtqnjhmwsvswhrczqaf.supabase.co/functions/v1/check-instance-blocks',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtndHFuamhtd3N2c3docmN6cWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MDA0OTAsImV4cCI6MjA4NDE3NjQ5MH0.douqXINkw8kUqyWksIIgxEUKBb4YuTw933mLwzSiwvk"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);