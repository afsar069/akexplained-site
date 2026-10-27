-- Migration: make topics a self-referencing tree.
--
-- Runs AFTER the topics table exists (migration 20261025120000_*). topics is
-- still empty, so dropping a column and adding a NOT NULL column is safe.
--
-- Why:
--   Topics form a tree: area > period > movement / writer > work, etc.
--   Mastery is computed at a parent level and rolled up from children, so the
--   depth matters. age_slug is replaced by a real parent link.
--
-- Wrapped in a transaction: all of it applies, or none of it does.

begin;

-- Drop the flat age link; the tree replaces it.
alter table public.topics drop column age_slug;

-- Parent in the tree. Null for a top-level area. Self-referencing FK.
alter table public.topics add column parent_id text references public.topics (id);

-- What kind of node this is.
alter table public.topics add column kind text not null check (
  kind in ('area', 'period', 'movement', 'writer', 'work', 'concept')
);

-- Children are looked up by parent, so index it.
create index topics_parent_id_idx on public.topics (parent_id);

comment on column public.topics.parent_id is
  'Parent topic; null for a top-level area. Self-referencing tree.';
comment on column public.topics.kind is
  'Node kind: area, period, movement, writer, work, or concept.';

commit;
