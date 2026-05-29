-- ============================================================================
-- Web analytics events (tracking de navegacion con consentimiento)
-- Ejecutar en Supabase SQL Editor sobre el proyecto de Alcohn.
-- ============================================================================

create table if not exists public.web_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (char_length(event_name) <= 80),
  page_path text not null check (char_length(page_path) <= 300),
  page_url text null,
  referrer text null,
  utm_source text null,
  utm_medium text null,
  utm_campaign text null,
  utm_term text null,
  utm_content text null,
  visitor_id text null,
  session_id text null,
  metadata jsonb not null default '{}'::jsonb,
  ip text null,
  user_agent text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_web_analytics_events_created_at
  on public.web_analytics_events (created_at desc);

create index if not exists idx_web_analytics_events_event_name
  on public.web_analytics_events (event_name);

create index if not exists idx_web_analytics_events_visitor_id
  on public.web_analytics_events (visitor_id)
  where visitor_id is not null;

create index if not exists idx_web_analytics_events_session_id
  on public.web_analytics_events (session_id)
  where session_id is not null;

create index if not exists idx_web_analytics_events_utm_campaign
  on public.web_analytics_events (utm_campaign)
  where utm_campaign is not null;

comment on table public.web_analytics_events is
  'Eventos de navegacion web con UTMs y metadatos de conversion.';
