alter table wallets add column if not exists address text;

create unique index if not exists wallets_address_idx on wallets (lower(address)) where address is not null;
