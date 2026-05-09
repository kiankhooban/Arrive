import { Link } from 'react-router-dom';

// Day 2 placeholder — full hero + privacy + how-it-works built then
export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-stone-50 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">
        Find the support you need, in Canada.
      </h1>
      <p className="max-w-md text-lg text-gray-500">
        Tell us your situation and we'll connect you with verified settlement services — instantly.
      </p>
      <Link
        to="/onboard"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
      >
        Get Started
      </Link>
      <p className="text-xs text-gray-500">
        Landing coming Day 2 — full hero, privacy statement, how-it-works
      </p>
    </div>
  );
}
