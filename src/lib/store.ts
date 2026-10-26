// Local mock data store. Persists to localStorage so the demo feels real.
// Swap the functions below for database calls when connecting a backend.
import { useSyncExternalStore } from "react";
import { sampleActivity, sampleEnquiries, sampleProperties } from "./sample-data";
import type { Activity, Enquiry, Property } from "./types";

interface State {
  properties: Property[];
  enquiries: Enquiry[];
  activity: Activity[];
}

const KEY = "rahama-store-v1";
const initial: State = { properties: sampleProperties, enquiries: sampleEnquiries, activity: sampleActivity };
let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw) as State;
  } catch {
    /* ignore */
  }
}

function set(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);

  return () => listeners.delete(l);
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(initial));
}

const uid = () => Math.random().toString(36).slice(2, 10);
const log = (text: string): Activity => ({ id: uid(), text, at: new Date().toISOString() });

export const actions = {
  addEnquiry(e: Omit<Enquiry, "id" | "status" | "notes" | "createdAt">) {
    load();
    const enquiry: Enquiry = { ...e, id: uid(), status: "New", notes: "", createdAt: new Date().toISOString() };
    set({
      ...state,
      enquiries: [enquiry, ...state.enquiries],
      activity: [log(`New enquiry from ${e.name}${e.propertyRef ? ` on ${e.propertyRef}` : ""}`), ...state.activity],
    });
  },
  updateEnquiry(id: string, patch: Partial<Enquiry>) {
    set({ ...state, enquiries: state.enquiries.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  },
  saveProperty(p: Property) {
    const exists = state.properties.some((x) => x.id === p.id);
    set({
      ...state,
      properties: exists ? state.properties.map((x) => (x.id === p.id ? p : x)) : [p, ...state.properties],
      activity: [log(`${exists ? "Updated" : "Created"} ${p.ref}: ${p.title}`), ...state.activity],
    });
  },
  setStatus(id: string, status: Property["status"]) {
    const p = state.properties.find((x) => x.id === id);
    set({
      ...state,
      properties: state.properties.map((x) => (x.id === id ? { ...x, status } : x)),
      activity: [log(`${p?.ref ?? "Listing"} marked ${status}`), ...state.activity],
    });
  },
  deleteProperty(id: string) {
    set({ ...state, properties: state.properties.filter((x) => x.id !== id) });
  },
  reset() {
    set(initial);
  },
  newId: uid,
};

// --- Demo admin session (placeholder until real sign-in is connected) ---
const AUTH_KEY = "rahama-admin";
export const DEMO_ADMIN = { email: "admin@rahamaproperty.ng", password: "rahama2026" };
export const auth = {
  isSignedIn: () => typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "1",
  signIn(email: string, password: string) {
    const ok = email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
    if (ok) sessionStorage.setItem(AUTH_KEY, "1");
    return ok;
  },
  signOut: () => sessionStorage.removeItem(AUTH_KEY),
};
