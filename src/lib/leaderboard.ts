import type { Agent, Sale } from "./types";

export interface LeaderRow { agent: Agent; count: number; value: number; commission: number; rank: number; tied: boolean }

/** Ranks agents by completed sales in a year ("all" = all time).
 * Rule: most completed sales first, then highest total value. Equal on both = tie (no winner chosen). */
export function leaderboard(agents: Agent[], sales: Sale[], year: string): LeaderRow[] {
  const rows = agents.map((agent) => {
    const mine = sales.filter((s) => s.agentId === agent.id && s.status === "Completed" && (year === "all" || s.date.startsWith(year)));
    return { agent, count: mine.length, value: mine.reduce((t, s) => t + s.price, 0), commission: mine.reduce((t, s) => t + s.commission, 0), rank: 0, tied: false };
  });
  rows.sort((a, b) => b.count - a.count || b.value - a.value);
  rows.forEach((r, i) => {
    const prev = rows[i - 1];
    r.rank = prev && prev.count === r.count && prev.value === r.value ? prev.rank : i + 1;
  });
  rows.forEach((r) => { r.tied = rows.filter((x) => x.rank === r.rank).length > 1; });
  return rows;
}
