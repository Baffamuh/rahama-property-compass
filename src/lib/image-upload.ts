import logoUrl from "@/assets/rahama-logo.png";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "property-photos";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

let logoPromise: Promise<HTMLImageElement | null> | null = null;
function loadLogo() {
  logoPromise ??= new Promise((res) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = logoUrl;
  });
  return logoPromise;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = url;
  }).finally(() => setTimeout(() => URL.revokeObjectURL(url), 0));
}

/** Resize a device photo and stamp the Rahama logo on the bottom-right corner (runs on the phone, ₦0). */
export async function compressAndWatermark(file: File, maxSide = 1600, quality = 0.78): Promise<Blob> {
  const [img, logo] = await Promise.all([loadImage(file), loadLogo()]);
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (logo) {
    const w = Math.round(Math.max(90, canvas.width * 0.2));
    const h = Math.round((logo.height / logo.width) * w);
    const pad = Math.round(canvas.width * 0.025);
    const x = canvas.width - w - pad, y = canvas.height - h - pad;
    const bg = Math.round(w * 0.06);
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(x - bg, y - bg, w + bg * 2, h + bg * 2, bg * 2);
    ctx.fill();
    ctx.globalAlpha = 0.95;
    ctx.drawImage(logo, x, y, w, h);
    ctx.globalAlpha = 1;
  }

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", quality));
  if (blob && blob.type === "image/webp") return blob;
  return new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", quality));
}

/** Watermark + upload one photo to Cloud storage; returns a long-lived link for the website. */
export async function uploadPropertyPhoto(file: File, folder: string): Promise<string> {
  const blob = await compressAndWatermark(file);
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
  if (up.error) throw up.error;
  const signed = await supabase.storage.from(BUCKET).createSignedUrl(path, TEN_YEARS);
  if (signed.error || !signed.data) throw signed.error ?? new Error("link failed");
  return signed.data.signedUrl;
}
