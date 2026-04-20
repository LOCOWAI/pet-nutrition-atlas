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

## Phase 9: 双语切换 & 紫色主题重设计
- [x] 将 CSS 主色从红色系改为深紫/浅紫科幻双色体系（--accent-primary: 深紫, --accent-secondary: 浅紫）
- [x] 更新 TopNav、PaperCard、所有 nasa-tag/nasa-card 等组件的颜色引用
- [x] 构建 LanguageContext（支持 en/zh 切换，localStorage 持久化）
- [x] 编写完整中英文 UI 翻译字典（涵盖所有页面静态文本）
- [x] 后端 papers.translatePaper 路由：AI 翻译文献 title/coreSummary/keyFindings/practicalRelevance/limitations/harvardReference/contentAngles
- [x] PaperDetail 页面：中文模式下调用翻译 API，展示中文内容（带缓存）
- [x] Library 页面：中文模式下文献卡片标题/摘要显示中文
- [x] Home/SpeciesPage/HealthTopics/Breeds/MonthlyUpdates/ContentOpportunities/Admin 页面接入 i18n
- [x] TopNav 增加 EN/中 语言切换按钮（科幻风格）
- [x] 编写 i18n 与翻译 API 的 Vitest 测试

## Phase 10: 真实数据替换 mock 数据
- [x] 后端 getPapers 强制 status='published' 过滤（所有公开 API）
- [x] 后端 getPapers 确保 species/life_stage/topicId 筛选正确传递
- [x] 前端 Home 页面：Featured Papers / Monthly Updates 改为真实 API 数据
- [x] 前端 Library 页面：移除任何 mock，确保筛选参数正确传递给 API
- [x] 前端 SpeciesPage（Cats/Dogs）：改为真实 API 数据
- [x] 前端 HealthTopics 页面：改为真实 API 数据
- [x] 前端 Breeds 页面：改为真实 API 数据
- [x] 前端 MonthlyUpdates 页面：改为真实 API 数据
- [x] 前端 ContentOpportunities 页面：改为真实 API 数据
- [x] 验证数据库中 status 字段值，确认 published 记录存在（20 条已迁移）

## Phase 11: R&D Assistant 重设计 + Content Opportunities 扩充
- [x] 重设计 R&D Assistant：用户输入 Health Goal → AI 检索文献库 → 推荐 Ingredients + 文献支撑
- [x] 后端新增 formulation.recommendByGoal API（检索 published 文献 → AI 结构化推荐）
- [x] 前端重建 FormulationAssistant 页面（Health Goal 输入框 + 推荐卡片展示）
- [x] 后端新增 contentAngles.bulkGenerate API（基于全量文献库批量生成 Content Angles）
- [x] Content Opportunities 前端支持 12 种格式类型筛选（新增 blog_article/email_campaign/product_claim/vet_education）
- [x] Admin 页面增加“批量生成 Content Angles”按钮（20篇/次）
- [x] 更新 Vitest 测试，40 个测试全部通过
