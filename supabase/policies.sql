-- Review and run this file in the Supabase SQL editor.
-- This file assumes public.urls has: id, user_id, original_url, short_url, custom_url.
-- Do not run until existing duplicate short_url/custom_url values have been checked.

alter table public.urls enable row level security;
alter table public.clicks enable row level security;

drop policy if exists "urls_select_own" on public.urls;
create policy "urls_select_own"
on public.urls for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "urls_insert_own" on public.urls;
create policy "urls_insert_own"
on public.urls for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "urls_update_own" on public.urls;
create policy "urls_update_own"
on public.urls for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "urls_delete_own" on public.urls;
create policy "urls_delete_own"
on public.urls for delete
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "clicks_insert_anyone" on public.clicks;
create policy "clicks_insert_anyone"
on public.clicks for insert
to anon, authenticated
with check (true);

drop policy if exists "clicks_select_url_owner" on public.clicks;
create policy "clicks_select_url_owner"
on public.clicks for select
to authenticated
using (
  exists (
    select 1
    from public.urls
    where public.urls.id = clicks.url_id
      and public.urls.user_id = (select auth.uid())
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.urls'::regclass
      and conname = 'urls_short_url_key'
  ) then
    alter table public.urls
      add constraint urls_short_url_key unique (short_url);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.urls'::regclass
      and conname = 'urls_custom_url_key'
  ) then
    alter table public.urls
      add constraint urls_custom_url_key unique (custom_url);
  end if;
end
$$;

create index if not exists urls_short_url_idx on public.urls (short_url);
create index if not exists urls_custom_url_idx on public.urls (custom_url);
create index if not exists urls_user_id_idx on public.urls (user_id);
create index if not exists clicks_url_id_idx on public.clicks (url_id);

-- The current client still queries urls directly in getLongUrl. Replace that
-- client query with supabase.rpc('get_long_url', { lookup_code: id }) before
-- relying on the public redirect flow with the owner-only urls policy above.
create or replace function public.get_long_url(lookup_code text)
returns table (id uuid, original_url text)
language sql
security definer
set search_path = public
as $$
  select urls.id, urls.original_url
  from public.urls
  where urls.short_url = lookup_code
     or urls.custom_url = lookup_code
  limit 1
$$;

revoke all on function public.get_long_url(text) from public;
grant execute on function public.get_long_url(text) to anon, authenticated;

-- Public QR/profile reads are supported by the application URLs.
drop policy if exists "qrs_public_read" on storage.objects;
create policy "qrs_public_read"
on storage.objects for select
to public
using (bucket_id = 'qrs');

drop policy if exists "profile_pic_public_read" on storage.objects;
create policy "profile_pic_public_read"
on storage.objects for select
to public
using (bucket_id = 'profile_pic');

drop policy if exists "qrs_authenticated_insert" on storage.objects;
create policy "qrs_authenticated_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'qrs');

drop policy if exists "profile_pic_authenticated_insert" on storage.objects;
create policy "profile_pic_authenticated_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'profile_pic');

drop policy if exists "qrs_owner_delete" on storage.objects;
create policy "qrs_owner_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'qrs' and owner_id = (select auth.uid()::text));

drop policy if exists "profile_pic_owner_delete" on storage.objects;
create policy "profile_pic_owner_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'profile_pic' and owner_id = (select auth.uid()::text));

-- IMPORTANT:
-- signup currently uploads profile_pic before Supabase Auth creates a session.
-- The authenticated-only profile_pic insert policy will therefore reject that
-- upload. Move the upload after signup or use a server-side upload flow before
-- enabling this policy.
