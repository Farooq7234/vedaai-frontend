"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ClipboardList, Library, Wand2, Plus } from "lucide-react";

const MOBILE_NAV = [
  { label: "Home", href: "/", icon: LayoutGrid },
  { label: "Assignments", href: "/assignments", icon: ClipboardList },
  { label: "Library", href: "/library", icon: Library },
  { label: "AI Toolkit", href: "/toolkit", icon: Wand2 },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/assignments") return pathname.startsWith("/assignments") || pathname.startsWith("/create") || pathname.startsWith("/status") || pathname.startsWith("/paper");
    return pathname === href;
  };

  return (
    <>
      {/* Floating + button */}
      <Link
        href="/create"
        className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 bg-orange-500 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
      >
        <Plus size={22} className="text-white" />
      </Link>

      {/* Bottom bar — floating, rounded, with margin on all sides */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-30 bg-gray-900 rounded-2xl shadow-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {MOBILE_NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors ${
                  active ? "text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span className={`text-[10px] font-medium ${active ? "text-white" : "text-gray-400"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
