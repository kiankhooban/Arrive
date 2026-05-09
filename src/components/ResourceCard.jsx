/* ---------- Inline SVG icon primitive ---------- */
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

const ShieldCheck = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </>
    }
  />
);

const ExternalLink = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </>
    }
  />
);

const Phone = (p) => (
  <Icon
    {...p}
    d={
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    }
  />
);

/* ---------- Category label map ---------- */
const CATEGORY_LABELS = {
  housing: 'Housing',
  legal_aid: 'Legal Aid',
  employment: 'Employment',
};

/* ---------- Verified stamp — the visual differentiator ---------- */
function VerifiedStamp({ date }) {
  // Format "2026-05-08" → "May 8, 2026"
  const formatted = new Date(date + 'T12:00:00').toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800"
      aria-label={`Verified on ${formatted}`}
    >
      <ShieldCheck size={14} stroke={2.25} />
      <span className="tracking-wide">Verified {formatted}</span>
    </span>
  );
}

/* ---------- Category pill ---------- */
function CategoryPill({ category }) {
  const label = CATEGORY_LABELS[category] ?? category;
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
      {label}
    </span>
  );
}

/* ---------- ResourceCard ----------
   Props match the locked resource schema:
     id, name, description, categories, url, phone, last_verified, notes
*/
export default function ResourceCard({ name, categories = [], description, phone, url, last_verified }) {
  // Build accessible label per spec
  const categoryLabel = categories.map((c) => CATEGORY_LABELS[c] ?? c).join(', ');
  const verifiedFormatted = new Date(last_verified + 'T12:00:00').toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const ariaLabel = `${name}, ${categoryLabel}, verified ${verifiedFormatted}`;

  return (
    <article
      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
      aria-label={ariaLabel}
    >
      {/* Header row: name + verified stamp */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-neutral-900 sm:text-lg">
          {name}
        </h3>
        {last_verified && <VerifiedStamp date={last_verified} />}
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <CategoryPill key={c} category={c} />
          ))}
        </div>
      )}

      {/* Description */}
      <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
        {description}
      </p>

      {/* Footer row: phone + visit button */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
        {phone ? (
          <a
            href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-900 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label={`Call ${name} at ${phone}`}
          >
            <Phone size={16} className="text-gray-500" />
            {phone}
          </a>
        ) : (
          <span />
        )}

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label={`Visit ${name} website`}
        >
          Visit Website
          <ExternalLink size={14} stroke={2} />
        </a>
      </div>
    </article>
  );
}
