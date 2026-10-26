// Zero-cost, fully in-browser lead scoring and reply drafting. No external APIs.
import { COMPANY, formatNaira, formatSize } from "./format";
import type { Property } from "./types";

export type Priority = "High" | "Medium" | "Low";
export type Tone = "formal" | "warm" | "hausa";

export interface LeadInput {
  name: string;
  message: string;
  property?: Property | undefined;
}

export interface LeadAnalysis {
  priority: Priority;
  score: number;
  signals: string[];
  questions: string[];
  nextStep: string;
}

const SIGNALS: { re: RegExp; pts: number; label: string }[] = [
  { re: /\b(inspect|inspection|visit|see the (land|plot|house)|come (and|to) see)\b/i, pts: 3, label: "Wants a site inspection" },
  { re: /\b(cash|ready to (pay|buy)|pay (now|today|outright)|funds? (is|are) ready|transfer)\b/i, pts: 3, label: "Funds appear ready" },
  { re: /\b(urgent|asap|immediately|this week|today|tomorrow|quickly|monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend)\b/i, pts: 2, label: "Urgent timeline" },
  { re: /\b(buy|purchase|acquire|interested|reserve|book)\b/i, pts: 1, label: "Clear purchase intent" },
  { re: /\b(installment|instalment|payment plan|spread)\b/i, pts: 1, label: "Asking about payment plan" },
  { re: /\b(diaspora|abroad|abuja|lagos|kano|overseas|uk|usa|saudi)\b/i, pts: 1, label: "Remote / diaspora buyer" },
  { re: /\b(just (checking|asking)|maybe|later|next year|someday|curious)\b/i, pts: -2, label: "Early-stage / browsing" },
];

const QUESTIONS: { re: RegExp; q: string }[] = [
  { re: /\b(c of o|cofo|r of o|certificate|title|document|papers?)\b/i, q: "Confirm title documents (C of O / R of O status)" },
  { re: /\bsurvey\b/i, q: "Share survey plan details" },
  { re: /\b(installment|instalment|payment plan)\b/i, q: "Explain available installment terms" },
  { re: /\b(price|cost|negotiable|discount|last price)\b/i, q: "Clarify final price / negotiation room" },
  { re: /\b(road|electricity|water|light|access)\b/i, q: "Confirm infrastructure (road, power, water)" },
];

export function analyzeLead({ message, property }: LeadInput): LeadAnalysis {
  let score = 0;
  const signals: string[] = [];
  for (const s of SIGNALS) if (s.re.test(message)) { score += s.pts; signals.push(s.label); }
  if (message.trim().length > 120) { score += 1; signals.push("Detailed message"); }
  if (property?.status === "Sold") { score -= 1; signals.push("Listing already sold — offer alternatives"); }
  if (property?.status === "Reserved") signals.push("Listing reserved — offer waitlist or similar plot");
  const questions = QUESTIONS.filter((q) => q.re.test(message)).map((q) => q.q);
  const priority: Priority = score >= 4 ? "High" : score >= 1 ? "Medium" : "Low";
  if (!signals.length) signals.push("No strong buying signals yet");
  const nextStep =
    priority === "High" ? "Call within 1 hour and schedule a site inspection"
    : priority === "Medium" ? "Reply today with details and invite to inspect"
    : "Send listing details and follow up in a week";
  return { priority, score, signals, questions, nextStep };
}

export function draftReply({ name, property }: LeadInput, a: LeadAnalysis, tone: Tone): string {
  const first = name.trim().split(/\s+/)[0] || "there";
  const greet = tone === "hausa" ? `Assalamu alaikum ${first}, barka da kokari.` : tone === "warm" ? `Hello ${first}! 😊` : `Dear ${name.trim() || "Sir/Madam"},`;
  const thanks = tone === "formal" ? `Thank you for your enquiry to ${COMPANY.name.replace(/\.$/, "")}.` : `Thank you for reaching out to Rahama Land & Property.`;
  let body = "";
  if (property) {
    const avail = property.status === "Sold" ? "has unfortunately been sold, but we have similar options available" : property.status === "Reserved" ? "is currently reserved; we can place you on the waitlist or show you similar plots" : "is available";
    body = `The property you asked about — ${property.title} (Ref: ${property.ref}), ${formatSize(property.size, property.sizeUnit)} at ${property.area} for ${formatNaira(property.price)} — ${avail}.`;
  }
  const qs = a.questions.length ? `\n\nRegarding your questions, we will gladly ${a.questions.map((q) => q.charAt(0).toLowerCase() + q.slice(1)).join("; ")}.` : "";
  const cta = a.priority === "High"
    ? `We can arrange a site inspection as early as tomorrow. Kindly let us know a convenient time.`
    : `We would be happy to arrange a free site inspection at your convenience.`;
  const close = tone === "hausa" ? `Mun gode, Allah ya bada sa'a.` : tone === "warm" ? `Looking forward to hearing from you!` : `We look forward to your response.`;
  return `${greet}\n\n${thanks} ${body}${qs}\n\n${cta} You are also welcome to visit our office at ${COMPANY.address}, or call ${COMPANY.phones[0]}.\n\n${close}\n${COMPANY.name}`;
}
