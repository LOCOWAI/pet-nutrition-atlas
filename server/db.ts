import { and, desc, eq, ilike, inArray, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  breeds,
  contentAngles,
  guidelines,
  InsertUser,
  paperBreeds,
  paperTopics,
  papers,
  topics,
  updateLogs,
  users,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================
// USER HELPERS
// ============================================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// PAPERS HELPERS
// ============================================================
export interface PapersFilter {
  search?: string;
  species?: string;
  lifeStage?: string;
  topicId?: number;
  breedId?: number;
  studyType?: string;
  evidenceLevel?: string;
  yearFrom?: number;
  yearTo?: number;
  status?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export async function getPapers(filter: PapersFilter = {}) {
  const db = await getDb();
  if (!db) return { papers: [], total: 0 };

  const {
    search, species, lifeStage, topicId, breedId,
    studyType, evidenceLevel, yearFrom, yearTo,
    status = "published", featured, limit = 20, offset = 0,
  } = filter;

  const conditions: ReturnType<typeof eq>[] = [];

  if (status) conditions.push(eq(papers.status, status as any));
  if (species) conditions.push(eq(papers.species, species as any));
  if (lifeStage) conditions.push(eq(papers.lifeStage, lifeStage as any));
  if (studyType) conditions.push(eq(papers.studyType, studyType as any));
  if (evidenceLevel) conditions.push(eq(papers.evidenceLevel, evidenceLevel as any));
  if (featured !== undefined) conditions.push(eq(papers.featured, featured));
  if (yearFrom) conditions.push(sql`${papers.year} >= ${yearFrom}` as any);
  if (yearTo) conditions.push(sql`${papers.year} <= ${yearTo}` as any);
  if (search) {
    conditions.push(
      or(
        like(papers.title, `%${search}%`),
        like(papers.authors, `%${search}%`),
        like(papers.journal, `%${search}%`),
        like(papers.coreSummary, `%${search}%`)
      ) as any
    );
  }

  // If filtering by topic or breed, get paper IDs first
  let paperIdFilter: number[] | null = null;
  if (topicId) {
    const rows = await db.select({ paperId: paperTopics.paperId })
      .from(paperTopics).where(eq(paperTopics.topicId, topicId));
    paperIdFilter = rows.map(r => r.paperId);
    if (paperIdFilter.length === 0) return { papers: [], total: 0 };
  }
  if (breedId) {
    const rows = await db.select({ paperId: paperBreeds.paperId })
      .from(paperBreeds).where(eq(paperBreeds.breedId, breedId));
    const breedPaperIds = rows.map(r => r.paperId);
    if (breedPaperIds.length === 0) return { papers: [], total: 0 };
    paperIdFilter = paperIdFilter
      ? paperIdFilter.filter(id => breedPaperIds.includes(id))
      : breedPaperIds;
    if (paperIdFilter.length === 0) return { papers: [], total: 0 };
  }
  if (paperIdFilter) {
    conditions.push(inArray(papers.id, paperIdFilter) as any);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
    db.select().from(papers)
      .where(whereClause)
      .orderBy(desc(papers.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`COUNT(*)` }).from(papers).where(whereClause),
  ]);

  return { papers: rows, total: Number(countRows[0]?.count ?? 0) };
}

export async function getPaperById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const [paperRows, topicRows, breedRows, angleRows] = await Promise.all([
    db.select().from(papers).where(eq(papers.id, id)).limit(1),
    db.select({ topic: topics }).from(paperTopics)
      .innerJoin(topics, eq(paperTopics.topicId, topics.id))
      .where(eq(paperTopics.paperId, id)),
    db.select({ breed: breeds, relevanceScore: paperBreeds.relevanceScore })
      .from(paperBreeds)
      .innerJoin(breeds, eq(paperBreeds.breedId, breeds.id))
      .where(eq(paperBreeds.paperId, id)),
    db.select().from(contentAngles).where(eq(contentAngles.paperId, id)),
  ]);

  if (!paperRows[0]) return null;

  return {
    ...paperRows[0],
    topics: topicRows.map(r => r.topic),
    breeds: breedRows.map(r => ({ ...r.breed, relevanceScore: r.relevanceScore })),
    contentAngles: angleRows,
  };
}

export async function createPaper(data: Omit<typeof papers.$inferInsert, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(papers).values(data as any);
  return (result as any).insertId as number;
}

export async function updatePaper(id: number, data: Partial<typeof papers.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(papers).set(data as any).where(eq(papers.id, id));
}

export async function getRelatedPapers(paperId: number, limit = 4) {
  const db = await getDb();
  if (!db) return [];

  const paper = await db.select().from(papers).where(eq(papers.id, paperId)).limit(1);
  if (!paper[0]) return [];

  const topicIds = await db.select({ topicId: paperTopics.topicId })
    .from(paperTopics).where(eq(paperTopics.paperId, paperId));

  if (topicIds.length === 0) {
    return db.select().from(papers)
      .where(and(eq(papers.status, "published"), sql`${papers.id} != ${paperId}` as any))
      .orderBy(desc(papers.year))
      .limit(limit);
  }

  const relatedPaperIds = await db.select({ paperId: paperTopics.paperId })
    .from(paperTopics)
    .where(and(
      inArray(paperTopics.topicId, topicIds.map(t => t.topicId)),
      sql`${paperTopics.paperId} != ${paperId}` as any
    ));

  const uniqueIds = Array.from(new Set(relatedPaperIds.map(r => r.paperId))).slice(0, limit);
  if (uniqueIds.length === 0) return [];

  return db.select().from(papers)
    .where(and(inArray(papers.id, uniqueIds), eq(papers.status, "published")))
    .orderBy(desc(papers.year));
}

export async function getPaperStats() {
  const db = await getDb();
  if (!db) return { total: 0, cats: 0, dogs: 0, pending: 0, approved: 0, featured: 0 };

  const [rows] = await db.select({
    total: sql<number>`COUNT(*)`,
    cats: sql<number>`SUM(CASE WHEN species = 'cat' THEN 1 ELSE 0 END)`,
    dogs: sql<number>`SUM(CASE WHEN species = 'dog' THEN 1 ELSE 0 END)`,
    pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
    approved: sql<number>`SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END)`,
    featured: sql<number>`SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END)`,
  }).from(papers);

  return {
    total: Number(rows.total),
    cats: Number(rows.cats),
    dogs: Number(rows.dogs),
    pending: Number(rows.pending),
    approved: Number(rows.approved),
    featured: Number(rows.featured),
  };
}

// ============================================================
// TOPICS HELPERS
// ============================================================
export async function getTopics(species?: string) {
  const db = await getDb();
  if (!db) return [];
  if (species) {
    return db.select().from(topics)
      .where(or(eq(topics.species, species as any), eq(topics.species, "both")) as any);
  }
  return db.select().from(topics);
}

export async function getTopicBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(topics).where(eq(topics.slug, slug)).limit(1);
  return rows[0] ?? null;
}

// ============================================================
// BREEDS HELPERS
// ============================================================
export async function getBreeds(species?: string) {
  const db = await getDb();
  if (!db) return [];
  if (species) {
    return db.select().from(breeds).where(eq(breeds.species, species as any));
  }
  return db.select().from(breeds);
}

export async function getBreedBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(breeds).where(eq(breeds.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getBreedWithPapers(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const breedRows = await db.select().from(breeds).where(eq(breeds.slug, slug)).limit(1);
  if (!breedRows[0]) return null;

  const breed = breedRows[0];
  const paperRows = await db.select({ paper: papers, relevanceScore: paperBreeds.relevanceScore })
    .from(paperBreeds)
    .innerJoin(papers, eq(paperBreeds.paperId, papers.id))
    .where(and(eq(paperBreeds.breedId, breed.id), eq(papers.status, "published")))
    .orderBy(desc(paperBreeds.relevanceScore));

  return { ...breed, papers: paperRows.map(r => ({ ...r.paper, relevanceScore: r.relevanceScore })) };
}

// ============================================================
// CONTENT ANGLES HELPERS
// ============================================================
export async function getContentAngles(formatType?: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return { angles: [], total: 0 };

  const conditions = formatType ? [eq(contentAngles.formatType, formatType as any)] : [];
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
    db.select({ angle: contentAngles, paper: papers })
      .from(contentAngles)
      .innerJoin(papers, eq(contentAngles.paperId, papers.id))
      .where(whereClause)
      .orderBy(desc(contentAngles.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`COUNT(*)` }).from(contentAngles).where(whereClause),
  ]);

  return { angles: rows, total: Number(countRows[0]?.count ?? 0) };
}

// ============================================================
// UPDATE LOGS HELPERS
// ============================================================
export async function getUpdateLogs(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(updateLogs).orderBy(desc(updateLogs.runDate)).limit(limit);
}

export async function createUpdateLog(data: Omit<typeof updateLogs.$inferInsert, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(updateLogs).values(data as any);
  return (result as any).insertId as number;
}

export async function getMonthlyPapers(year?: number, month?: number) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth() + 1;

  return db.select().from(papers)
    .where(and(
      eq(papers.status, "published"),
      sql`YEAR(${papers.createdAt}) = ${targetYear}` as any,
      sql`MONTH(${papers.createdAt}) = ${targetMonth}` as any
    ))
    .orderBy(desc(papers.createdAt));
}

// ============================================================
// GUIDELINES HELPERS
// ============================================================
export interface GuidelinesFilter {
  species?: string;
  lifeStage?: string;
  category?: string;
  organization?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getGuidelines(filter: GuidelinesFilter = {}) {
  const db = await getDb();
  if (!db) return { guidelines: [], total: 0 };

  const {
    species, lifeStage, category, organization,
    status = "published", search, limit = 20, offset = 0,
  } = filter;

  const conditions: ReturnType<typeof eq>[] = [];
  if (status) conditions.push(eq(guidelines.status, status as any));
  if (species) conditions.push(eq(guidelines.species, species as any));
  if (lifeStage) conditions.push(eq(guidelines.lifeStage, lifeStage as any));
  if (category) conditions.push(eq(guidelines.category, category as any));
  if (organization) conditions.push(eq(guidelines.organization, organization as any));
  if (search) {
    conditions.push(
      or(
        like(guidelines.title, `%${search}%`),
        like(guidelines.summary, `%${search}%`)
      ) as any
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
    db.select().from(guidelines)
      .where(whereClause)
      .orderBy(desc(guidelines.year))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`COUNT(*)` }).from(guidelines).where(whereClause),
  ]);

  return { guidelines: rows, total: Number(countRows[0]?.count ?? 0) };
}

export async function getGuidelineById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(guidelines).where(eq(guidelines.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function updateGuideline(id: number, data: Partial<typeof guidelines.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(guidelines).set(data as any).where(eq(guidelines.id, id));
}

// ============================================================
// INGREDIENT INTELLIGENCE HELPERS
// ============================================================
export async function getIngredientIndex() {
  const db = await getDb();
  if (!db) return [];

  // Aggregate all ingredients from published papers
  const rows = await db.select({
    id: papers.id,
    title: papers.title,
    species: papers.species,
    lifeStage: papers.lifeStage,
    year: papers.year,
    evidenceLevel: papers.evidenceLevel,
    ingredients: papers.ingredients,
    ingredientMappings: papers.ingredientMappings,
  }).from(papers)
    .where(and(
      eq(papers.status, "published"),
      sql`${papers.ingredients} IS NOT NULL AND JSON_LENGTH(${papers.ingredients}) > 0` as any
    ))
    .orderBy(desc(papers.year));

  // Build ingredient index: ingredient -> list of papers
  const index: Record<string, {
    ingredient: string;
    papers: Array<{
      paperId: number;
      title: string;
      species: string;
      lifeStage: string;
      year: number;
      evidenceLevel: string;
      health_relevance: string;
      support_type: string;
      evidence_note: string;
      caution: string | null;
    }>;
  }> = {};

  for (const row of rows) {
    const mappings = (row.ingredientMappings as any[]) || [];
    for (const m of mappings) {
      const key = (m.ingredient || "").toLowerCase().trim();
      if (!key) continue;
      if (!index[key]) {
        index[key] = { ingredient: m.ingredient, papers: [] };
      }
      index[key].papers.push({
        paperId: row.id,
        title: row.title,
        species: row.species,
        lifeStage: row.lifeStage,
        year: row.year,
        evidenceLevel: row.evidenceLevel,
        health_relevance: m.health_relevance,
        support_type: m.support_type,
        evidence_note: m.evidence_note,
        caution: m.caution ?? null,
      });
    }
  }

  return Object.values(index).sort((a, b) => a.ingredient.localeCompare(b.ingredient));
}

export async function getIngredientByName(name: string) {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.select({
    id: papers.id,
    title: papers.title,
    species: papers.species,
    lifeStage: papers.lifeStage,
    year: papers.year,
    evidenceLevel: papers.evidenceLevel,
    ingredients: papers.ingredients,
    ingredientMappings: papers.ingredientMappings,
  }).from(papers)
    .where(and(
      eq(papers.status, "published"),
      sql`JSON_SEARCH(${papers.ingredients}, 'one', ${name}) IS NOT NULL` as any
    ));

  return rows;
}
