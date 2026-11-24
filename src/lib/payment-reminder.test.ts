import { describe, expect, it } from "vitest";
import { PAYMENT_REMINDER } from "./payment-reminder";

describe("admin payment reminder", () => {
  it("requests the remaining ₦115,000", () => {
    expect(PAYMENT_REMINDER.amount).toBe(115000);
  });
  it("sets the deadline to 3 December 2026", () => {
    expect(PAYMENT_REMINDER.dueDate).toBe("2026-12-03");
  });
});