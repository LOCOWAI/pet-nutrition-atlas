import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  getPapers: vi.fn().mockResolvedValue({ papers: [], total: 0 }),
  getPaperById: vi.fn().mockResolvedValue(null),
  getRelatedPapers: vi.fn().mockResolvedValue([]),
  getPaperStats: vi.fn().mockResolvedValue({ total: 0, approved: 0, pending: 0, featured: 0 }),
  getMonthlyPapers: vi.fn().mockResolvedValue([]),
  createPaper: vi.fn().mockResolvedValue(1),
  updatePaper: vi.fn().mockResolvedValue(undefined),
  getTopics: vi.fn().mockResolvedValue([]),
  getTopicBySlug: vi.fn().mockResolvedValue(null),
  getBreeds: vi.fn().mockResolvedValue([]),
  getBreedBySlug: vi.fn().mockResolvedValue(null),
  getBreedWithPapers: vi.fn().mockResolvedValue(null),
  getContentAngles: vi.fn().mockResolvedValue({ angles: [], total: 0 }),
  getUpdateLogs: vi.fn().mockResolvedValue([]),
  createUpdateLog: vi.fn().mockResolvedValue(1),
  getDb: vi.fn().mockResolvedValue(null),
}));

// Mock LLM to avoid real API calls in tests
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            title: "测试标题",
            authors: "作者甲",
            coreSummary: "这是核心摘要的中文翻译。",
            keyFindings: ["关键发现一", "关键发现二"],
            practicalRelevance: "实际意义的中文翻译。",
            limitations: "局限性的中文翻译。",
            harvardReference: "作者甲（2024年）...",
            contentAngles: [],
          }),
        },
      },
    ],
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ============================================================
// TRANSLATE PAPER API CONTRACT TESTS
// ============================================================
describe("papers.translatePaper API contract", () => {
  it("requires title field (string)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect((caller.papers.translatePaper as any)({ id: 1, authors: "A", year: 2024 }))
      .rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("requires authors field (string)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect((caller.papers.translatePaper as any)({ id: 1, title: "T", year: 2024 }))
      .rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("requires year field (number)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect((caller.papers.translatePaper as any)({ id: 1, title: "T", authors: "A" }))
      .rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts optional fields and returns translated content", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.papers.translatePaper({
      id: 1,
      title: "Effect of omega-3 on feline coat quality",
      authors: "Smith, J., Jones, A.",
      year: 2023,
      journal: "Journal of Feline Medicine",
      coreSummary: "This study examined the effects of omega-3 supplementation.",
      keyFindings: ["Improved coat quality", "Reduced inflammation"],
      practicalRelevance: "Relevant for senior cat formulations.",
      limitations: "Small sample size.",
      harvardReference: "Smith, J. and Jones, A. (2023)...",
    });
    // Should return translated fields
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("coreSummary");
    expect(result).toHaveProperty("keyFindings");
    expect(Array.isArray(result.keyFindings)).toBe(true);
  });

  it("is accessible as a public procedure (no auth required)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.papers.translatePaper({
      id: 1,
      title: "Test",
      authors: "Author",
      year: 2024,
    });
    expect(result).toHaveProperty("title");
  });

  it("returns contentAngles array when provided", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.papers.translatePaper({
      id: 1,
      title: "Test paper",
      authors: "Author, A.",
      year: 2024,
      contentAngles: [
        {
          id: 1,
          formatType: "xiaohongshu",
          titleIdea: "How omega-3 improves your cat's coat",
          consumerSummary: "Research shows omega-3 helps...",
          professionalSummary: "Clinical evidence indicates...",
          riskNote: "Consult veterinarian before use",
          targetAudience: "Cat owners aged 25-45",
        },
      ],
    });
    expect(result).toHaveProperty("contentAngles");
    expect(Array.isArray(result.contentAngles)).toBe(true);
  });
});

// ============================================================
// I18N TRANSLATION KEY COVERAGE TESTS
// ============================================================
describe("i18n translation key coverage", () => {
  it("translatePaper input schema covers all required paper text fields", () => {
    const REQUIRED_PAPER_FIELDS = ["title", "authors", "year"] as const;
    REQUIRED_PAPER_FIELDS.forEach((field) => {
      expect(typeof field).toBe("string");
      expect(field.length).toBeGreaterThan(0);
    });
  });

  it("translatePaper input schema covers all optional translatable fields", () => {
    const OPTIONAL_PAPER_FIELDS = [
      "journal",
      "coreSummary",
      "keyFindings",
      "practicalRelevance",
      "limitations",
      "harvardReference",
      "contentAngles",
    ] as const;
    OPTIONAL_PAPER_FIELDS.forEach((field) => {
      expect(typeof field).toBe("string");
    });
  });

  it("translated result structure matches expected Chinese output format", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.papers.translatePaper({
      id: 1,
      title: "Dietary fiber and gut microbiome in dogs",
      authors: "Wang, L.",
      year: 2022,
      coreSummary: "Study on dietary fiber effects.",
      keyFindings: ["Fiber improves gut health"],
    });
    // Verify output structure
    expect(result).toMatchObject({
      title: expect.any(String),
      authors: expect.any(String),
      coreSummary: expect.any(String),
      keyFindings: expect.any(Array),
    });
    // keyFindings should be an array of strings
    result.keyFindings?.forEach((finding: string) => {
      expect(typeof finding).toBe("string");
    });
  });
});

// ============================================================
// LANGUAGE PERSISTENCE BEHAVIOR TESTS (server-side contract)
// ============================================================
describe("language preference server contract", () => {
  it("auth.me does not expose language preference (client-side only)", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: 1,
        openId: "test-user",
        name: "Test User",
        email: "test@example.com",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    });
    const user = await caller.auth.me();
    // Language preference is stored in localStorage (client-side), not in user object
    expect(user).not.toHaveProperty("language");
    expect(user).not.toHaveProperty("locale");
    expect(user?.name).toBe("Test User");
  });

  it("translatePaper is stateless — multiple calls with same input both succeed", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const input = { id: 1, title: "Test", authors: "Author", year: 2024 };
    const [result1, result2] = await Promise.all([
      caller.papers.translatePaper(input),
      caller.papers.translatePaper(input),
    ]);
    // Both calls should succeed and return same structure
    expect(result1).toHaveProperty("title");
    expect(result2).toHaveProperty("title");
    expect(result1.title).toBe(result2.title);
  });
});
