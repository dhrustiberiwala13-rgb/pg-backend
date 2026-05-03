const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");

describe("app", () => {
  it("GET /health returns structure", async () => {
    const res = await request(app).get("/health");
    assert.equal(typeof res.body.ok, "boolean");
    assert.ok(res.body.timestamp);
  });

  it("unknown route is 404", async () => {
    await request(app).get("/no-such-route").expect(404);
  });
});
