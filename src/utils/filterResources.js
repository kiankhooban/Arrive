// Needs that are explicitly out of scope — return empty pool so the AI
// hits rule 3 and directs the user to 211 rather than improvising.
const UNSUPPORTED_NEEDS = new Set(['healthcare', 'education', 'health', 'medical']);

// Onboarding province IDs → resource schema province codes
const PROVINCE_CODE = { on: 'ON', bc: 'BC' };

// Onboarding need IDs → resource schema category strings
// "legal" is the onboarding id; "legal_aid" is the schema category
const NEED_TO_CATEGORY = {
  housing: 'housing',
  legal: 'legal_aid',
  legal_aid: 'legal_aid',
  employment: 'employment',
};

/**
 * Returns at most 8 resources matching the user's province and status,
 * sorted so the user's selected categories come first.
 *
 * @param {Array}  resources - full resources.json array
 * @param {string} province  - onboarding province id ('on' | 'bc' | 'other')
 * @param {string} status    - immigration status string from onboarding
 * @param {Array}  needs     - onboarding need ids, e.g. ['housing', 'legal']
 * @returns {Array} up to 8 resources
 */
export function filterResources(resources, province, status, needs = []) {
  // If every requested need is explicitly out of scope, return nothing —
  // the empty filteredResources forces the AI to invoke rule 3 (call 211).
  if (needs.length > 0 && needs.every((n) => UNSUPPORTED_NEEDS.has(n))) {
    return [];
  }

  const provinceCode = PROVINCE_CODE[province] ?? province?.toUpperCase();
  const wantedCategories = needs.map((n) => NEED_TO_CATEGORY[n] ?? n);

  // Hard filter 1: resource must serve the user's province
  let pool = resources.filter(
    (r) => provinceCode && r.provinces.includes(provinceCode)
  );

  // Hard filter 2: status must match OR eligible_statuses is empty (universal)
  pool = pool.filter(
    (r) =>
      r.eligible_statuses.length === 0 || r.eligible_statuses.includes(status)
  );

  // Soft sort: resources that match at least one wanted category come first
  const priority = pool.filter((r) =>
    r.categories.some((c) => wantedCategories.includes(c))
  );
  const rest = pool.filter(
    (r) => !r.categories.some((c) => wantedCategories.includes(c))
  );

  return [...priority, ...rest].slice(0, 8);
}
