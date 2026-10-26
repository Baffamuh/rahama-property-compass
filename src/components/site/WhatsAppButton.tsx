import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/format";
import { cn } from "@/lib/utils";

export function WhatsAppButton({ message, label = "Chat on WhatsApp", className }: { message: string; label?: string; className?: string }) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 font-semibold text-accent-foreground shadow-sm transition-transform hover:scale-[1.02]", className)}
    >
      <MessageCircle className="h-5 w-5" /> {label}
    </a>
  );
}
