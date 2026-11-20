-- Migration 004 (up): indexes for slow queries (#1702)
-- Adds the indexes that the query optimizer lists but no migration created.
-- Indexes that duplicate an existing index on the same columns are not repeated.

CREATE INDEX IF NOT EXISTS idx_wastes_is_confirmed ON wastes (is_confirmed);
CREATE INDEX IF NOT EXISTS idx_wastes_waste_type ON wastes (waste_type);
CREATE INDEX IF NOT EXISTS idx_wastes_type_active ON wastes (waste_type, is_active);
CREATE INDEX IF NOT EXISTS idx_wastes_registered_at ON wastes (registered_at DESC);
CREATE INDEX IF NOT EXISTS idx_waste_transfers_transferred_at ON waste_transfers (transferred_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_registered_at ON participants (registered_at DESC);
