import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl text-zinc-400">Page not found</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
      >
        Go back home
      </Link>
    </div>
  );
}
