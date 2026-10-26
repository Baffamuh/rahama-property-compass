import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <p className="text-sm font-bold uppercase tracking-widest text-accent">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl opacity-85">{subtitle}</p>}
      </div>
    </section>
  );
}
