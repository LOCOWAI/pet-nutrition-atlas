# Pet Nutrition Research Atlas - TODO

## Phase 1: Global Theme & Setup
- [x] NASA dark theme CSS variables (deep navy/black bg, white text, red accent)
- [x] Google Fonts: Inter + IBM Plex Sans + IBM Plex Mono + Noto Sans SC
- [x] Global layout: top navigation with all 9 nav items
- [x] Responsive navigation with mobile hamburger menu
- [x] App.tsx routes wiring for all pages

## Phase 2: Database Schema (7 Tables)
- [x] papers table (full schema with all fields)
- [x] topics table (15 health topics)
- [x] breeds table (cats + dogs breeds)
- [x] paper_topics junction table
- [x] paper_breeds junction table
- [x] content_angles table
- [x] update_logs table
- [x] Run migration and apply SQL
- [x] Seed data: 15 health topics
- [x] Seed data: 10+ cat breeds + 10+ dog breeds
- [x] Seed data: 10+ sample papers with full fields
- [x] Seed data: content_angles for sample papers

## Phase 3: Backend API
- [x] papers.list (with filters: species, life_stage, topic, breed, study_type, evidence_level, year, search)
- [x] papers.getById (full detail with related topics, breeds, content_angles)
- [x] papers.create (admin)
- [x] papers.updateFields (admin)
- [x] papers.updateStatus (admin: pending/approved/rejected)
- [x] papers.generateAISummary (AI: core summary + key findings + limitations)
- [x] papers.generateHarvardRef (AI: Harvard reference format)
- [x] papers.generateContentAngles (AI: brand content angles)
- [x] topics.list
- [x] topics.getBySlug (with papers)
- [x] breeds.list (with species filter)
- [x] breeds.getBySlug (with related papers)
- [x] contentAngles.list (with format_type filter)
- [x] updateLogs.list
- [x] updateLogs.triggerImport (manual trigger, admin only)

## Phase 4: Frontend Core
- [x] Global TopNav component (NASA style, all 9 nav items)
- [x] Home page: Hero section with search bar
- [x] Home page: Browse by Species (Cats/Dogs cards)
- [x] Home page: Browse by Life Stage (Junior/Adult/Senior)
- [x] Home page: Browse by Health Topic (15 topics grid)
- [x] Home page: Featured Papers section
- [x] Home page: Monthly Updates preview section

## Phase 5: Reference Library & Paper Detail
- [x] Reference Library page: search input + multi-filter sidebar
- [x] Reference Library: filter by species, life_stage, topic, breed, study_type, evidence_level, year
- [x] Reference Library: paper cards grid with key metadata
- [x] Paper Detail page: all fields display
- [x] Paper Detail: Core Summary, Key Findings, Limitations sections
- [x] Paper Detail: Content Angles section
- [x] Paper Detail: Harvard Reference with copy button
- [x] Paper Detail: Related Papers section

## Phase 6: Species, Topics, Breeds, Updates, Content Pages
- [x] Cats page: life stage entry + health scenarios + breed entry + latest papers
- [x] Dogs page: life stage entry + health scenarios + breed entry + latest papers
- [x] Health Topics page: 15 topics grid with descriptions
- [x] Health Topic detail page: overview + related papers
- [x] Breeds page: cats/dogs tabs with breed cards
- [x] Breed detail page: overview + health concerns + related papers
- [x] Monthly Updates page: update logs + new papers this month
- [x] Monthly Updates: manual trigger import button (admin only)
- [x] Content Opportunities page: content_angles aggregated by format_type

## Phase 7: Admin CMS
- [x] Admin route protection (requires login + admin role)
- [x] Admin dashboard: stats overview (total/pending/approved/featured)
- [x] Admin papers list: pending/approved/rejected tabs with search
- [x] Admin paper review: approve/reject/reset actions
- [x] Admin paper edit: coreSummary, evidenceLevel, reviewNotes inline editing
- [x] Admin AI generation: trigger summary/reference/angles generation
- [x] Admin featured toggle

## Phase 8: Tests & Delivery
- [x] Vitest: 27 tests covering auth, papers, topics, breeds, contentAngles, updateLogs
- [x] RBAC tests: UNAUTHORIZED for public, FORBIDDEN for non-admin, success for admin
- [x] Final checkpoint save
