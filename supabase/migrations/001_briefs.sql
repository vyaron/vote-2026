-- mk_users: links Supabase auth users to MK JSON ids
create table public.mk_users (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  mk_id      int  not null unique,
  party_id   int,
  role       text not null default 'mk' check (role in ('mk', 'admin')),
  created_at timestamptz not null default now()
);

-- briefs
create table public.briefs (
  id           uuid primary key default gen_random_uuid(),
  mk_id        int  not null references public.mk_users(mk_id) on delete cascade,
  author_id    uuid not null references auth.users(id) on delete cascade,
  template     text not null check (template in ('statement', 'media-rich')),
  status       text not null default 'draft' check (status in ('draft', 'published', 'deleted')),
  title        text not null,
  subtitle     text,
  body         text,
  header_image text,
  video_url    text,
  tags         text[] not null default '{}',
  publish_at   timestamptz,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- brief_media
create table public.brief_media (
  id         uuid primary key default gen_random_uuid(),
  brief_id   uuid not null references public.briefs(id) on delete cascade,
  url        text not null,
  alt        text,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger briefs_updated_at
  before update on public.briefs
  for each row execute function public.set_updated_at();

-- Indexes
create index briefs_mk_id_status on public.briefs(mk_id, status);
create index briefs_publish_at   on public.briefs(publish_at) where status = 'published';

-- RLS
alter table public.mk_users  enable row level security;
alter table public.briefs     enable row level security;
alter table public.brief_media enable row level security;

-- mk_users: MKs can read their own row; admins can read all
create policy "mk_users: self read"
  on public.mk_users for select
  using (user_id = auth.uid());

create policy "mk_users: admin all"
  on public.mk_users for all
  using (exists (
    select 1 from public.mk_users mu
    where mu.user_id = auth.uid() and mu.role = 'admin'
  ));

-- briefs: MKs manage their own; admins manage all
create policy "briefs: mk own"
  on public.briefs for all
  using (
    author_id = auth.uid()
    or exists (
      select 1 from public.mk_users mu
      where mu.user_id = auth.uid() and mu.role = 'admin'
    )
  );

-- briefs: public can read published, non-deleted briefs
create policy "briefs: public read published"
  on public.briefs for select
  using (status = 'published' and deleted_at is null);

-- brief_media follows its brief's permissions
create policy "brief_media: via brief"
  on public.brief_media for all
  using (
    exists (
      select 1 from public.briefs b
      where b.id = brief_id
        and (
          b.author_id = auth.uid()
          or exists (
            select 1 from public.mk_users mu
            where mu.user_id = auth.uid() and mu.role = 'admin'
          )
        )
    )
  );

create policy "brief_media: public read published"
  on public.brief_media for select
  using (
    exists (
      select 1 from public.briefs b
      where b.id = brief_id and b.status = 'published' and b.deleted_at is null
    )
  );
