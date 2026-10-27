import { describe, expect, it } from "vitest";
import { leaderboard } from "./leaderboard";
import type { Agent, Sale } from "./types";

const ag = (id: string): Agent => ({ id, code: id, name: id, phone: "", active: true, joinedAt: "2026-01-01" });
const sale = (agentId: string, date: string, price: number, status: Sale["status"] = "Completed"): Sale => ({
  id: Math.random().toString(), receiptNo: "", agentId, propertyId: "", propertyRef: "", propertyTitle: "", buyerName: "", buyerPhone: "",
  price, amountPaid: price, commission: 0, method: "Cash", date, status, createdAt: "",
});

describe("leaderboard", () => {
  it("counts only completed sales in the selected year", () => {
    const rows = leaderboard([ag("a")], [sale("a", "2026-03-01", 1), sale("a", "2025-03-01", 1), sale("a", "2026-04-01", 1, "Cancelled")], "2026");
    expect(rows[0]!.count).toBe(1);
  });
  it("ranks by number of sales before value", () => {
    const rows = leaderboard([ag("a"), ag("b")], [sale("a", "2026-01-01", 100), sale("b", "2026-01-01", 1), sale("b", "2026-02-01", 1)], "2026");
    expect(rows[0]!.agent.id).toBe("b");
  });
  it("marks equal count and value as a tie", () => {
    const rows = leaderboard([ag("a"), ag("b")], [sale("a", "2026-01-01", 5), sale("b", "2026-01-01", 5)], "2026");
    expect(rows[0]!.tied && rows[1]!.tied && rows[1]!.rank === 1).toBe(true);
  });
});
