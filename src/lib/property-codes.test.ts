import { describe, expect, it } from "vitest";
import { codePrefix, houseConditions, isCodeTaken, nextCode } from "./property-codes";

describe("property codes", () => {
  it("sale and rent codes differ for the same category", () => {
    expect(codePrefix({ type: "Shop", listing: "Sale" })).toBe("RHM-S-SH-");
    expect(codePrefix({ type: "Shop", listing: "Rent" })).toBe("RHM-R-SH-");
  });
  it("each house condition has its own code", () => {
    expect(codePrefix({ type: "House/Villa", listing: "Sale", condition: "Completed" })).toBe("RHM-S-HC-");
    expect(codePrefix({ type: "House/Villa", listing: "Sale", condition: "Semi-completed" })).toBe("RHM-S-HS-");
    expect(codePrefix({ type: "House/Villa", listing: "Sale", condition: "Incomplete" })).toBe("RHM-S-HI-");
  });
  it("rent houses only allow completed and semi-completed", () => {
    expect(houseConditions("Rent")).toEqual(["Completed", "Semi-completed"]);
    expect(houseConditions("Sale")).toHaveLength(3);
  });
  it("auto code counts within its own category only", () => {
    const existing = [{ ref: "RHM-S-FM-002" }, { ref: "RHM-R-FM-007" }];
    expect(nextCode({ type: "Farm", listing: "Sale" }, existing)).toBe("RHM-S-FM-003");
  });
  it("manual duplicate codes are detected", () => {
    expect(isCodeTaken("rhm-s-fm-002", [{ id: "a", ref: "RHM-S-FM-002" }], "b")).toBe(true);
    expect(isCodeTaken("RHM-S-FM-002", [{ id: "a", ref: "RHM-S-FM-002" }], "a")).toBe(false);
  });
});
