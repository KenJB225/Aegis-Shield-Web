import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center py-4 py-18">
      <div className="glass-card w-full max-w-md border border-[#312124]/12 p-8 text-center py-3 py-1 text-sm font-bold text-black w-text-text-6d">
        <h1 className="mt-5 text-3xl font-bold text-black w-text-6d">
          Page Not Found
        </h1>

        <p>
          The page you are trying to visit does not exist or may have been moved.
        </p>

        <Link
          href="/dashboard"
          className="btn-primary mt-8 inline-flex items-center justify-center py-4 py-3"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
