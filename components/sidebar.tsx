import type { Route } from "next";
import Link from "next/link";
import { CalendarDays, LayoutDashboard, PlusCircle, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const links: Array<{ href: Route; label: string; icon: typeof LayoutDashboard }> = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/events/new", label: "New Event", icon: PlusCircle }
];

export function Sidebar() {
  return (
    <aside className="border-b border-white/60 bg-ink px-4 py-5 text-white md:min-h-screen md:border-b-0 md:border-r md:px-5 md:py-8">
      <div className="mb-8 flex items-center justify-between md:block">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Admin</p>
          <h2 className="mt-2 text-xl font-semibold">Event Budget</h2>
        </div>
      </div>
      <nav className="grid gap-2 md:gap-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
