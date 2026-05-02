-- ═══════════════════════════════════════════════════════════════
-- BALANCE MIGRATION — Switch from seller-stake to balance + insurance pool model
-- ═══════════════════════════════════════════════════════════════
-- Safe to run multiple times (uses IF NOT EXISTS guards).
-- Does NOT drop existing columns — keeps stake_balance/stake fields
-- as legacy/unused so existing data is preserved.

-- 1. Add balance to every user profile -------------------------------------
alter table profiles
  add column if not exists available_balance numeric default 0 not null,
  add column if not exists pending_balance numeric default 0 not null;

-- 2. Track insurance opt-in per purchase ----------------------------------
alter table purchases
  add column if not exists insured boolean default false not null,
  add column if not exists insurance_premium numeric default 0 not null;

-- 3. Ledger — every balance change writes a row ---------------------------
create table if not exists ledger_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text not null check (type in (
    'deposit', 'withdrawal',
    'pick_purchase', 'pick_refund', 'seller_payout',
    'insurance_premium', 'insurance_payout',
    'platform_take', 'pool_topup', 'admin_adjust'
  )),
  amount numeric not null,
  balance_after numeric,
  related_pick_id uuid references picks(id) on delete set null,
  related_purchase_id uuid references purchases(id) on delete set null,
  pool text,
  note text,
  created_at timestamptz default now() not null
);

create index if not exists idx_ledger_user on ledger_entries(user_id, created_at desc);
create index if not exists idx_ledger_pick on ledger_entries(related_pick_id);

alter table ledger_entries enable row level security;
drop policy if exists "Users can view own ledger" on ledger_entries;
create policy "Users can view own ledger" on ledger_entries
  for select using (auth.uid() = user_id);

-- 4. Platform-owned pools (escrow + insurance + take) ---------------------
create table if not exists platform_pools (
  pool text primary key,
  balance numeric default 0 not null,
  updated_at timestamptz default now() not null
);

insert into platform_pools (pool, balance) values
  ('escrow', 0),
  ('insurance', 0),
  ('platform_take', 0)
on conflict (pool) do nothing;

-- platform_pools is admin-only; no RLS policies for users.
alter table platform_pools enable row level security;

-- 5. Helper RPC: atomic balance move --------------------------------------
-- Server-side function to safely move money between user balances + pools
-- without race conditions. Called from API routes via service role.
create or replace function move_balance(
  p_user_id uuid,
  p_field text,         -- 'available_balance' | 'pending_balance'
  p_delta numeric
) returns numeric language plpgsql security definer as $$
declare
  v_new_balance numeric;
begin
  if p_field = 'available_balance' then
    update profiles
      set available_balance = available_balance + p_delta
      where id = p_user_id
      returning available_balance into v_new_balance;
  elsif p_field = 'pending_balance' then
    update profiles
      set pending_balance = pending_balance + p_delta
      where id = p_user_id
      returning pending_balance into v_new_balance;
  else
    raise exception 'invalid balance field %', p_field;
  end if;

  return v_new_balance;
end;
$$;

create or replace function move_pool(
  p_pool text,
  p_delta numeric
) returns numeric language plpgsql security definer as $$
declare
  v_new_balance numeric;
begin
  update platform_pools
    set balance = balance + p_delta,
        updated_at = now()
    where pool = p_pool
    returning balance into v_new_balance;
  return v_new_balance;
end;
$$;
