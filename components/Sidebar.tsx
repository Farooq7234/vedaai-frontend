"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  ClipboardList,
  Wand2,
  Library,
  Settings,
  Plus,
  School,
  Astroid,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: LayoutGrid },
  { label: "My Groups", href: "/groups", icon: Users },
  { label: "Assignments", href: "/assignments", icon: ClipboardList },
  { label: "AI Teacher's Toolkit", href: "/toolkit", icon: Wand2 },
  { label: "My Library", href: "/library", icon: Library },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/assignments") return pathname.startsWith("/assignments") || pathname.startsWith("/create") || pathname.startsWith("/status") || pathname.startsWith("/paper");
    return pathname === href;
  };

  return (
    /* Outer fixed container — provides the margin from all edges */
    <aside className="hidden lg:block fixed left-3 top-3 bottom-3 z-30 w-[302px]">
      {/* Floating card — rounded, shadow, not flush with edges */}
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Logo */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">VedaAI</span>
          </div>
        </div>

        {/* Create Button */}
        <div className="px-4 pb-4 mt-4 mb-4">
          {/* Gradient border wrapper */}
          <div
            className="rounded-full p-1"
            style={{ background: "linear-gradient(135deg, #FF7950, #C0350A)" }}
          >
            <Link
              href="/create"
              className="flex justify-center items-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <Astroid size={16} />
              Create Assignment
            </Link>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <Icon size={18} strokeWidth={isActive(href) ? 2.2 : 1.8} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            <Settings size={18} strokeWidth={1.8} />
            Settings
          </Link>

          {/* School info card */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center shrink-0">
              <School size={18} className="text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                Delhi Public School
              </p>
              <p className="text-xs text-gray-500 truncate">
                Bokaro Steel City
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
