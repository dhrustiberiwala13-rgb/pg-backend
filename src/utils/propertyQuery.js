/** Escape special regex characters for safe user-supplied search */
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPropertyFilter(query) {
  const filter = { active: true };

  if (query.location) {
    filter.location = new RegExp(escapeRegex(query.location), "i");
  }

  if (query.gender) {
    filter.gender = new RegExp(`^${escapeRegex(query.gender)}$`, "i");
  }

  const price = {};
  if (query.minPrice != null && query.minPrice !== "") {
    price.$gte = Number(query.minPrice);
  }
  if (query.maxPrice != null && query.maxPrice !== "") {
    price.$lte = Number(query.maxPrice);
  }
  if (Object.keys(price).length) {
    filter.price = price;
  }

  if (query.search && String(query.search).trim()) {
    filter.$text = { $search: String(query.search).trim() };
  }

  return filter;
}

function parsePagination(query, { defaultLimit, maxLimit }) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const raw = parseInt(query.limit, 10);
  const fallback = Number.isFinite(raw) ? raw : defaultLimit;
  const limit = Math.min(maxLimit, Math.max(1, fallback));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

module.exports = { escapeRegex, buildPropertyFilter, parsePagination };
