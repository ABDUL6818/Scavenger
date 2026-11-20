-- Migration 004 (down): drops the slow-query indexes added in 004_slow_query_indexes_up.sql (#1702)

DROP INDEX IF EXISTS idx_participants_registered_at;
DROP INDEX IF EXISTS idx_waste_transfers_transferred_at;
DROP INDEX IF EXISTS idx_wastes_registered_at;
DROP INDEX IF EXISTS idx_wastes_type_active;
DROP INDEX IF EXISTS idx_wastes_waste_type;
DROP INDEX IF EXISTS idx_wastes_is_confirmed;
