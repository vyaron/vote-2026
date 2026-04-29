-- Add source_meta JSONB column to briefs for feed-sourced briefs
alter table public.briefs
  add column if not exists source_meta jsonb default null;

-- Allow 'news_brief' as a valid template value
alter table public.briefs
  drop constraint if exists briefs_template_check;

alter table public.briefs
  add constraint briefs_template_check
    check (template in ('statement', 'media-rich', 'news_brief'));
