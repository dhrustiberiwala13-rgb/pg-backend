const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  escapeRegex,
  buildPropertyFilter,
  parsePagination,
} = require("../src/utils/propertyQuery");

describe("escapeRegex", () => {
  it("escapes metacharacters", () => {
    assert.equal(escapeRegex("a.b*c"), "a\\.b\\*c");
  });
});

describe("buildPropertyFilter", () => {
  it("defaults to active listings", () => {
    const f = buildPropertyFilter({});
    assert.equal(f.active, true);
  });

  it("applies location substring", () => {
    const f = buildPropertyFilter({ location: "Mumbai" });
    assert.ok(f.location instanceof RegExp);
    assert.match("north mumbai", f.location);
  });
});

describe("parsePagination", () => {
  const opts = { defaultLimit: 10, maxLimit: 50 };

  it("clamps limit", () => {
    const p = parsePagination({ page: "1", limit: "999" }, opts);
    assert.equal(p.limit, 50);
  });
});
