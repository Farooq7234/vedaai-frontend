"use client";

import { usePathname } from "next/navigation";
import { Bell, ArrowLeft, LayoutGrid, Menu } from "lucide-react";
import Image from "next/image";

const BREADCRUMB_MAP: Record<string, string> = {
  "/assignments": "Assignment",
  "/create": "Create Assignment",
  "/toolkit": "AI Teacher's Toolkit",
  "/library": "My Library",
  "/groups": "My Groups",
};

function getBreadcrumb(pathname: string): string {
  if (pathname.startsWith("/status/")) return "Generating Paper";
  if (pathname.startsWith("/paper/")) return "Question Paper";
  return BREADCRUMB_MAP[pathname] || "Assignment";
}

export default function TopBar() {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <>
      {/* Desktop — floating pill bar with margin from top/right */}
      <div className="hidden lg:block sticky top-3 z-20 pr-3 pt-0">
        <header className="bg-white/75 rounded-2xl shadow-sm border border-gray-100 px-6 py-3 flex items-center justify-between">
          {/* Left: back + breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full cursor-pointer  hover:bg-white/90 bg-white transition-colors"
            >
              <ArrowLeft size={18} className="text-gray-500" />
            </button>
            <LayoutGrid size={15} className="text-gray-400" />
            <span className="text-gray-800 font-medium text-sm">{breadcrumb}</span>
          </div>

          {/* Right: bell + user */}
          <div className="flex items-center gap-2">
            {/* Bell */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell size={19} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Avatar + name */}
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 pl-1 pr-3 py-1 rounded-full transition-colors">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden shrink-0">
                <span className="text-white text-sm font-bold">J</span>
              </div>
              <span className="text-sm font-medium text-gray-800">John Doe</span>
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile top bar — floating, rounded, with margin on all sides */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white rounded-2xl shadow-sm sticky top-3 mx-3 z-20">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="VedaAI" width={32} height={32} className="rounded-lg" />
          <span className="text-base font-bold text-gray-">VedaAI</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">J</span>
          </div>
          <button className="p-2">
            <Menu size={20} className="text-gray-700" />
          </button>
        </div>
      </header>
    </>
  );
}
