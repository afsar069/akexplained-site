-- Migration: add avatar_id to public.reviews.
--
-- WHY (owner, 2026-11-11): students pick a ready-made avatar (no photo upload, no storage). The
-- chosen avatar id ('a1'..'a10', see assets/avatars.js) is snapshotted onto the review at submit so
-- the home page can show it next to the review. null = the default picture.
--
-- The avatar choice itself lives on the profile (public.profiles.avatar_id, already present); this
-- column is the copy stored with the review so the public home read needs no access to profiles.
--
-- Idempotent: safe to run twice. One transaction.

begin;

alter table public.reviews
  add column if not exists avatar_id text
  constraint reviews_avatar_id_shape check (avatar_id is null or avatar_id ~ '^a[0-9]{1,2}$');

comment on column public.reviews.avatar_id is
  'Which ready-made avatar the student picked (a1..a10), snapshotted at submit; null = default picture.';

commit;

-- Check (run after):
--   select column_name from information_schema.columns
--     where table_schema='public' and table_name='reviews' and column_name='avatar_id';  -- one row
