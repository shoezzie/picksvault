-- Users are managed by Supabase Auth, but we extend with a profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  role text default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  avatar_letter text,
  stripe_customer_id text,
  stripe_account_id text,
  created_at timestamptz default now()
);

create table seller_profiles (
  id uuid references profiles(id) on delete cascade primary key,
  stake_balance numeric default 0,
  hit_rate numeric default 0,
  roi numeric default 0,
  total_picks integer default 0,
  units_won numeric default 0,
  verified boolean default false,
  verified_at timestamptz,
  badge text default 'New seller',
  sport_specialty text,
  probation_picks integer default 0,
  followers_count integer default 0,
  created_at timestamptz default now()
);

create table picks (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references profiles(id) on delete cascade not null,
  sport text not null,
  sport_key text not null,
  tag text not null,
  game text not null,
  venue text,
  lock_time timestamptz not null,
  price numeric not null,
  stake numeric not null,
  tier text default 'insured' check (tier in ('insured', 'verified')),
  description text,
  reasoning text,
  odds_range text,
  best_book text,
  recommended_stake text,
  signals text[] default '{}',
  confidence integer default 1 check (confidence between 1 and 3),
  status text default 'active' check (status in ('active', 'locked', 'graded', 'void', 'postponed')),
  result text,
  actual_outcome text,
  buyers_count integer default 0,
  created_at timestamptz default now(),
  graded_at timestamptz
);

create table purchases (
  id uuid default gen_random_uuid() primary key,
  pick_id uuid references picks(id) on delete cascade not null,
  buyer_id uuid references profiles(id) on delete cascade not null,
  amount_paid numeric not null,
  refund_amount numeric,
  status text default 'pending' check (status in ('pending', 'won', 'lost', 'refunded', 'void')),
  stripe_payment_intent_id text,
  stripe_refund_id text,
  created_at timestamptz default now(),
  settled_at timestamptz
);

create table bookmarks (
  user_id uuid references profiles(id) on delete cascade not null,
  pick_id uuid references picks(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, pick_id)
);

create table follows (
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- RLS Policies
alter table profiles enable row level security;
alter table seller_profiles enable row level security;
alter table picks enable row level security;
alter table purchases enable row level security;
alter table bookmarks enable row level security;
alter table follows enable row level security;

create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Seller profiles viewable by everyone" on seller_profiles for select using (true);
create policy "Sellers can update own profile" on seller_profiles for update using (auth.uid() = id);
create policy "Sellers can insert own profile" on seller_profiles for insert with check (auth.uid() = id);

create policy "Picks are viewable by everyone" on picks for select using (true);
create policy "Sellers can insert picks" on picks for insert with check (auth.uid() = seller_id);
create policy "Sellers can update own picks" on picks for update using (auth.uid() = seller_id);

create policy "Users can view own purchases" on purchases for select using (auth.uid() = buyer_id);
create policy "Users can insert own purchases" on purchases for insert with check (auth.uid() = buyer_id);

create policy "Users can manage own bookmarks" on bookmarks for all using (auth.uid() = user_id);
create policy "Bookmarks viewable by owner" on bookmarks for select using (auth.uid() = user_id);

create policy "Follows viewable by everyone" on follows for select using (true);
create policy "Users can manage own follows" on follows for all using (auth.uid() = follower_id);
