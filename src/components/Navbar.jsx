import { Link } from 'react-router-dom';

function CompassIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function Navbar() {
  return (
    <header className="border-b border-stone-200 bg-stone-50">
      <nav
        className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5"
        aria-label="Primary"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg px-1 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
          aria-label="Arrive — home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
            <CompassIcon />
          </span>
          <span className="text-lg font-semibold tracking-tight text-neutral-900">
            Arrive
          </span>
        </Link>
        {/* Right side intentionally empty per spec */}
        <span className="sr-only">No additional navigation items.</span>
      </nav>
    </header>
  );
}
