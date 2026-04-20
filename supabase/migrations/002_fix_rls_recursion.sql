-- Fix infinite recursion in RLS policies caused by self-referencing mk_users admin check.
-- The admin subquery inside mk_users policies triggers mk_users RLS again → stack overflow.
-- Solution: security definer function that bypasses RLS when checking admin status.

create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.mk_users
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- mk_users: replace recursive admin policy
drop policy if exists "mk_users: admin all" on public.mk_users;
create policy "mk_users: admin all"
  on public.mk_users for all
  using (public.is_admin());

-- briefs: replace recursive admin check
drop policy if exists "briefs: mk own" on public.briefs;
create policy "briefs: mk own"
  on public.briefs for all
  using (author_id = auth.uid() or public.is_admin());

-- brief_media: replace recursive admin check
drop policy if exists "brief_media: via brief" on public.brief_media;
create policy "brief_media: via brief"
  on public.brief_media for all
  using (
    exists (
      select 1 from public.briefs b
      where b.id = brief_id
        and (b.author_id = auth.uid() or public.is_admin())
    )
  );
