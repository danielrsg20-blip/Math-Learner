import { describe, expect, it } from "vitest";
import { LEVEL_DEFINITIONS, getLevelDefinition } from "../levelConfig";

describe("Level Config", () => {
  it("should define exactly 10 levels", () => {
    expect(LEVEL_DEFINITIONS).toHaveLength(10);
  });

  it("should follow alternating grade pattern", () => {
    expect(getLevelDefinition(1).gradeTags).toEqual(["grade1"]);
    expect(getLevelDefinition(2).gradeTags).toEqual(["grade1", "grade2"]);
    expect(getLevelDefinition(3).gradeTags).toEqual(["grade2"]);
    expect(getLevelDefinition(4).gradeTags).toEqual(["grade2", "grade3"]);
    expect(getLevelDefinition(5).gradeTags).toEqual(["grade3"]);
    expect(getLevelDefinition(10).gradeTags).toEqual(["grade5", "grade6"]);
  });
});
