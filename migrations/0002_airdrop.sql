create table if not exists wallets (
  user_id text primary key,
  handle text,
  x_id text,
  balance integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists wallets_handle_idx on wallets (lower(handle)) where handle is not null;
create unique index if not exists wallets_x_id_idx on wallets (x_id) where x_id is not null;

create table if not exists drops (
  id serial primary key,
  user_id text not null,
  week_key text not null,
  tweet_id text not null unique,
  coins integer not null,
  claimed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists drops_user_week_idx on drops (user_id, week_key);
