import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ============================================================
// USERS TABLE (auth)
// ============================================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// TOPICS TABLE — 15 health topics
// ============================================================
export const topics = mysqlTable("topics", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  species: mysqlEnum("species", ["cat", "dog", "both"]).default("both").notNull(),
  iconCode: varchar("iconCode", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = typeof topics.$inferInsert;

// ============================================================
// BREEDS TABLE
// ============================================================
export const breeds = mysqlTable("breeds", {
  id: int("id").autoincrement().primaryKey(),
  species: mysqlEnum("species", ["cat", "dog"]).notNull(),
  breedName: varchar("breedName", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  overview: text("overview"),
  commonIssues: json("commonIssues").$type<string[]>(),
  nutritionFocus: json("nutritionFocus").$type<string[]>(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Breed = typeof breeds.$inferSelect;
export type InsertBreed = typeof breeds.$inferInsert;

// ============================================================
// PAPERS TABLE — core literature records
// ============================================================
export const papers = mysqlTable("papers", {
  id: int("id").autoincrement().primaryKey(),

  // Basic metadata
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  year: int("year").notNull(),
  journal: varchar("journal", { length: 256 }),
  doi: varchar("doi", { length: 256 }),
  url: varchar("url", { length: 512 }),
  abstract: text("abstract"),

  // Classification
  species: mysqlEnum("species", ["cat", "dog", "both", "other"]).notNull(),
  lifeStage: mysqlEnum("lifeStage", ["junior", "adult", "senior", "all"]).default("all").notNull(),
  studyType: mysqlEnum("studyType", [
    "review",
    "rct",
    "observational",
    "in_vitro",
    "meta_analysis",
    "case_study",
    "cohort",
    "other",
  ]).notNull(),
  evidenceLevel: mysqlEnum("evidenceLevel", ["high", "medium", "low"]).default("medium").notNull(),
  breedRelevance: varchar("breedRelevance", { length: 256 }),
  keywords: json("keywords").$type<string[]>(),

  // Multilingual fields
  abstractZh: text("abstract_zh"),
  summaryZh: text("summary_zh"),
  consumerSummaryZh: text("consumer_summary_zh"),

  // Ingredient intelligence
  ingredients: json("ingredients").$type<string[]>(),
  ingredientMappings: json("ingredient_mappings").$type<Array<{
    ingredient: string;
    health_relevance: string;
    support_type: string;
    evidence_note: string;
    caution: string | null;
  }>>(),

  // Infographic data
  infographicType: varchar("infographic_type", { length: 64 }),
  infographicData: json("infographic_data"),

  // AI-generated content
  coreSummary: text("coreSummary"),
  keyFindings: json("keyFindings").$type<string[]>(),
  practicalRelevance: text("practicalRelevance"),
  limitations: text("limitations"),
  harvardReference: text("harvardReference"),

  // Admin workflow
  status: mysqlEnum("status", ["pending", "approved", "rejected", "published"]).default("pending").notNull(),
  featured: boolean("featured").default(false).notNull(),
  aiGenerated: boolean("aiGenerated").default(false).notNull(),
  reviewNotes: text("reviewNotes"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Paper = typeof papers.$inferSelect;
export type InsertPaper = typeof papers.$inferInsert;

// ============================================================
// PAPER_TOPICS — junction table
// ============================================================
export const paperTopics = mysqlTable("paper_topics", {
  id: int("id").autoincrement().primaryKey(),
  paperId: int("paperId").notNull(),
  topicId: int("topicId").notNull(),
});

export type PaperTopic = typeof paperTopics.$inferSelect;

// ============================================================
// PAPER_BREEDS — junction table
// ============================================================
export const paperBreeds = mysqlTable("paper_breeds", {
  id: int("id").autoincrement().primaryKey(),
  paperId: int("paperId").notNull(),
  breedId: int("breedId").notNull(),
  relevanceScore: float("relevanceScore").default(1.0),
});

export type PaperBreed = typeof paperBreeds.$inferSelect;

// ============================================================
// CONTENT_ANGLES — brand content opportunities per paper
// ============================================================
export const contentAngles = mysqlTable("content_angles", {
  id: int("id").autoincrement().primaryKey(),
  paperId: int("paperId").notNull(),
  formatType: mysqlEnum("formatType", [
    "xiaohongshu",
    "ecommerce_detail",
    "faq",
    "video_script",
    "infographic",
    "brand_education",
    "social_post",
    "scientific_brief",
  ]).notNull(),
  titleIdea: varchar("titleIdea", { length: 512 }),
  consumerSummary: text("consumerSummary"),
  professionalSummary: text("professionalSummary"),
  riskNote: text("riskNote"),
  targetAudience: varchar("targetAudience", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentAngle = typeof contentAngles.$inferSelect;
export type InsertContentAngle = typeof contentAngles.$inferInsert;

// ============================================================
// UPDATE_LOGS — monthly import records
// ============================================================
export const updateLogs = mysqlTable("update_logs", {
  id: int("id").autoincrement().primaryKey(),
  runDate: timestamp("runDate").defaultNow().notNull(),
  source: varchar("source", { length: 128 }).notNull(),
  totalFound: int("totalFound").default(0).notNull(),
  totalImported: int("totalImported").default(0).notNull(),
  totalFlagged: int("totalFlagged").default(0).notNull(),
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("completed").notNull(),
  notes: text("notes"),
  triggeredBy: varchar("triggeredBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UpdateLog = typeof updateLogs.$inferSelect;
export type InsertUpdateLog = typeof updateLogs.$inferInsert;

// ============================================================
// GUIDELINES TABLE — AAHA/WSAVA clinical guidelines
// ============================================================
export const guidelines = mysqlTable("guidelines", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  organization: mysqlEnum("organization", ["AAHA", "WSAVA", "other"]).notNull(),
  year: int("year").notNull(),
  category: mysqlEnum("category", [
    "nutrition",
    "dental",
    "senior_care",
    "weight_management",
    "kidney",
    "liver",
    "cardiac",
    "dermatology",
    "oncology",
    "reproduction",
    "general_health",
  ]).default("general_health").notNull(),
  species: mysqlEnum("species", ["cat", "dog", "both"]).default("both").notNull(),
  lifeStage: mysqlEnum("life_stage", ["junior", "adult", "senior", "all"]).default("all").notNull(),
  summary: text("summary"),
  summaryZh: text("summary_zh"),
  keyRecommendations: json("key_recommendations").$type<Array<{
    recommendation: string;
    rationale: string;
    strength: string;
    applicable_to: string;
  }>>(),
  relatedHealthTopics: json("related_health_topics").$type<string[]>(),
  referenceUrl: varchar("reference_url", { length: 512 }),
  harvardReference: text("harvard_reference"),
  status: mysqlEnum("status", ["pending", "published", "archived"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Guideline = typeof guidelines.$inferSelect;
export type InsertGuideline = typeof guidelines.$inferInsert;
