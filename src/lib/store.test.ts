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
  it("persists a sale receipt and sold property together before confirming", async () => {
    db.upsert.mockResolvedValue({ error: null });
    const { actions } = await import("./store");
    await actions.saveProperty(property);
    db.upsert.mockClear();
    const sale = await actions.recordSale({ agentId: "agent", propertyId: property.id, propertyRef: property.ref, propertyTitle: property.title, buyerName: "Buyer", buyerPhone: "", price: 100, amountPaid: 100, commission: 0, method: "Cash", date: "2026-11-24" });
    expect(sale?.receiptNo).toBe("RHM-RCP-2026-0001");
    expect(db.upsert.mock.calls[0]?.[0]).toEqual(expect.arrayContaining([
      expect.objectContaining({ collection: "sales", data: expect.objectContaining({ amountPaid: 100 }) }),
      expect.objectContaining({ collection: "properties", data: expect.objectContaining({ status: "Sold" }) }),
    ]));
  });
  it("does not create a receipt or mark the property sold when persistence fails", async () => {
    db.upsert.mockResolvedValue({ error: null });
    const { actions } = await import("./store");
    await actions.saveProperty(property);
    db.upsert.mockResolvedValue({ error: { message: "offline" } });
    const sale = await actions.recordSale({ agentId: "agent", propertyId: property.id, propertyRef: property.ref, propertyTitle: property.title, buyerName: "Buyer", buyerPhone: "", price: 100, amountPaid: 100, commission: 0, method: "Cash", date: "2026-11-24" });
    expect(sale).toBeNull();
    expect(JSON.parse(localStorage.getItem("rahama-public-cache-v2") ?? "{}").properties[0].status).toBe("Published");
  });
  it("confirms enquiry notes only when the existing record is saved", async () => {
    db.select.mockResolvedValue({ data: [{ collection: "enquiries", data: { id: "lead", name: "Buyer", phone: "08000000000", message: "Viewing", status: "New", notes: "", createdAt: "2026-11-24" } }], error: null });
    const { actions } = await import("./store");
    await actions.refresh();
    db.upsert.mockResolvedValue({ error: { message: "offline" } });
    expect(await actions.updateEnquiry("lead", { notes: "Follow up" })).toBe(false);
    db.upsert.mockResolvedValue({ error: null });
    expect(await actions.updateEnquiry("lead", { notes: "Follow up" })).toBe(true);
    expect(db.upsert).toHaveBeenLastCalledWith(expect.objectContaining({ collection: "enquiries", id: "lead", data: expect.objectContaining({ notes: "Follow up" }) }));
  });
});