-- Add CHECK constraint to prevent negative inventory quantities at the database level.
-- This provides a safety net beyond application-level validation, protecting against
-- race conditions that could cause inventory to go negative under concurrent access.
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_quantity_non_negative" CHECK ("quantity" >= 0);
