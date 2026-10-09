/**
 * Episodic memory event schema — validated on append.
 */

export const CONFIDENCE = ["fact", "hypothesis", "verified"];
export const SOURCES = ["issue_tracker", "sql", "qa", "code", "pr", "docs", "mcp", "other"];

/**
 * @param {Record<string, unknown>} input
 * @returns {Record<string, unknown>}
 */
export function normalizeEvent(input) {
  const now = new Date().toISOString();
  const confidence = String(input.confidence || "hypothesis").toLowerCase();
  const source = String(input.source || "other").toLowerCase();

  if (!CONFIDENCE.includes(confidence)) {
    throw new Error(`confidence must be one of: ${CONFIDENCE.join(", ")}`);
  }
  if (!SOURCES.includes(source)) {
    throw new Error(`source must be one of: ${SOURCES.join(", ")}`);
  }

  const symptom = String(input.symptom || "").trim();
  const decision = String(input.decision || "").trim();
  if (!symptom) throw new Error("symptom is required");
  if (!decision) throw new Error("decision is required");

  const sources = Array.isArray(input.sources)
    ? input.sources.map((s) => String(s).trim()).filter(Boolean)
    : input.sources
      ? [String(input.sources).trim()]
      : [];

  if (sources.length === 0) {
    throw new Error("sources is required — at least one path, URL, or reference");
  }

  const tags = Array.isArray(input.tags)
    ? input.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
    : [];

  return {
    id: input.id || crypto.randomUUID(),
    timestamp: input.timestamp || now,
    issueKey: input.issueKey ? String(input.issueKey).toUpperCase() : null,
    client: input.client ? String(input.client).trim().toLowerCase() : null,
    symptom,
    evidence: String(input.evidence || "").trim() || null,
    decision,
    confidence,
    source,
    sources,
    tags,
    expiresAt: input.expiresAt ? String(input.expiresAt) : null,
    relatedEntities: Array.isArray(input.relatedEntities)
      ? input.relatedEntities.map((e) => String(e).trim()).filter(Boolean)
      : [],
  };
}

/**
 * @param {MemoryEvent} event
 * @returns {boolean}
 */
export function isExpired(event) {
  if (!event.expiresAt) return false;
  const exp = Date.parse(event.expiresAt);
  if (Number.isNaN(exp)) return false;
  return Date.now() > exp;
}
