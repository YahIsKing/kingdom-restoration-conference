import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-olive/10">
          <svg
            className="h-10 w-10 text-olive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="font-heading text-3xl font-bold text-royal">
          Registration Complete!
        </h1>

        <p className="mt-4 text-royal/70">
          Thank you for registering for the Kingdom Restoration Conference 2026.
          We&apos;re excited to have you join us!
        </p>

        <div className="mt-8 rounded-xl bg-beige p-6 text-left">
          <h2 className="font-heading text-lg font-semibold text-royal">
            What&apos;s Next?
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-royal/80">
            <li className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-olive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>
                Check your email for a confirmation with all the event details.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-olive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>
                Book your room at the Hilton Knoxville Airport using our group
                rate.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-olive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                Mark your calendar for July 9-12, 2026!
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="https://groups.hilton.com/search-events/ca24f4c7-9edd-4c66-8337-d113947a321d/property/28838b5e-80d3-4ac3-a671-9e6f3f65a64c?search_type=redirect"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-olive px-6 py-3 font-semibold text-white transition-all hover:bg-olive-light"
          >
            Book Hotel Room
          </a>
          <Link
            href="/"
            className="rounded-lg border-2 border-royal px-6 py-3 font-semibold text-royal transition-all hover:bg-royal hover:text-beige"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
