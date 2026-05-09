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

const CATEGORY_KEYWORDS = {
  housing: [
    'housing',
    'house',
    'shelter',
    'stay',
    'sleep',
    'rent',
    'tenant',
    'landlord',
    'homeless',
    'eviction',
    'room',
    'apartment',
  ],
  legal_aid: [
    'legal',
    'lawyer',
    'claim',
    'refugee claim',
    'basis of claim',
    'boc',
    'deadline',
    'hearing',
    'appeal',
    'immigration',
    'paperwork',
    'document',
    'form',
    'status',
    'permit',
  ],
  employment: [
    'job',
    'work',
    'employment',
    'resume',
    'interview',
    'career',
    'credential',
    'training',
    'skills',
    'hire',
    'hiring',
    'income',
  ],
};

function normalize(text) {
  return String(text ?? '').toLowerCase();
}

function inferCategoriesFromMessage(message) {
  const text = normalize(message);
  if (!text) return [];

  return Object.entries(CATEGORY_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([category]) => category);
}

function countKeywordMatches(resource, keywords) {
  const haystack = normalize(
    [
      resource.name,
      resource.description,
      resource.notes,
      resource.categories?.join(' '),
    ].join(' ')
  );

  return keywords.reduce(
    (count, keyword) => count + (haystack.includes(keyword) ? 1 : 0),
    0
  );
}

/**
 * Returns at most 8 resources matching the user's province and status,
 * ranked by onboarding needs first, then message-level intent and resource text.
 *
 * @param {Array}  resources - full resources.json array
 * @param {string} province  - onboarding province id ('on' | 'bc' | 'other')
 * @param {string} status    - immigration status string from onboarding
 * @param {Array}  needs     - onboarding need ids, e.g. ['housing', 'legal']
 * @param {string} message   - latest user message, used for lightweight re-ranking
 * @returns {Array} up to 8 resources
 */
export function filterResources(resources, province, status, needs = [], message = '') {
  // If every requested need is explicitly out of scope, return nothing —
  // the empty filteredResources forces the AI to invoke rule 3 (call 211).
  if (needs.length > 0 && needs.every((n) => UNSUPPORTED_NEEDS.has(n))) {
    return [];
  }

  const provinceCode = PROVINCE_CODE[province] ?? province?.toUpperCase();
  const wantedCategories = needs.map((n) => NEED_TO_CATEGORY[n] ?? n);
  const inferredCategories = inferCategoriesFromMessage(message);
  const activeCategories = [...new Set([...wantedCategories, ...inferredCategories])];

  // Hard filter 1: resource must serve the user's province
  let pool = resources.filter(
    (r) => provinceCode && r.provinces.includes(provinceCode)
  );

  // Hard filter 2: status must match OR eligible_statuses is empty (universal)
  pool = pool.filter(
    (r) =>
      r.eligible_statuses.length === 0 || r.eligible_statuses.includes(status)
  );

  const ranked = pool
    .map((resource, index) => {
      let score = 0;

      for (const category of resource.categories) {
        if (wantedCategories.includes(category)) score += 60;
        if (inferredCategories.includes(category)) score += 90;
        if (activeCategories.includes(category)) {
          score += countKeywordMatches(resource, CATEGORY_KEYWORDS[category] ?? []) * 3;
        }
      }

      // Prefer resources that explicitly support the user's status over universal
      // resources when both are otherwise relevant.
      if (resource.eligible_statuses.includes(status)) score += 12;
      if (resource.eligible_statuses.length === 0) score += 4;

      return { resource, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return ranked.map((item) => item.resource).slice(0, 8);
}
