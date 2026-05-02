-- ═══════════════════════════════════════════════════════════════
-- DROP LEGACY STAKE FIELDS
-- ═══════════════════════════════════════════════════════════════
-- Removes the seller-stake mechanic entirely. Run AFTER migration_balance.sql.

-- Make picks.stake nullable so new picks don't require it
alter table picks alter column stake drop not null;
alter table picks alter column stake set default 0;

-- Drop seller_profiles.stake_balance — replaced by profiles.available_balance
alter table seller_profiles drop column if exists stake_balance;
