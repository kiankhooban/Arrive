import ResourceCard from './ResourceCard';

/* ---------- Icon primitive ---------- */
function Icon({ d, size = 20, stroke = 1.75, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {d}
    </svg>
  );
}

const AlertTriangle = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    }
  />
);

const RefreshCw = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </>
    }
  />
);

/* Pick the two cards to show:
   - one housing if available
   - one legal_aid if available
   - otherwise the first two in the array */
function pickFallbackCards(filteredResources) {
  const housing = filteredResources.find((r) => r.categories.includes('housing'));
  const legal = filteredResources.find((r) => r.categories.includes('legal_aid'));
  const chosen = [housing, legal].filter(Boolean);
  return chosen.length > 0 ? chosen : filteredResources.slice(0, 2);
}

/* ---------- DemoFallback ----------
   Rendered in the chat message list when /api/chat fails or times out.

   Props:
     filteredResources  Array  — the pre-filtered resources for this user
     onRetry            func   — optional; renders a "Try again" button
*/
export default function DemoFallback({ filteredResources = [], onRetry }) {
  const cards = pickFallbackCards(filteredResources);

  return (
    <div className="flex flex-col items-start fade-up">
      {/* Offline mode banner */}
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
        Running in offline demo mode
      </div>

      {/* Card — styled like an AI bubble */}
      <div className="w-full max-w-[92%] rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:max-w-[85%] sm:p-5">
        {/* Amber alert strip */}
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle size={18} className="shrink-0 text-amber-700" />
          <p>
            <span className="font-medium">We couldn't reach the assistant just now.</span>{' '}
            Here are two verified resources that match your situation — please follow up with them directly.
          </p>
        </div>

        {/* Resource cards */}
        {cards.length > 0 ? (
          <div className="space-y-4">
            {cards.map((resource) => (
              <ResourceCard key={resource.id} {...resource} />
            ))}
          </div>
        ) : (
          <p className="text-base leading-relaxed text-gray-500">
            No resources are loaded yet. Once the resource database is populated, two verified options will appear here.
          </p>
        )}

        {/* Retry button */}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:border-stone-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        )}
      </div>

      {/* Disclaimer — required below every AI-origin message */}
      <p className="mt-2 ml-1 text-xs leading-relaxed text-gray-500 sm:ml-2">
        This is not legal advice. For legal matters, consult a lawyer or legal aid clinic.
      </p>
    </div>
  );
}
