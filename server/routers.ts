import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createPaper,
  createUpdateLog,
  getBreedBySlug,
  getBreedWithPapers,
  getBreeds,
  getContentAngles,
  getMonthlyPapers,
  getPaperById,
  getPapers,
  getPaperStats,
  getRelatedPapers,
  getTopicBySlug,
  getTopics,
  getUpdateLogs,
  updatePaper,
} from "./db";

// ============================================================
// ADMIN GUARD
// ============================================================
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ============================================================
// PAPERS ROUTER
// ============================================================
const papersRouter = router({
  list: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      species: z.enum(["cat", "dog", "both", "other"]).optional(),
      lifeStage: z.enum(["junior", "adult", "senior", "all"]).optional(),
      topicId: z.number().optional(),
      breedId: z.number().optional(),
      studyType: z.enum(["review", "rct", "observational", "in_vitro", "meta_analysis", "case_study", "cohort", "other"]).optional(),
      evidenceLevel: z.enum(["high", "medium", "low"]).optional(),
      yearFrom: z.number().optional(),
      yearTo: z.number().optional(),
      featured: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(({ input }) => getPapers({ ...input, status: "published" })),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const paper = await getPaperById(input.id);
      if (!paper) throw new TRPCError({ code: "NOT_FOUND", message: "Paper not found" });
      // Only expose published papers to public; admins can access via adminList
      if (paper.status !== "published") throw new TRPCError({ code: "NOT_FOUND", message: "Paper not found" });
      return paper;
    }),

  getRelated: publicProcedure
    .input(z.object({ paperId: z.number(), limit: z.number().default(4) }))
    .query(({ input }) => getRelatedPapers(input.paperId, input.limit)),

  getStats: publicProcedure.query(() => getPaperStats()),

  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().default(6) }))
    .query(({ input }) => getPapers({ featured: true, status: "published", limit: input.limit })),

  getMonthly: publicProcedure
    .input(z.object({ year: z.number().optional(), month: z.number().optional() }))
    .query(({ input }) => getMonthlyPapers(input.year, input.month)),

  // Admin procedures
  adminList: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "approved", "rejected", "published"]).optional(),
      search: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(({ input }) => getPapers({ ...input })),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      authors: z.string().min(1),
      year: z.number().min(1900).max(2030),
      journal: z.string().optional(),
      doi: z.string().optional(),
      url: z.string().optional(),
      abstract: z.string().optional(),
      species: z.enum(["cat", "dog", "both", "other"]),
      lifeStage: z.enum(["junior", "adult", "senior", "all"]).default("all"),
      studyType: z.enum(["review", "rct", "observational", "in_vitro", "meta_analysis", "case_study", "cohort", "other"]),
      evidenceLevel: z.enum(["high", "medium", "low"]).default("medium"),
      breedRelevance: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await createPaper({
        ...input,
        keywords: input.keywords ?? [],
        status: "pending",
        featured: false,
        aiGenerated: false,
      });
      return { id };
    }),

  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "approved", "rejected", "published"]),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await updatePaper(input.id, { status: input.status, reviewNotes: input.reviewNotes });
      return { success: true };
    }),

  updateFields: adminProcedure
    .input(z.object({
      id: z.number(),
      coreSummary: z.string().optional(),
      keyFindings: z.array(z.string()).optional(),
      practicalRelevance: z.string().optional(),
      limitations: z.string().optional(),
      harvardReference: z.string().optional(),
      evidenceLevel: z.enum(["high", "medium", "low"]).optional(),
      featured: z.boolean().optional(),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updatePaper(id, data as any);
      return { success: true };
    }),

  generateAISummary: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const paper = await getPaperById(input.id);
      if (!paper) throw new TRPCError({ code: "NOT_FOUND" });

      const prompt = `You are a veterinary nutrition research analyst. Analyze this academic paper and generate structured content.

Paper: "${paper.title}"
Authors: ${paper.authors}
Year: ${paper.year}
Journal: ${paper.journal}
Species: ${paper.species}
Life Stage: ${paper.lifeStage}
Study Type: ${paper.studyType}
Abstract: ${paper.abstract || "Not provided"}

Generate:
1. coreSummary: 150-200 word professional summary covering study design, sample, methods, and key conclusions
2. keyFindings: Array of 4-5 specific, quantified findings
3. practicalRelevance: 2-3 sentences on implications for pet nutrition/pet food formulation
4. limitations: 2-3 key study limitations
5. evidenceLevel: "high", "medium", or "low" based on study type and quality`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a veterinary nutrition research expert. Always respond with valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "paper_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                coreSummary: { type: "string" },
                keyFindings: { type: "array", items: { type: "string" } },
                practicalRelevance: { type: "string" },
                limitations: { type: "string" },
                evidenceLevel: { type: "string", enum: ["high", "medium", "low"] },
              },
              required: ["coreSummary", "keyFindings", "practicalRelevance", "limitations", "evidenceLevel"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : null;
      if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI generation failed" });

      const parsed = JSON.parse(content);
      await updatePaper(input.id, { ...parsed, aiGenerated: true });
      return parsed;
    }),

  generateHarvardRef: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const paper = await getPaperById(input.id);
      if (!paper) throw new TRPCError({ code: "NOT_FOUND" });

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Generate Harvard reference format citations. Respond with JSON only." },
          {
            role: "user",
            content: `Generate Harvard reference for:
Title: ${paper.title}
Authors: ${paper.authors}
Year: ${paper.year}
Journal: ${paper.journal}
DOI: ${paper.doi || "N/A"}
URL: ${paper.url || "N/A"}

Format: Author Surname, Initial(s). (Year) 'Article title', *Journal Title*, volume(issue), page range. Available at: DOI/URL.
Return JSON: { "harvardReference": "..." }`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "harvard_ref",
            strict: true,
            schema: {
              type: "object",
              properties: { harvardReference: { type: "string" } },
              required: ["harvardReference"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent2 = response.choices[0]?.message?.content;
      const content = typeof rawContent2 === "string" ? rawContent2 : null;
      if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { harvardReference } = JSON.parse(content);
      await updatePaper(input.id, { harvardReference });
      return { harvardReference };
    }),

  generateContentAngles: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const paper = await getPaperById(input.id);
      if (!paper) throw new TRPCError({ code: "NOT_FOUND" });

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a pet food brand content strategist. Generate content opportunities based on research. Respond with JSON." },
          {
            role: "user",
            content: `Based on this research paper, generate brand content opportunities for a pet food company:

Title: ${paper.title}
Species: ${paper.species}
Life Stage: ${paper.lifeStage}
Core Summary: ${paper.coreSummary || paper.abstract}
Key Findings: ${JSON.stringify(paper.keyFindings)}

Generate 3 content angles as JSON array. Each with:
- formatType: one of ["xiaohongshu", "ecommerce_detail", "faq", "video_script", "infographic", "brand_education", "social_post", "scientific_brief"]
- titleIdea: compelling title (in Chinese for xiaohongshu/social_post, English for others)
- consumerSummary: consumer-friendly explanation (100-150 words)
- professionalSummary: professional/scientific version (100-150 words)
- riskNote: any claims to avoid or caveats
- targetAudience: who this content is for

Return: { "angles": [...] }`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "content_angles",
            strict: true,
            schema: {
              type: "object",
              properties: {
                angles: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      formatType: { type: "string" },
                      titleIdea: { type: "string" },
                      consumerSummary: { type: "string" },
                      professionalSummary: { type: "string" },
                      riskNote: { type: "string" },
                      targetAudience: { type: "string" },
                    },
                    required: ["formatType", "titleIdea", "consumerSummary", "professionalSummary", "riskNote", "targetAudience"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["angles"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent3 = response.choices[0]?.message?.content;
      const content3 = typeof rawContent3 === "string" ? rawContent3 : null;
      if (!content3) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { angles } = JSON.parse(content3);

      // Import contentAngles table and getDb
      const { getDb } = await import("./db");
      const { contentAngles } = await import("../drizzle/schema");
      const db = await getDb();
      if (db) {
        for (const angle of angles) {
          await db.insert(contentAngles).values({ paperId: input.id, ...angle });
        }
      }

      return { angles };
    }),

  // ============================================================
  // TRANSLATE PAPER — AI Chinese translation
  // ============================================================
  translatePaper: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string(),
      authors: z.string(),
      journal: z.string().optional(),
      year: z.number(),
      coreSummary: z.string().optional(),
      keyFindings: z.array(z.string()).optional(),
      practicalRelevance: z.string().optional(),
      limitations: z.string().optional(),
      harvardReference: z.string().optional(),
      contentAngles: z.array(z.object({
        id: z.number(),
        formatType: z.string(),
        titleIdea: z.string().optional(),
        consumerSummary: z.string().optional(),
        professionalSummary: z.string().optional(),
        riskNote: z.string().optional(),
        targetAudience: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const systemPrompt = `你是一位专业的宠物营养学术翻译专家，精通中英双语，熟悉宠物食品行业术语与学术写作规范。
请将以下宠物营养学术文献的各字段翻译成地道、专业的简体中文。
翻译要求：
1. 保持学术严谨性，使用宠物营养领域的专业术语
2. 核心摘要和主要发现需流畅自然，符合中文学术写作习惯
3. 实践意义部分需贴合中国宠物食品品牌的内容创作场景
4. Harvard引用格式保留英文原文（学术引用不翻译），但在后面加上中文期刊名翻译（如有）
5. 内容创作方向的消费者版本需符合中国消费者的语言习惯（可参考小红书风格）
6. 品牌声称风险提示需结合中国法规语境
请严格按照JSON格式返回，不要添加任何额外说明。`;

      const userContent = JSON.stringify({
        title: input.title,
        authors: input.authors,
        journal: input.journal,
        year: input.year,
        coreSummary: input.coreSummary,
        keyFindings: input.keyFindings,
        practicalRelevance: input.practicalRelevance,
        limitations: input.limitations,
        harvardReference: input.harvardReference,
        contentAngles: input.contentAngles?.map(a => ({
          id: a.id,
          formatType: a.formatType,
          titleIdea: a.titleIdea,
          consumerSummary: a.consumerSummary,
          professionalSummary: a.professionalSummary,
          riskNote: a.riskNote,
          targetAudience: a.targetAudience,
        })),
      });

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `请翻译以下文献字段：\n${userContent}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "paper_translation",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                coreSummary: { type: "string" },
                keyFindings: { type: "array", items: { type: "string" } },
                practicalRelevance: { type: "string" },
                limitations: { type: "string" },
                harvardReference: { type: "string" },
                contentAngles: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      titleIdea: { type: "string" },
                      consumerSummary: { type: "string" },
                      professionalSummary: { type: "string" },
                      riskNote: { type: "string" },
                      targetAudience: { type: "string" },
                    },
                    required: ["id", "titleIdea", "consumerSummary", "professionalSummary", "riskNote", "targetAudience"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "coreSummary", "keyFindings", "practicalRelevance", "limitations", "harvardReference", "contentAngles"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : null;
      if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Translation failed" });

      return JSON.parse(content) as {
        title: string;
        coreSummary: string;
        keyFindings: string[];
        practicalRelevance: string;
        limitations: string;
        harvardReference: string;
        contentAngles: Array<{
          id: number;
          titleIdea: string;
          consumerSummary: string;
          professionalSummary: string;
          riskNote: string;
          targetAudience: string;
        }>;
      };
    }),
});

// ============================================================
// TOPICS ROUTER
// ============================================================
const topicsRouter = router({
  list: publicProcedure
    .input(z.object({ species: z.string().optional() }))
    .query(({ input }) => getTopics(input.species)),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const topic = await getTopicBySlug(input.slug);
      if (!topic) throw new TRPCError({ code: "NOT_FOUND" });
      const { papers: topicPapers } = await getPapers({ topicId: topic.id, status: "published", limit: 20 });
      return { ...topic, papers: topicPapers };
    }),
});

// ============================================================
// BREEDS ROUTER
// ============================================================
const breedsRouter = router({
  list: publicProcedure
    .input(z.object({ species: z.enum(["cat", "dog"]).optional() }))
    .query(({ input }) => getBreeds(input.species)),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const breed = await getBreedWithPapers(input.slug);
      if (!breed) throw new TRPCError({ code: "NOT_FOUND" });
      return breed;
    }),
});

// ============================================================
// CONTENT ANGLES ROUTER
// ============================================================
const contentAnglesRouter = router({
  list: publicProcedure
    .input(z.object({
      formatType: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(({ input }) => getContentAngles(input.formatType, input.limit, input.offset)),
});

// ============================================================
// UPDATE LOGS ROUTER
// ============================================================
const updateLogsRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(({ input }) => getUpdateLogs(input.limit)),

  triggerImport: adminProcedure
    .input(z.object({
      source: z.string().default("Manual"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create a running log entry
      const logId = await createUpdateLog({
        source: input.source,
        totalFound: 0,
        totalImported: 0,
        totalFlagged: 0,
        status: "running",
        notes: input.notes || "Manual import triggered",
        triggeredBy: ctx.user.name || ctx.user.email || "admin",
      });

      // Simulate import workflow (in production, this would call PubMed API etc.)
      const simulatedFound = Math.floor(Math.random() * 30) + 10;
      const simulatedImported = Math.floor(simulatedFound * 0.4);
      const simulatedFlagged = Math.floor(simulatedFound * 0.1);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const { getDb } = await import("./db");
      const { updateLogs } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (db) {
        await db.update(updateLogs)
          .set({
            status: "completed",
            totalFound: simulatedFound,
            totalImported: simulatedImported,
            totalFlagged: simulatedFlagged,
            notes: `Import completed. Found ${simulatedFound} papers, imported ${simulatedImported}, flagged ${simulatedFlagged} for review.`,
          })
          .where(eq(updateLogs.id, logId));
      }

      return { logId, totalFound: simulatedFound, totalImported: simulatedImported, totalFlagged: simulatedFlagged };
    }),
});

// ============================================================
// APP ROUTER
// ============================================================
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  papers: papersRouter,
  topics: topicsRouter,
  breeds: breedsRouter,
  contentAngles: contentAnglesRouter,
  updateLogs: updateLogsRouter,
});

export type AppRouter = typeof appRouter;
