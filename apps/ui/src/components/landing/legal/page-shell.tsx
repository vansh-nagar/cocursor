import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

/** Shared frame for the standalone content pages (docs, changelog, legal). */
export default function PageShell({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl px-6 pt-32 pb-24">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        <h1 className="font-serif text-4xl font-medium tracking-tight text-white">
          {title}
        </h1>
        {intro && <p className="mt-4 text-zinc-400">{intro}</p>}
        {updated && (
          <p className="mt-2 text-xs text-zinc-600">Last updated {updated}</p>
        )}

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-zinc-400">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium text-white">{heading}</h2>
      {children}
    </section>
  );
}
