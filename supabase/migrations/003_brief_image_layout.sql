-- Persist header image layout controls for statement briefs
alter table public.briefs
  add column header_image_fit text not null default 'cover'
    check (header_image_fit in ('cover', 'contain')),
  add column header_image_position_x int not null default 50
    check (header_image_position_x between 0 and 100),
  add column header_image_position_y int not null default 50
    check (header_image_position_y between 0 and 100);
