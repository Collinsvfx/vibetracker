-- Create the watchlist table
create table if not exists public.watchlist (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  contract_address text not null,
  symbol text not null,
  name text,
  network text not null,
  initial_price numeric,
  alert_threshold numeric default 5.0,
  chat_id bigint,
  last_alerted_at timestamp with time zone,
  
  -- Prevent duplicate bookmarks for the same chat/user and token
  unique(chat_id, contract_address)
);

-- Enable Row Level Security (RLS)
alter table public.watchlist enable row level security;

-- Create a policy that allows anyone to insert/select for now (since we don't have auth yet)
-- In a real app with Auth, you would restrict this to authenticated users
create policy "Enable read access for all users" on public.watchlist for select using (true);
create policy "Enable insert access for all users" on public.watchlist for insert with check (true);
create policy "Enable delete access for all users" on public.watchlist for delete using (true);
