-- ============================================================
-- Migration 0003: Platform Upgrade
-- Adds multilingual, ingredient intelligence, infographic fields
-- to papers table, and creates new guidelines table.
-- ============================================================

-- 1. Update papers table: add multilingual fields
ALTER TABLE `papers`
  ADD COLUMN IF NOT EXISTS `abstract_zh` TEXT NULL AFTER `abstract`,
  ADD COLUMN IF NOT EXISTS `summary_zh` TEXT NULL AFTER `coreSummary`,
  ADD COLUMN IF NOT EXISTS `consumer_summary_zh` TEXT NULL AFTER `summary_zh`;

-- 2. Update papers table: add ingredient intelligence fields
ALTER TABLE `papers`
  ADD COLUMN IF NOT EXISTS `ingredients` JSON NULL AFTER `consumer_summary_zh`,
  ADD COLUMN IF NOT EXISTS `ingredient_mappings` JSON NULL AFTER `ingredients`;

-- 3. Update papers table: add infographic fields
ALTER TABLE `papers`
  ADD COLUMN IF NOT EXISTS `infographic_type` VARCHAR(64) NULL AFTER `ingredient_mappings`,
  ADD COLUMN IF NOT EXISTS `infographic_data` JSON NULL AFTER `infographic_type`;

-- 4. Create guidelines table
CREATE TABLE IF NOT EXISTS `guidelines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` TEXT NOT NULL,
  `organization` ENUM('AAHA', 'WSAVA', 'other') NOT NULL DEFAULT 'other',
  `year` INT NOT NULL,
  `category` VARCHAR(128) NOT NULL,
  `species` ENUM('cat', 'dog', 'both') NOT NULL DEFAULT 'both',
  `life_stage` ENUM('junior', 'adult', 'senior', 'all') NOT NULL DEFAULT 'all',
  `summary` TEXT NULL,
  `summary_zh` TEXT NULL,
  `key_recommendations` JSON NULL,
  `related_health_topics` JSON NULL,
  `reference_url` VARCHAR(512) NULL,
  `harvard_reference` TEXT NULL,
  `status` ENUM('pending', 'published') NOT NULL DEFAULT 'pending',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
