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
  getGuidelines,
  getGuidelineById,
  getIngredientByName,
  getIngredientIndex,
  getMonthlyPapers,
  getPaperById,
  getPapers,
  getPaperStats,
  getRelatedPapers,
  getTopicBySlug,
  getTopics,
  getUpdateLogs,
  updateGuideline,
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

  // Admin: bulk generate content angles for all published papers that have none
  bulkGenerate: adminProcedure
    .input(z.object({
      limit: z.number().default(20), // max papers to process per call
      overwrite: z.boolean().default(false), // if true, regenerate even if angles exist
    }))
    .mutation(async ({ input }) => {
      const { papers: allPapers } = await getPapers({ status: "published", limit: 200, offset: 0 });

      // Filter papers that need content angles generated
      // Check which papers already have content angles by querying the DB
      const { getDb: getDbCheck } = await import("./db");
      const { contentAngles: caTable } = await import("../drizzle/schema");
      const { inArray } = await import("drizzle-orm");
      const dbCheck = await getDbCheck();
      let paperIdsWithAngles: number[] = [];
      if (dbCheck && !input.overwrite) {
        const existing = await dbCheck.selectDistinct({ paperId: caTable.paperId }).from(caTable);
        paperIdsWithAngles = existing.map((r: { paperId: number | null }) => r.paperId).filter((id): id is number => id !== null);
      }
      const toProcess = input.overwrite
        ? allPapers.slice(0, input.limit)
        : allPapers.filter(p => !paperIdsWithAngles.includes(p.id)).slice(0, input.limit);

      let generated = 0;
      const errors: string[] = [];

      for (const paper of toProcess) {
        try {
          const prompt = `You are a pet nutrition content strategist for pet food brands.

Based on this peer-reviewed research paper, generate 3 distinct content angle ideas that a pet food brand could use for marketing, education, or social media content.

Paper: "${paper.title}"
Authors: ${paper.authors}
Year: ${paper.year}
Journal: ${paper.journal}
Core Summary: ${paper.coreSummary || ""}
Key Findings: ${Array.isArray(paper.keyFindings) ? (paper.keyFindings as string[]).join("; ") : ""}
Practical Relevance: ${paper.practicalRelevance || ""}
Species: ${paper.species} | Life Stage: ${paper.lifeStage || "all"}

For each content angle provide: format_type (one of: social_post, blog_article, infographic, video_script, email_campaign, product_claim, vet_education), title_idea, consumer_summary (1-2 sentences for pet owners), professional_summary (1-2 sentences for vets/nutritionists), target_audience, risk_note (any claim substantiation needed).`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are a pet nutrition content strategist. Respond with valid JSON only." },
              { role: "user", content: prompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "content_angles_bulk",
                strict: false,
                schema: {
                  type: "object",
                  properties: {
                    angles: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          format_type: { type: "string" },
                          title_idea: { type: "string" },
                          consumer_summary: { type: "string" },
                          professional_summary: { type: "string" },
                          target_audience: { type: "string" },
                          risk_note: { type: "string" },
                        },
                        required: ["format_type", "title_idea", "consumer_summary", "professional_summary", "target_audience", "risk_note"],
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

          const rawC = response.choices[0]?.message?.content;
          const cStr = typeof rawC === "string" ? rawC : null;
          if (!cStr) continue;

          const parsed = JSON.parse(cStr);
          const angles = parsed.angles || [];

          // Save to DB using existing generateContentAngles helper
          const { getDb } = await import("./db");
          const { contentAngles } = await import("../drizzle/schema");
          const db = await getDb();
          if (db && angles.length > 0) {
            await db.insert(contentAngles).values(
              angles.map((a: any) => ({
                paperId: paper.id,
                formatType: a.format_type,
                titleIdea: a.title_idea,
                consumerSummary: a.consumer_summary,
                professionalSummary: a.professional_summary,
                targetAudience: a.target_audience,
                riskNote: a.risk_note,
              }))
            );
            generated += angles.length;
          }
        } catch (e) {
          errors.push(`Paper ${paper.id}: ${String(e)}`);
        }
      }

      return { processed: toProcess.length, generated, errors };
    }),
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

      // Mark the log as completed. Actual paper import is performed by the
      // Project Skill pipeline (save_to_db.py) which writes directly to this
      // MySQL database. This endpoint only records that an import was triggered.
      const { getDb } = await import("./db");
      const { updateLogs } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (db) {
        await db.update(updateLogs)
          .set({
            status: "completed",
            notes: input.notes || "Import triggered. Run the Project Skill pipeline (save_to_db.py) to populate papers.",
          })
          .where(eq(updateLogs.id, logId));
      }

      return { logId, totalFound: 0, totalImported: 0, totalFlagged: 0 };
    }),
});

// ============================================================
// GUIDELINES ROUTER
// ============================================================
const guidelinesRouter = router({
  list: publicProcedure
    .input(z.object({
      species: z.enum(["cat", "dog", "both"]).optional(),
      lifeStage: z.enum(["junior", "adult", "senior", "all"]).optional(),
      category: z.enum(["nutrition", "dental", "senior_care", "weight_management", "kidney", "liver", "cardiac", "dermatology", "oncology", "reproduction", "general_health"]).optional(),
      organization: z.enum(["AAHA", "WSAVA", "other"]).optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(({ input }) => getGuidelines({ ...input, status: "published" })),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const guideline = await getGuidelineById(input.id);
      if (!guideline) throw new TRPCError({ code: "NOT_FOUND", message: "Guideline not found" });
      if (guideline.status !== "published") throw new TRPCError({ code: "NOT_FOUND", message: "Guideline not found" });
      return guideline;
    }),

  // Admin procedures
  adminList: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "published", "archived"]).optional(),
      search: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(({ input }) => getGuidelines({ ...input })),

  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "published", "archived"]),
    }))
    .mutation(async ({ input }) => {
      await updateGuideline(input.id, { status: input.status });
      return { success: true };
    }),
});

// ============================================================
// INGREDIENTS ROUTER
// ============================================================
const ingredientsRouter = router({
  index: publicProcedure
    .query(() => getIngredientIndex()),

  getByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => getIngredientByName(input.name)),
});

// ============================================================
// FORMULATION ASSISTANT ROUTER
// ============================================================
const formulationRouter = router({
  // Health Goal → AI recommends Ingredients backed by DB papers
  recommendByGoal: publicProcedure
    .input(z.object({
      healthGoal: z.string().min(3).max(300),
      species: z.enum(["cat", "dog"]).optional(),
      lifeStage: z.enum(["junior", "adult", "senior", "all"]).optional(),
    }))
    .mutation(async ({ input }) => {
      // Step 1: Retrieve relevant published papers from DB
      const { papers: relevantPapers } = await getPapers({
        status: "published",
        species: input.species,
        lifeStage: input.lifeStage,
        limit: 30,
        offset: 0,
      });

      // Step 2: Build evidence context
      const paperContext = relevantPapers.slice(0, 20).map(p => ({
        id: p.id,
        title: p.title,
        authors: p.authors,
        year: p.year,
        journal: p.journal,
        keyFindings: p.keyFindings,
        coreSummary: p.coreSummary,
        evidenceLevel: p.evidenceLevel,
        studyType: p.studyType,
        species: p.species,
        lifeStage: p.lifeStage,
      }));

      const systemPrompt = `You are a veterinary nutrition scientist with expertise in pet food formulation. Based on the user's health goal and the provided peer-reviewed research evidence, recommend specific ingredients that are scientifically supported. Always ground your recommendations in the provided papers.`;

      const userPrompt = `Health Goal: "${input.healthGoal}"
Target Species: ${input.species || "cat or dog"}
Life Stage: ${input.lifeStage || "any"}

Research Evidence from Database:
${JSON.stringify(paperContext, null, 2)}

Recommend ingredients that help achieve the stated health goal. For each ingredient: explain mechanism, cite specific paper IDs from the evidence, rate evidence strength, note cautions, suggest inclusion levels if known.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "ingredient_recommendations",
            strict: false,
            schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      ingredient: { type: "string" },
                      category: { type: "string" },
                      mechanism: { type: "string" },
                      evidenceStrength: { type: "string", enum: ["high", "moderate", "limited", "emerging"] },
                      inclusionNote: { type: "string" },
                      cautions: { type: "string" },
                      supportingPaperIds: { type: "array", items: { type: "number" } },
                      supportingPaperTitles: { type: "array", items: { type: "string" } },
                    },
                    required: ["ingredient", "category", "mechanism", "evidenceStrength", "supportingPaperIds", "supportingPaperTitles"],
                    additionalProperties: true,
                  },
                },
                formulationTips: { type: "array", items: { type: "string" } },
                regulatoryNote: { type: "string" },
              },
              required: ["summary", "recommendations", "formulationTips"],
              additionalProperties: true,
            },
          },
        },
      });

      const rawRec = response.choices[0]?.message?.content;
      const recStr = typeof rawRec === "string" ? rawRec : null;
      if (!recStr) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI recommendation failed" });

      const result = JSON.parse(recStr);

      // Attach full paper details for cited papers
      const citedPaperIds: number[] = [];
      for (const rec of (result.recommendations || [])) {
        for (const id of (rec.supportingPaperIds || [])) {
          if (!citedPaperIds.includes(id)) citedPaperIds.push(id);
        }
      }
      const citedPapers = relevantPapers.filter(p => citedPaperIds.includes(p.id));

      return {
        healthGoal: input.healthGoal,
        species: input.species,
        lifeStage: input.lifeStage,
        summary: result.summary as string,
        recommendations: (result.recommendations || []) as Array<{
          ingredient: string;
          category: string;
          mechanism: string;
          evidenceStrength: "high" | "moderate" | "limited" | "emerging";
          inclusionNote?: string;
          cautions?: string;
          supportingPaperIds: number[];
          supportingPaperTitles: string[];
        }>,
        formulationTips: (result.formulationTips || []) as string[],
        regulatoryNote: (result.regulatoryNote || "") as string,
        citedPapers,
        totalPapersSearched: relevantPapers.length,
      };
    }),

  analyze: publicProcedure
    .input(z.object({
      ingredients: z.array(z.string()).min(1).max(20),
      species: z.enum(["cat", "dog"]),
      lifeStage: z.enum(["junior", "adult", "senior", "all"]).default("all"),
      healthGoal: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Gather evidence from DB for each ingredient
      const ingredientData = await Promise.all(
        input.ingredients.map(ing => getIngredientByName(ing))
      );

      // Build context for LLM
      const ingredientContext = input.ingredients.map((ing, i) => {
        const papers = ingredientData[i] || [];
        const mappings = papers.flatMap(p =>
          ((p.ingredientMappings as any[]) || []).filter(
            (m: any) => m.ingredient?.toLowerCase() === ing.toLowerCase()
          )
        );
        return {
          ingredient: ing,
          paperCount: papers.length,
          benefits: mappings.map((m: any) => m.health_relevance).filter(Boolean),
          cautions: mappings.map((m: any) => m.caution).filter(Boolean),
        };
      });

      const prompt = `You are a veterinary nutrition formulation expert.

A pet food formulator wants to analyze this ingredient combination:
Ingredients: ${input.ingredients.join(", ")}
Target species: ${input.species}
Life stage: ${input.lifeStage}
Health goal: ${input.healthGoal || "general wellness"}

Evidence from research database:
${JSON.stringify(ingredientContext, null, 2)}

Provide a formulation analysis as JSON with these fields:
- overall_score: number 1-10 (nutritional synergy score)
- overall_assessment: string (2-3 sentence overall assessment)
- ingredient_analysis: array of objects, one per ingredient:
  { ingredient, role, benefits, cautions, evidence_strength: "high"|"medium"|"low"|"limited" }
- synergies: array of objects describing positive ingredient interactions:
  { ingredients: ["ing1", "ing2"], description }
- conflicts: array of objects describing potential conflicts:
  { ingredients: ["ing1", "ing2"], description, severity: "high"|"medium"|"low" }
- recommendations: array of 3-5 actionable recommendation strings
- missing_nutrients: array of nutrients that may be lacking for the stated health goal
- regulatory_notes: brief note on any claims that need substantiation`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a veterinary nutrition formulation expert. Respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "formulation_analysis",
            strict: false,
            schema: {
              type: "object",
              properties: {
                overall_score: { type: "number" },
                overall_assessment: { type: "string" },
                ingredient_analysis: { type: "array" },
                synergies: { type: "array" },
                conflicts: { type: "array" },
                recommendations: { type: "array", items: { type: "string" } },
                missing_nutrients: { type: "array", items: { type: "string" } },
                regulatory_notes: { type: "string" },
              },
              required: ["overall_score", "overall_assessment", "ingredient_analysis", "recommendations"],
              additionalProperties: true,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const contentStr = typeof rawContent === "string" ? rawContent : null;
      if (!contentStr) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI generation failed" });

      const result = JSON.parse(contentStr);
      return {
        ...result,
        inputIngredients: input.ingredients,
        species: input.species,
        lifeStage: input.lifeStage,
        healthGoal: input.healthGoal,
        evidenceSummary: ingredientContext,
      };
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
  guidelines: guidelinesRouter,
  ingredients: ingredientsRouter,
  formulation: formulationRouter,
});

export type AppRouter = typeof appRouter;
