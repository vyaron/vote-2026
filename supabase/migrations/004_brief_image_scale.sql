-- Add/update container-height control for statement header images
-- Value is the container height as a % of its width (padding-bottom trick).
-- 33 ≈ 3:1 landscape (default), 50 = 2:1, 100 = square.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'briefs'
      and column_name = 'header_image_scale'
  ) then
    alter table public.briefs
      add column header_image_scale int not null default 33;
  end if;
end$$;

-- Drop old check constraint if it exists, then add the correct one
alter table public.briefs
  drop constraint if exists briefs_header_image_scale_check;

alter table public.briefs
  add constraint briefs_header_image_scale_check
    check (header_image_scale between 20 and 100);

-- Update default value and reset any out-of-range rows from old implementation
alter table public.briefs
  alter column header_image_scale set default 33;

update public.briefs
  set header_image_scale = 33
  where header_image_scale not between 20 and 100;
