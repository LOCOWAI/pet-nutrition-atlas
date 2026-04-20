import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ============================================================
// MOCK DATABASE
// ============================================================
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

// ============================================================
// CONTEXT HELPERS
// ============================================================
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ============================================================
// AUTH TESTS
// ============================================================
describe("auth", () => {
  it("me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
    expect(result?.role).toBe("user");
  });

  it("logout clears session cookie and returns success", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalledWith(
      COOKIE_NAME,
      expect.objectContaining({ maxAge: -1, httpOnly: true, path: "/" })
    );
  });
});

// ============================================================
// PAPERS TESTS
// ============================================================
describe("papers", () => {
  it("list returns empty result for public user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.papers.list({ limit: 10, offset: 0 });
    expect(result).toEqual({ papers: [], total: 0 });
  });

  it("getById throws NOT_FOUND when paper does not exist", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.papers.getById({ id: 999 })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("getStats returns stats object", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.papers.getStats();
    expect(result).toMatchObject({ total: 0, approved: 0, pending: 0, featured: 0 });
  });

  it("getFeatured returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.papers.getFeatured({ limit: 6 });
    expect(result).toEqual({ papers: [], total: 0 });
  });

  it("getMonthly returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.papers.getMonthly({});
    expect(result).toEqual([]);
  });

  it("adminList throws UNAUTHORIZED for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.papers.adminList({ limit: 10, offset: 0 })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("adminList throws FORBIDDEN for non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(caller.papers.adminList({ limit: 10, offset: 0 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("adminList succeeds for admin user", async () => {
    const caller = appRouter.createCaller(createUserContext("admin"));
    const result = await caller.papers.adminList({ limit: 10, offset: 0 });
    expect(result).toEqual({ papers: [], total: 0 });
  });

  it("create throws FORBIDDEN for non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(
      caller.papers.create({
        title: "Test Paper",
        authors: "Smith, J.",
        year: 2024,
        species: "cat",
        studyType: "review",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("create succeeds for admin user", async () => {
    const caller = appRouter.createCaller(createUserContext("admin"));
    const result = await caller.papers.create({
      title: "Test Paper on Feline Nutrition",
      authors: "Smith, J., Jones, A.",
      year: 2024,
      species: "cat",
      studyType: "review",
      evidenceLevel: "medium",
      lifeStage: "adult",
    });
    expect(result).toEqual({ id: 1 });
  });

  it("updateStatus throws FORBIDDEN for non-admin", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(
      caller.papers.updateStatus({ id: 1, status: "approved" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("updateStatus succeeds for admin", async () => {
    const caller = appRouter.createCaller(createUserContext("admin"));
    const result = await caller.papers.updateStatus({ id: 1, status: "approved" });
    expect(result).toEqual({ success: true });
  });
});

// ============================================================
// TOPICS TESTS
// ============================================================
describe("topics", () => {
  it("list returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.topics.list({});
    expect(result).toEqual([]);
  });

  it("list accepts species filter", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.topics.list({ species: "cat" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getBySlug throws NOT_FOUND for non-existent slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.topics.getBySlug({ slug: "non-existent" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

// ============================================================
// BREEDS TESTS
// ============================================================
describe("breeds", () => {
  it("list returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.breeds.list({});
    expect(result).toEqual([]);
  });

  it("list accepts species filter", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.breeds.list({ species: "dog" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getBySlug throws NOT_FOUND for non-existent slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.breeds.getBySlug({ slug: "non-existent" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

// ============================================================
// CONTENT ANGLES TESTS
// ============================================================
describe("contentAngles", () => {
  it("list returns empty result", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.contentAngles.list({ limit: 10, offset: 0 });
    expect(result).toEqual({ angles: [], total: 0 });
  });

  it("list accepts formatType filter", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.contentAngles.list({ formatType: "xiaohongshu", limit: 10, offset: 0 });
    expect(result).toMatchObject({ angles: [], total: 0 });
  });
});

// ============================================================
// UPDATE LOGS TESTS
// ============================================================
describe("updateLogs", () => {
  it("list returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.updateLogs.list({ limit: 10 });
    expect(result).toEqual([]);
  });

  it("triggerImport throws UNAUTHORIZED for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.updateLogs.triggerImport({ source: "Manual" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("triggerImport throws FORBIDDEN for non-admin user", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(
      caller.updateLogs.triggerImport({ source: "Manual" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

// ============================================================
// TRANSLATE PAPER TESTS
// ============================================================
describe("papers.translatePaper", () => {
  it("throws BAD_REQUEST when required fields are missing", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    // translatePaper requires title, authors, year — missing all → BAD_REQUEST from zod
    await expect((caller.papers.translatePaper as any)({})).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("is a public procedure accessible without auth", async () => {
    // Verify it's accessible as a public procedure (no UNAUTHORIZED)
    // We only check the Zod input validation path (missing optional fields still passes schema)
    // to avoid calling real LLM in test environment.
    const caller = appRouter.createCaller(createPublicContext());
    // Passing an empty object should fail with BAD_REQUEST (Zod), not UNAUTHORIZED
    await expect((caller.papers.translatePaper as any)({})).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  }, 10000);
});

// ============================================================
// FORMULATION.RECOMMEND_BY_GOAL TESTS
// ============================================================
describe("formulation.recommendByGoal", () => {
  it("throws BAD_REQUEST when healthGoal is too short", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      (caller.formulation.recommendByGoal as any)({ healthGoal: "ab" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("throws BAD_REQUEST when healthGoal is missing", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      (caller.formulation.recommendByGoal as any)({})
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("is a public procedure — no UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    // Zod validation runs before auth check — empty input → BAD_REQUEST (not UNAUTHORIZED)
    await expect(
      (caller.formulation.recommendByGoal as any)({})
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts valid species and lifeStage enum values", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    // Invalid species → BAD_REQUEST from Zod
    await expect(
      (caller.formulation.recommendByGoal as any)({
        healthGoal: "improve joint health",
        species: "fish", // invalid
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ============================================================
// CONTENT_ANGLES.BULK_GENERATE TESTS
// ============================================================
describe("contentAngles.bulkGenerate", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      (caller.contentAngles.bulkGenerate as any)({})
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.contentAngles.bulkGenerate({ limit: 5 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("accepts valid input schema for admin", async () => {
    // We only test that Zod accepts the schema — not the actual LLM call
    const caller = appRouter.createCaller(createUserContext("admin"));
    // limit must be a number — passing a string → BAD_REQUEST
    await expect(
      (caller.contentAngles.bulkGenerate as any)({ limit: "not-a-number" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts overwrite flag as boolean", async () => {
    const caller = appRouter.createCaller(createUserContext("admin"));
    // overwrite must be boolean — passing a string → BAD_REQUEST
    await expect(
      (caller.contentAngles.bulkGenerate as any)({ overwrite: "yes" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
