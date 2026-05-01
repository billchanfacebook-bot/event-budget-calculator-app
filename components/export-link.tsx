import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExportLink({
  href,
  label,
  className
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold hover:border-accent hover:text-accent",
        className
      )}
    >
      <Download className="h-4 w-4" />
      <span>{label}</span>
    </a>
  );
}
