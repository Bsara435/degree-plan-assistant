import Image from "next/image";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--primary-blue)] text-white shadow-md shadow-[rgba(18,8,75,0.2)]">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <Image
              src="/Project Assets/logo-cle-white.png"
              alt="DegreePlan.AI Logo"
              width={32}
              height={32}
              priority
            />
          </div>
          <div>
            <p className="text-sm text-white/70">DegreePlan.AI</p>
            <p className="text-lg font-semibold leading-tight">Your journey, guided.</p>
          </div>
        </div>

        <Link
          href="/settings"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary-blue)]"
          aria-label="Open settings"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.4 15a1.9 1.9 0 0 0 .38 2.09l.05.05a2.3 2.3 0 0 1-3.25 3.25l-.05-.05a1.9 1.9 0 0 0-2.09-.38 1.9 1.9 0 0 0-1.15 1.74V22a2.3 2.3 0 0 1-4.6 0v-.06a1.9 1.9 0 0 0-1.15-1.73 1.9 1.9 0 0 0-2.09.37l-.05.05a2.3 2.3 0 0 1-3.25-3.25l.05-.05A1.9 1.9 0 0 0 5 15.05a1.9 1.9 0 0 0-1.74-1.15H3.2a2.3 2.3 0 0 1 0-4.6h.06A1.9 1.9 0 0 0 5 8.15a1.9 1.9 0 0 0-.37-2.09l-.05-.05a2.3 2.3 0 0 1 3.25-3.25l.05.05A1.9 1.9 0 0 0 10.05 3a1.9 1.9 0 0 0 1.15-1.74V1.2a2.3 2.3 0 0 1 4.6 0v.06A1.9 1.9 0 0 0 17 3a1.9 1.9 0 0 0 2.09-.37l.05-.05a2.3 2.3 0 0 1 3.25 3.25l-.05.05A1.9 1.9 0 0 0 20.8 8.2h-.06A1.9 1.9 0 0 0 19 10.05c0 .73.42 1.37 1.05 1.7.15.08.3.15.46.2"
            />
          </svg>
        </Link>
      </div>
    </header>
  );
}




