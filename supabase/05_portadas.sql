-- Portadas públicas del catálogo. Solo una cuenta ADMIN puede subir imágenes.
-- No modifica el bucket privado videos ni sus permisos.
begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('portadas','portadas',true,5242880,array['image/jpeg','image/png'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.cabana_is_catalog_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from cabana.accounts where id=(select auth.uid()) and role='ADMIN'); $$;
revoke all on function public.cabana_is_catalog_admin() from public,anon,authenticated;
grant execute on function public.cabana_is_catalog_admin() to authenticated;

drop policy if exists cabana_admin_upload_portadas on storage.objects;
create policy cabana_admin_upload_portadas on storage.objects for insert to authenticated
with check (
  bucket_id='portadas'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and lower(storage.extension(name)) in ('jpg','png')
  and (select public.cabana_is_catalog_admin())
);
commit;
