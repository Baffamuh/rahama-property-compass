import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { COMPANY } from "@/lib/format";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="text-xl font-bold">{COMPANY.name}</h3>
          <p className="mt-2 text-sm opacity-80">RC NO. {COMPANY.rc} · Trusted land and property partner in Azare and across Bauchi State.</p>
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-accent">Explore</h4>
          <Link to="/properties" className="block opacity-80 hover:opacity-100">Properties</Link>
          <Link to="/zones" className="block opacity-80 hover:opacity-100">Browse by zone</Link>
          <Link to="/services" className="block opacity-80 hover:opacity-100">Services</Link>
          <Link to="/about" className="block opacity-80 hover:opacity-100">About us</Link>
          <Link to="/privacy" className="block opacity-80 hover:opacity-100">Privacy & disclaimer</Link>
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-accent">Contact</h4>
          <p className="flex gap-2 opacity-80"><MapPin className="h-4 w-4 shrink-0" />{COMPANY.address}</p>
          {COMPANY.phones.map((p) => (
            <p key={p} className="flex gap-2 opacity-80"><Phone className="h-4 w-4" />{p}</p>
          ))}
          <p className="flex gap-2 opacity-80"><Mail className="h-4 w-4" />{COMPANY.email}</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-5 text-center text-xs opacity-70">
        © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
      </div>
    </footer>
  );
}
