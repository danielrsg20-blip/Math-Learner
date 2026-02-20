import { describe, expect, it } from "vitest";
import { LEVEL_DEFINITIONS, getLevelDefinition } from "../levelConfig";

describe("Level Config", () => {
  it("should define exactly 20 levels", () => {
    expect(LEVEL_DEFINITIONS).toHaveLength(20);
  });

  it("should follow alternating grade pattern", () => {
    expect(getLevelDefinition(1).gradeTags).toEqual(["grade1"]);
    expect(getLevelDefinition(2).gradeTags).toEqual(["grade1", "grade2"]);
    expect(getLevelDefinition(3).gradeTags).toEqual(["grade2"]);
    expect(getLevelDefinition(4).gradeTags).toEqual(["grade2", "grade3"]);
    expect(getLevelDefinition(5).gradeTags).toEqual(["grade3"]);
    expect(getLevelDefinition(10).gradeTags).toEqual(["grade5", "grade6"]);
    expect(getLevelDefinition(11).gradeTags).toEqual(["grade6"]);
    expect(getLevelDefinition(14).gradeTags).toEqual(["grade4", "grade6"]);
    expect(getLevelDefinition(18).gradeTags).toEqual(["grade4", "grade5", "grade6"]);
    expect(getLevelDefinition(20).gradeTags).toEqual(["grade5", "grade6"]);
  });

  it("should increase time limits by 60 seconds every two levels", () => {
    expect(getLevelDefinition(1).timeLimitSeconds).toBe(90);
    expect(getLevelDefinition(2).timeLimitSeconds).toBe(90);
    expect(getLevelDefinition(3).timeLimitSeconds).toBe(150);
    expect(getLevelDefinition(4).timeLimitSeconds).toBe(150);
    expect(getLevelDefinition(5).timeLimitSeconds).toBe(210);
    expect(getLevelDefinition(6).timeLimitSeconds).toBe(210);
    expect(getLevelDefinition(7).timeLimitSeconds).toBe(270);
    expect(getLevelDefinition(8).timeLimitSeconds).toBe(270);
    expect(getLevelDefinition(9).timeLimitSeconds).toBe(330);
    expect(getLevelDefinition(10).timeLimitSeconds).toBe(330);
    expect(getLevelDefinition(11).timeLimitSeconds).toBe(390);
    expect(getLevelDefinition(12).timeLimitSeconds).toBe(390);
    expect(getLevelDefinition(13).timeLimitSeconds).toBe(450);
    expect(getLevelDefinition(14).timeLimitSeconds).toBe(450);
    expect(getLevelDefinition(15).timeLimitSeconds).toBe(510);
    expect(getLevelDefinition(16).timeLimitSeconds).toBe(510);
    expect(getLevelDefinition(17).timeLimitSeconds).toBe(570);
    expect(getLevelDefinition(18).timeLimitSeconds).toBe(570);
    expect(getLevelDefinition(19).timeLimitSeconds).toBe(630);
    expect(getLevelDefinition(20).timeLimitSeconds).toBe(630);
  });
});
