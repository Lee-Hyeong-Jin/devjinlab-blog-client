-- ============================================================================
-- Tables
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content_md text not null default '',
  cover_image_url text,
  category_id uuid references public.categories (id) on delete set null,
  author_id uuid not null references auth.users (id) default auth.uid (),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- parent_id self-reference is what allows unbounded-depth nested replies
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- ============================================================================
-- Indexes
-- ============================================================================

create index posts_status_published_at_idx on public.posts (status, published_at desc);
create index posts_category_id_idx on public.posts (category_id);
create index post_tags_tag_id_idx on public.post_tags (tag_id);
create index comments_post_id_parent_id_idx on public.comments (post_id, parent_id);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Populate a public profile row (for comment author display) whenever a new
-- auth.users row is created, from whatever provider metadata is available.
create function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function public.handle_new_user ();

-- Keep updated_at current on posts/comments without relying on every caller
-- to set it manually.
create function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at before update on public.posts for each row
execute function public.set_updated_at ();

create trigger comments_set_updated_at before update on public.comments for each row
execute function public.set_updated_at ();

-- Clear the body text the moment a comment is soft-deleted, so the content
-- doesn't linger queryable once deleted_at is set (comments stay selectable
-- by everyone for thread-structure purposes — see comments_select below —
-- so redacting here, rather than relying on callers to clear body, is what
-- actually keeps "deleted" content from leaking).
create function public.redact_deleted_comment ()
returns trigger
language plpgsql
as $$
begin
  if new.deleted_at is not null and old.deleted_at is null then
    new.body := '';
  end if;
  return new;
end;
$$;

create trigger comments_redact_on_delete before update on public.comments for each row
execute function public.redact_deleted_comment ();

-- ============================================================================
-- Admin check
-- ============================================================================

-- Single-author blog: admin identity is a fixed email, not a role table.
-- The email claim in auth.jwt() is signed by Supabase and can't be forged
-- by the client, so this is equally secure to a UID lookup at this scale.
create function public.is_admin ()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt () ->> 'email', '')) = 'hyeongjin326@gmail.com';
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;
alter table public.comments enable row level security;

-- RLS policies only ever narrow rows within an operation the role already
-- has a base grant for — anon/authenticated get no table privileges by
-- default, so those grants have to be issued explicitly here too.
grant select on public.categories, public.tags, public.posts, public.post_tags, public.profiles, public.comments to anon,
authenticated;

grant insert,
update,
delete on public.categories, public.tags, public.posts, public.post_tags to authenticated;

grant insert,
update on public.comments to authenticated;

grant
update on public.profiles to authenticated;

-- categories: public read, admin write
create policy "categories_select_public" on public.categories for select using (true);

create policy "categories_admin_write" on public.categories for all using (is_admin ())
with
  check (is_admin ());

-- tags: public read, admin write
create policy "tags_select_public" on public.tags for select using (true);

create policy "tags_admin_write" on public.tags for all using (is_admin ())
with
  check (is_admin ());

-- posts: published visible to everyone, drafts visible to admin only
create policy "posts_select_published_or_admin" on public.posts for select using (
  status = 'published'
  or is_admin ()
);

create policy "posts_admin_insert" on public.posts for insert
with
  check (is_admin ());

create policy "posts_admin_update" on public.posts
for update
  using (is_admin ())
with
  check (is_admin ());

create policy "posts_admin_delete" on public.posts for delete using (is_admin ());

-- post_tags: mirrors post visibility, admin-only write
create policy "post_tags_select" on public.post_tags for select using (
  is_admin ()
  or exists (
    select 1
    from public.posts p
    where
      p.id = post_tags.post_id
      and p.status = 'published'
  )
);

create policy "post_tags_admin_write" on public.post_tags for all using (is_admin ())
with
  check (is_admin ());

-- profiles: public read (needed to show commenter name/avatar), self-update only
create policy "profiles_select_public" on public.profiles for select using (true);

create policy "profiles_self_update" on public.profiles
for update
  using (auth.uid () = id)
with
  check (auth.uid () = id);

-- comments: rows stay publicly selectable even after a soft-delete, so the
-- thread structure (parent_id chains) stays intact for every reader, not
-- just the author/admin — the app renders a "[deleted]" placeholder from
-- deleted_at instead of hiding the row. redact_deleted_comment() (above)
-- is what actually keeps the old body text from leaking once deleted.
--
-- Note: this also has to be publicly readable rather than gated on
-- is_admin(), because Postgres additionally enforces a row's SELECT policy
-- against the *new* row on UPDATE — an is_admin()-gated select policy would
-- make it impossible for a non-admin author to ever soft-delete their own
-- comment (the resulting deleted_at <> null row would fail its own
-- visibility check). See migration history / PR discussion for the RLS
-- test that caught this.
--
-- No delete policy is defined on purpose — deletion is always the
-- deleted_at soft-delete path so reply subtrees never get orphaned.
create policy "comments_select" on public.comments for select using (true);

create policy "comments_insert_authenticated" on public.comments for insert
with
  check (
    auth.uid () = author_id
    and exists (
      select 1
      from public.posts p
      where
        p.id = post_id
        and p.status = 'published'
    )
  );

create policy "comments_update_own_or_admin" on public.comments
for update
  using (
    auth.uid () = author_id
    or is_admin ()
  )
with
  check (
    auth.uid () = author_id
    or is_admin ()
  );

-- ============================================================================
-- Storage: post-images bucket for Toast UI Editor image uploads
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true);

create policy "post_images_select_public" on storage.objects for select using (bucket_id = 'post-images');

create policy "post_images_admin_insert" on storage.objects for insert
with
  check (
    bucket_id = 'post-images'
    and is_admin ()
  );

create policy "post_images_admin_update" on storage.objects
for update
  using (
    bucket_id = 'post-images'
    and is_admin ()
  )
with
  check (
    bucket_id = 'post-images'
    and is_admin ()
  );

create policy "post_images_admin_delete" on storage.objects for delete using (
  bucket_id = 'post-images'
  and is_admin ()
);
