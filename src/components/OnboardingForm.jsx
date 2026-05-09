import { useState } from 'react';

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

const CheckIcon = (p) => (
  <Icon {...p} d={<path d="M20 6 9 17l-5-5" />} stroke={2.5} />
);
const ArrowLeft = (p) => (
  <Icon {...p} d={<><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>} />
);
const ArrowRight = (p) => (
  <Icon {...p} d={<><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>} />
);
const MapPin = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </>
    }
  />
);
const Home = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </>
    }
  />
);
const Scale = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </>
    }
  />
);
const Briefcase = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <rect width="20" height="14" x="2" y="6" rx="2" />
      </>
    }
  />
);
const FileText = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
      </>
    }
  />
);
const IdCard = (p) => (
  <Icon
    {...p}
    d={
      <>
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <path d="M8 10h.01" />
        <path d="M14 10h6" />
        <path d="M14 14h6" />
        <path d="M6 18a3 3 0 0 1 6 0" />
      </>
    }
  />
);
const GraduationCap = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
        <path d="M22 10v6" />
        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
      </>
    }
  />
);
const HelpCircle = (p) => (
  <Icon
    {...p}
    d={
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </>
    }
  />
);
const Globe = (p) => (
  <Icon
    {...p}
    d={
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </>
    }
  />
);

/* ---------- Progress bar ---------- */
function Progress({ step, total }) {
  const percent = (step / total) * 100;
  return (
    <div className="mx-auto max-w-3xl px-6 pt-10" role="group" aria-label="Progress">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-teal-700" aria-live="polite">
          Step {step} of {total}
        </p>
        <p className="text-sm text-gray-500">About 1 minute</p>
      </div>
      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-200"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-teal-700 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- Selectable card ----------
   Three selection signals per spec §5:
   1. border-2 border-teal-700
   2. bg-teal-50
   3. filled checkmark badge
*/
function SelectCard({ icon, title, description, selected, onClick, multi = false }) {
  const role = multi ? 'checkbox' : 'radio';
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      aria-label={title}
      onClick={onClick}
      className={[
        'group relative flex w-full min-h-24 items-start gap-4 rounded-2xl border-2 p-5 text-left transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50',
        'sm:p-6',
        selected
          ? 'border-teal-700 bg-teal-50 shadow-sm'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm',
      ].join(' ')}
    >
      {/* Icon container */}
      <span
        className={[
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition',
          selected ? 'bg-teal-700 text-white' : 'bg-stone-100 text-teal-700',
        ].join(' ')}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Text */}
      <span className="flex-1 pt-1">
        <span className="block text-base font-semibold text-neutral-900 sm:text-lg">
          {title}
        </span>
        {description && (
          <span className="mt-1 block text-sm leading-relaxed text-gray-500">
            {description}
          </span>
        )}
      </span>

      {/* Checkmark badge — signal 3 */}
      <span
        className={[
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition',
          selected
            ? 'border-teal-700 bg-teal-700 text-white'
            : 'border-stone-300 bg-white text-transparent',
        ].join(' ')}
        aria-hidden="true"
      >
        <CheckIcon size={16} />
      </span>
    </button>
  );
}

/* ---------- Step data ---------- */
const PROVINCES = [
  {
    id: 'on',
    title: 'Ontario',
    description: 'Toronto, Ottawa, Hamilton, and other cities',
    icon: <MapPin size={22} />,
  },
  {
    id: 'bc',
    title: 'British Columbia',
    description: 'Vancouver, Surrey, Victoria, and other cities',
    icon: <MapPin size={22} />,
  },
  {
    id: 'other',
    title: 'Somewhere else in Canada',
    description: "We'll connect you with national support lines like 211.",
    icon: <Globe size={22} />,
  },
];

const NEEDS = [
  {
    id: 'housing',
    title: 'Housing',
    description: 'Shelters, rental support, finding a place to live',
    icon: <Home size={22} />,
  },
  {
    id: 'legal_aid',
    title: 'Legal aid',
    description: 'Immigration paperwork, refugee claims, free lawyers',
    icon: <Scale size={22} />,
  },
  {
    id: 'employment',
    title: 'Employment',
    description: 'Finding work, credential recognition, skills training',
    icon: <Briefcase size={22} />,
  },
];

const STATUSES = [
  {
    id: 'refugee_claimant',
    title: 'Refugee claimant',
    description: 'I have made or will make a refugee claim in Canada',
    icon: <FileText size={22} />,
  },
  {
    id: 'permanent_resident',
    title: 'Permanent resident',
    description: 'I have or am applying for PR status',
    icon: <IdCard size={22} />,
  },
  {
    id: 'study_work_permit',
    title: 'Study or work permit',
    description: "I'm in Canada on a temporary permit",
    icon: <GraduationCap size={22} />,
  },
  {
    id: 'other',
    title: "Something else / I'd rather not say",
    description: "We'll show you general resources",
    icon: <HelpCircle size={22} />,
  },
];

/* ---------- Main component ----------
   Props:
     onComplete({ province, needs, status }) — called when all 3 steps are done
*/
export default function OnboardingForm({ onComplete }) {
  const [step, setStep] = useState(1);
  const [province, setProvince] = useState(null);
  const [needs, setNeeds] = useState([]);
  const [status, setStatus] = useState(null);

  const TOTAL = 3;

  const canContinue =
    (step === 1 && !!province) ||
    (step === 2 && needs.length > 0) ||
    (step === 3 && !!status);

  function goNext() {
    if (!canContinue) return;
    if (step < TOTAL) {
      setStep((s) => s + 1);
    } else {
      onComplete({ province, needs, status });
    }
  }

  function goBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  function toggleNeed(id) {
    setNeeds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  }

  return (
    <div>
      <Progress step={step} total={TOTAL} />

      <main className="mx-auto max-w-3xl px-6 py-10 sm:py-12">
        {/* Step 1 — Province */}
        {step === 1 && (
          <section aria-labelledby="step1-heading">
            <h1
              id="step1-heading"
              className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl"
            >
              Where are you in Canada?
            </h1>
            <p className="mt-3 text-base leading-relaxed text-gray-500 sm:text-lg">
              We'll prioritize services available in your province.
            </p>
            <div
              className="mt-8 flex flex-col gap-3"
              role="radiogroup"
              aria-label="Province"
            >
              {PROVINCES.map((p) => (
                <SelectCard
                  key={p.id}
                  icon={p.icon}
                  title={p.title}
                  description={p.description}
                  selected={province === p.id}
                  onClick={() => setProvince(p.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Step 2 — Needs (multi-select) */}
        {step === 2 && (
          <section aria-labelledby="step2-heading">
            <h1
              id="step2-heading"
              className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl"
            >
              What do you need help with?
            </h1>
            <p className="mt-3 text-base leading-relaxed text-gray-500 sm:text-lg">
              Pick everything that applies — you can choose more than one.
            </p>
            <div
              className="mt-8 flex flex-col gap-3"
              role="group"
              aria-label="Areas of help"
            >
              {NEEDS.map((n) => (
                <SelectCard
                  key={n.id}
                  icon={n.icon}
                  title={n.title}
                  description={n.description}
                  multi
                  selected={needs.includes(n.id)}
                  onClick={() => toggleNeed(n.id)}
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500" aria-live="polite">
              {needs.length === 0 ? 'None selected yet.' : `${needs.length} selected.`}
            </p>
          </section>
        )}

        {/* Step 3 — Immigration status */}
        {step === 3 && (
          <section aria-labelledby="step3-heading">
            <h1
              id="step3-heading"
              className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl"
            >
              What is your immigration status?
            </h1>
            <p className="mt-3 text-base leading-relaxed text-gray-500 sm:text-lg">
              This helps us point you to the right kind of legal and settlement support.
            </p>
            <div className="mt-4 inline-flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <span aria-hidden="true">·</span>
              Your answer is private and never shared with any government agency.
            </div>
            <div
              className="mt-6 flex flex-col gap-3"
              role="radiogroup"
              aria-label="Immigration status"
            >
              {STATUSES.map((s) => (
                <SelectCard
                  key={s.id}
                  icon={s.icon}
                  title={s.title}
                  description={s.description}
                  selected={status === s.id}
                  onClick={() => setStatus(s.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Navigation row */}
        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-base font-medium text-neutral-900 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-gray-500 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
          >
            {step === TOTAL ? 'See my matches' : 'Continue'}
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Privacy footer reinforcement */}
        <p className="mt-12 text-center text-xs text-gray-500">
          Arrive does not log your conversations or share information with IRCC, CBSA, or any government agency.
        </p>
      </main>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .transition { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
