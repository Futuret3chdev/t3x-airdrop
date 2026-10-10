create table if not exists x_proofs (
  code text primary key,
  handle text not null,
  created_at timestamptz not null default now()
);
