import ResourceCard from './ResourceCard';

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

/* ---------- Loading bubble — 3 pulsing dots ---------- */
export function LoadingBubble() {
  return (
    <div
      className="flex justify-start"
      aria-live="polite"
      aria-label="Assistant is typing"
    >
      <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="dot h-2 w-2 rounded-full bg-gray-400" />
          <span className="dot h-2 w-2 rounded-full bg-gray-400" />
          <span className="dot h-2 w-2 rounded-full bg-gray-400" />
        </div>
      </div>
    </div>
  );
}

/* ---------- User bubble ---------- */
export function UserBubble({ text }) {
  return (
    <div className="flex justify-end fade-up">
      <div className="max-w-[85%] rounded-2xl bg-teal-700 px-4 py-3 text-base leading-relaxed text-white sm:max-w-[75%] sm:px-5 sm:py-3.5">
        {text}
      </div>
    </div>
  );
}

/* ---------- Disclaimer — below every AI message ---------- */
function Disclaimer() {
  return (
    <p className="mt-2 ml-1 text-xs leading-relaxed text-gray-500 sm:ml-2">
      This is not legal advice. For legal matters, consult a lawyer or legal aid clinic.
    </p>
  );
}

/* ---------- AI bubble ----------
   blocks: Array<{ type: 'text' | 'resource', content: string } | { type: 'resource', resource: object }>
   streaming: boolean — shows blinking caret on last text block
   error: boolean — shows amber alert + retry button
   onRetry: () => void
*/
export function AIBubble({ blocks = [], streaming = false, error = false, onRetry }) {
  return (
    <div className="flex flex-col items-start fade-up">
      <div className="w-full max-w-[92%] rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:max-w-[85%] sm:p-5">
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle size={18} className="shrink-0 text-amber-700" />
            <div className="flex-1">
              <p className="font-medium">We couldn't reach the assistant just now.</p>
              <p className="mt-1 text-amber-800">
                Showing trusted resources from your situation. You can retry below.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {blocks.map((block, i) => {
            if (block.type === 'text') {
              const isLast = i === blocks.length - 1;
              return (
                <p key={i} className="text-base leading-relaxed text-neutral-900">
                  {block.content}
                  {streaming && isLast && (
                    <span className="caret" aria-hidden="true" />
                  )}
                </p>
              );
            }
            if (block.type === 'resource') {
              return <ResourceCard key={i} {...block.resource} />;
            }
            return null;
          })}
        </div>

        {error && onRetry && (
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
      <Disclaimer />
    </div>
  );
}
