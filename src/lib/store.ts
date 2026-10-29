// Local mock data store. Persists to localStorage so the demo feels real.
// Swap the functions below for database calls when connecting a backend.
import { useSyncExternalStore } from "react";
import { sampleActivity, sampleEnquiries, sampleProperties } from "./sample-data";
import { sampleZones } from "./locations";
import type { Activity, Agent, Enquiry, Property, Sale, SubZone, Zone } from "./types";

interface State {
  properties: Property[];
  enquiries: Enquiry[];
  activity: Activity[];
  zones: Zone[];
  agents: Agent[];
  sales: Sale[];
}

const KEY = "rahama-store-v1";
const initial: State = { properties: sampleProperties, enquiries: sampleEnquiries, activity: sampleActivity, zones: sampleZones, agents: [], sales: [] };
let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<State>;
      state = { ...initial, ...saved, zones: saved.zones ?? sampleZones, agents: saved.agents ?? [], sales: saved.sales ?? [] };
    }
  } catch {
    /* ignore */
  }
}

function set(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    void import("sonner").then(({ toast }) => toast.error("Browser storage is full — remove some photos. Changes may not be kept after reload."));
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
  addZone(name: string, town: string) {
    set({ ...state, zones: [...state.zones, { id: uid(), name, town, subZones: [] }], activity: [log(`Added zone ${name}`), ...state.activity] });
  },
  updateZone(id: string, patch: Partial<Omit<Zone, "id" | "subZones">>) {
    set({ ...state, zones: state.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)) });
  },
  deleteZone(id: string) {
    set({ ...state, zones: state.zones.filter((z) => z.id !== id) });
  },
  addSubZone(zoneId: string, name: string) {
    editZone(zoneId, (z) => ({ ...z, subZones: [...z.subZones, { id: uid(), name, areas: [] }] }));
  },
  updateSubZone(zoneId: string, subId: string, name: string) {
    editSub(zoneId, subId, (s) => ({ ...s, name }));
  },
  deleteSubZone(zoneId: string, subId: string) {
    editZone(zoneId, (z) => ({ ...z, subZones: z.subZones.filter((s) => s.id !== subId) }));
  },
  addAreas(zoneId: string, subId: string, names: string[]) {
    editSub(zoneId, subId, (s) => ({ ...s, areas: [...new Set([...s.areas, ...names])] }));
  },
  deleteArea(zoneId: string, subId: string, area: string) {
    editSub(zoneId, subId, (s) => ({ ...s, areas: s.areas.filter((a) => a !== area) }));
  },
  saveAgent(a: Agent) {
    const exists = state.agents.some((x) => x.id === a.id);
    set({ ...state, agents: exists ? state.agents.map((x) => (x.id === a.id ? a : x)) : [...state.agents, a], activity: [log(`${exists ? "Updated" : "Added"} agent ${a.name}`), ...state.activity] });
  },
  recordSale(s: Omit<Sale, "id" | "receiptNo" | "status" | "createdAt">): Sale {
    const year = s.date.slice(0, 4);
    const n = state.sales.filter((x) => x.receiptNo.includes(`-${year}-`)).length + 1;
    const sale: Sale = { ...s, id: uid(), receiptNo: `RHM-RCP-${year}-${String(n).padStart(4, "0")}`, status: "Completed", createdAt: new Date().toISOString() };
    set({
      ...state,
      sales: [sale, ...state.sales],
      properties: state.properties.map((p) => (p.id === s.propertyId ? { ...p, status: "Sold" } : p)),
      activity: [log(`Sale recorded: ${s.propertyRef} (${sale.receiptNo})`), ...state.activity],
    });
    return sale;
  },
  cancelSale(id: string) {
    const s = state.sales.find((x) => x.id === id);
    set({ ...state, sales: state.sales.map((x) => (x.id === id ? { ...x, status: "Cancelled" } : x)), activity: [log(`Sale ${s?.receiptNo} cancelled`), ...state.activity] });
  },
  reset() {
    set(initial);
  },
  newId: uid,
};

function editZone(id: string, fn: (z: Zone) => Zone) {
  set({ ...state, zones: state.zones.map((z) => (z.id === id ? fn(z) : z)) });
}
function editSub(zoneId: string, subId: string, fn: (s: SubZone) => SubZone) {
  editZone(zoneId, (z) => ({ ...z, subZones: z.subZones.map((s) => (s.id === subId ? fn(s) : s)) }));
}

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
