import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Property } from "./types";

const db = vi.hoisted(() => ({ upsert: vi.fn(), select: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ upsert: db.upsert, select: () => ({ limit: db.select }) }) } }));

const property: Property = { id: "test", slug: "test", ref: "TEST-001", title: "Test", type: "Residential Land", status: "Published", location: "Azare", area: "Old Kano Road", zoneId: "z1", price: 100, size: 1, sizeUnit: "plots", description: "", features: [], images: [], featured: false, createdAt: "2026-11-11" };

describe("listing persistence", () => {
  beforeEach(() => { vi.resetModules(); localStorage.clear(); db.upsert.mockReset(); });
  it("immediately caches a successfully saved published listing", async () => {
    db.upsert.mockResolvedValue({ error: null });
    const { actions } = await import("./store");
    expect(await actions.saveProperty(property)).toBe(true);
    expect(JSON.parse(localStorage.getItem("rahama-public-cache-v2") ?? "{}").properties).toEqual([property]);
  });
  it("never reports or caches a failed save as published", async () => {
    db.upsert.mockResolvedValue({ error: { message: "offline" } });
    const { actions } = await import("./store");
    expect(await actions.saveProperty(property)).toBe(false);
    expect(localStorage.getItem("rahama-public-cache-v2")).toBeNull();
  });
  it("keeps draft listings out of the public cache", async () => {
    db.upsert.mockResolvedValue({ error: null });
    const { actions } = await import("./store");
    await actions.saveProperty({ ...property, status: "Draft" });
    expect(JSON.parse(localStorage.getItem("rahama-public-cache-v2") ?? "{}").properties).toEqual([]);
  });
});