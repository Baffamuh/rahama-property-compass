// App data store backed by the Lovable Cloud database (table `app_records`).
// Pages read through `useStore` and write through `actions`; each action updates
// the screen instantly, then saves the changed record to the database.
import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { sampleZones } from "./locations";
import type { Activity, Agent, Enquiry, Property, Sale, SubZone, Zone } from "./types";

interface State {
  ready: boolean;
  properties: Property[];
  enquiries: Enquiry[];
  activity: Activity[];
  zones: Zone[];
  agents: Agent[];
  sales: Sale[];
}
type Collection = "properties" | "enquiries" | "zones" | "agents" | "sales" | "activity";

const initial: State = { ready: false, properties: [], enquiries: [], activity: [], zones: sampleZones, agents: [], sales: [] };
let state: State = initial;
let started = false;
let zonesInDb = false;
const listeners = new Set<() => void>();

const byDateDesc = <T extends { createdAt?: string; at?: string }>(a: T, b: T) => (b.createdAt ?? b.at ?? "").localeCompare(a.createdAt ?? a.at ?? "");

/** Fetch every record the current visitor is allowed to see (RLS decides). */
async function fetchAll() {
  const { data, error } = await supabase.from("app_records").select("collection, data").limit(5000);
  if (error) { notify("Could not load data from the server. Check your internet connection."); setState({ ...state, ready: true }); return; }
  const g: Record<Collection, unknown[]> = { properties: [], enquiries: [], zones: [], agents: [], sales: [], activity: [] };
  for (const r of data ?? []) g[r.collection as Collection]?.push(r.data);
  zonesInDb = g.zones.length > 0;
  setState({
    ready: true,
    properties: (g.properties as Property[]).sort(byDateDesc),
    enquiries: (g.enquiries as Enquiry[]).sort(byDateDesc),
    activity: (g.activity as Activity[]).sort(byDateDesc).slice(0, 200),
    zones: zonesInDb ? (g.zones as Zone[]).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : sampleZones,
    agents: g.agents as Agent[],
    sales: (g.sales as Sale[]).sort(byDateDesc),
  });
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  void fetchAll();
}

function setState(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function notify(msg: string) {
  void import("sonner").then(({ toast }) => toast.error(msg));
}

async function put(collection: Collection, id: string, data: unknown) {
  const { error } = await supabase.from("app_records").upsert({ collection, id, data: data as Json, updated_at: new Date().toISOString() });
  if (error) notify("Saving failed — please check your connection and try again.");
}
async function remove(collection: Collection, id: string) {
  const { error } = await supabase.from("app_records").delete().eq("collection", collection).eq("id", id);
  if (error) notify("Delete failed — please try again.");
}

function subscribe(l: () => void) {
  start();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(initial));
}

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().slice(0, 13) : Math.random().toString(36).slice(2, 12));
function log(text: string): Activity[] {
  const a: Activity = { id: uid(), text, at: new Date().toISOString() };
  void put("activity", a.id, a);
  return [a, ...state.activity];
}

function saveZones(zones: Zone[], changed: Zone[]) {
  // First edit: save every zone so the public site shows the full list.
  const toSave = zonesInDb ? changed : zones;
  zonesInDb = true;
  toSave.forEach((z) => void put("zones", z.id, { ...z, order: zones.indexOf(z) }));
}

export const actions = {
  /** Reload from the server, e.g. right after an admin signs in. */
  refresh: fetchAll,
  async addEnquiry(e: Omit<Enquiry, "id" | "status" | "notes" | "createdAt">) {
    const enquiry: Enquiry = { ...e, id: uid(), status: "New", notes: "", createdAt: new Date().toISOString() };
    const { error } = await supabase.from("app_records").insert({ collection: "enquiries", id: enquiry.id, data: enquiry as unknown as Json });
    if (error) { notify("Your message could not be sent. Please call or WhatsApp us."); return false; }
    setState({ ...state, enquiries: [enquiry, ...state.enquiries] });
    return true;
  },
  updateEnquiry(id: string, patch: Partial<Enquiry>) {
    const enquiries = state.enquiries.map((x) => (x.id === id ? { ...x, ...patch } : x));
    setState({ ...state, enquiries });
    const e = enquiries.find((x) => x.id === id);
    if (e) void put("enquiries", id, e);
  },
  saveProperty(p: Property) {
    const exists = state.properties.some((x) => x.id === p.id);
    setState({
      ...state,
      properties: exists ? state.properties.map((x) => (x.id === p.id ? p : x)) : [p, ...state.properties],
      activity: log(`${exists ? "Updated" : "Created"} ${p.ref}: ${p.title}`),
    });
    void put("properties", p.id, p);
  },
  setStatus(id: string, status: Property["status"]) {
    const p = state.properties.find((x) => x.id === id);
    if (!p) return;
    const next = { ...p, status };
    setState({ ...state, properties: state.properties.map((x) => (x.id === id ? next : x)), activity: log(`${p.ref} marked ${status}`) });
    void put("properties", id, next);
  },
  deleteProperty(id: string) {
    setState({ ...state, properties: state.properties.filter((x) => x.id !== id) });
    void remove("properties", id);
  },
  addZone(name: string, town: string) {
    const z: Zone = { id: uid(), name, town, subZones: [] };
    const zones = [...state.zones, z];
    setState({ ...state, zones, activity: log(`Added zone ${name}`) });
    saveZones(zones, [z]);
  },
  updateZone(id: string, patch: Partial<Omit<Zone, "id" | "subZones">>) {
    editZone(id, (z) => ({ ...z, ...patch }));
  },
  deleteZone(id: string) {
    const zones = state.zones.filter((z) => z.id !== id);
    setState({ ...state, zones });
    saveZones(zones, []);
    void remove("zones", id);
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
    setState({ ...state, agents: exists ? state.agents.map((x) => (x.id === a.id ? a : x)) : [...state.agents, a], activity: log(`${exists ? "Updated" : "Added"} agent ${a.name}`) });
    void put("agents", a.id, a);
  },
  recordSale(s: Omit<Sale, "id" | "receiptNo" | "status" | "createdAt">): Sale {
    const year = s.date.slice(0, 4);
    const n = state.sales.filter((x) => x.receiptNo.includes(`-${year}-`)).length + 1;
    const sale: Sale = { ...s, id: uid(), receiptNo: `RHM-RCP-${year}-${String(n).padStart(4, "0")}`, status: "Completed", createdAt: new Date().toISOString() };
    const prop = state.properties.find((p) => p.id === s.propertyId);
    const sold = prop ? { ...prop, status: (prop.listing === "Rent" ? "Rented" : "Sold") as Property["status"] } : undefined;
    setState({
      ...state,
      sales: [sale, ...state.sales],
      properties: sold ? state.properties.map((p) => (p.id === sold.id ? sold : p)) : state.properties,
      activity: log(`Sale recorded: ${s.propertyRef} (${sale.receiptNo})`),
    });
    void put("sales", sale.id, sale);
    if (sold) void put("properties", sold.id, sold);
    return sale;
  },
  cancelSale(id: string) {
    const s = state.sales.find((x) => x.id === id);
    if (!s) return;
    const next = { ...s, status: "Cancelled" as const };
    setState({ ...state, sales: state.sales.map((x) => (x.id === id ? next : x)), activity: log(`Sale ${s.receiptNo} cancelled`) });
    void put("sales", id, next);
  },
  newId: uid,
};

function editZone(id: string, fn: (z: Zone) => Zone) {
  let changed: Zone | undefined;
  const zones = state.zones.map((z) => (z.id === id ? (changed = fn(z)) : z));
  setState({ ...state, zones });
  if (changed) saveZones(zones, [changed]);
}
function editSub(zoneId: string, subId: string, fn: (s: SubZone) => SubZone) {
  editZone(zoneId, (z) => ({ ...z, subZones: z.subZones.map((s) => (s.id === subId ? fn(s) : s)) }));
}
