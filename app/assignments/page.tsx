"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  SlidersHorizontal,
  MoreVertical,
  Loader2,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { listAssignments, deleteAssignment } from "@/lib/api";

interface Assignment {
  _id: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalMarks: number;
  totalQuestions: number;
  createdAt: string;
  dueDate?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function AssignmentCard({
  assignment,
  onDelete,
}: {
  assignment: Assignment;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleView = () => {
    setMenuOpen(false);
    if (assignment.status === "completed") {
      router.push(`/paper/${assignment._id}`);
    } else {
      router.push(`/status/${assignment._id}`);
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    onDelete(assignment._id);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex flex-col gap-3 relative shadow-sm hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">
          {assignment.subject} — {assignment.topic}
        </h3>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical size={16} className="text-gray-500" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-40 text-sm">
              <button
                onClick={handleView}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
              >
                View Assignment
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div>
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
            assignment.status === "completed"
              ? "bg-green-100 text-green-700"
              : assignment.status === "processing" ||
                  assignment.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-600"
          }`}
        >
          {assignment.status}
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-50">
        <span>
          <span className="font-medium text-gray-600">Assigned on : </span>
          {formatDate(assignment.createdAt)}
        </span>
        {assignment.dueDate && (
          <span>
            <span className="font-medium text-gray-600">Due : </span>
            {formatDate(assignment.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyIllustration() {
  return (
    <Image
      src="/Illustration found.png"
      alt="No assignments found"
      width={220}
      height={200}
      className="mx-auto"
    />
  );
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const data = await listAssignments();
      setAssignments(data);
    } catch {
      setError("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteAssignment(id);
    setAssignments((prev) => prev.filter((a) => a._id !== id));
  };

  const filtered = assignments.filter((a) =>
    `${a.subject} ${a.topic}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 py-6  mx-auto">
        {/* Page heading */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and create assignments for your classes.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shrink-0">
            <SlidersHorizontal size={15} />
            Filter By
          </button>
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Assignment"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-gray-400" size={36} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle className="text-red-400" size={36} />
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <EmptyIllustration />
            <h2 className="mt-6 text-lg font-bold text-gray-900">
              {search ? "No results found" : "No assignments yet"}
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">
              {search
                ? `No assignments match "${search}". Try a different keyword.`
                : "Create your first assignment to start generating question papers."}
            </p>
            {!search && (
              <Link
                href="/create"
                className="mt-6 inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                Create Your First Assignment
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((a) => (
              <AssignmentCard
                key={a._id}
                assignment={a}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom blur bar — only when assignments are shown */}
      {!loading && !error && filtered.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 lg:left-79.5 z-30 flex items-end justify-center pb-6 pt-16"
          style={{
            background:
              "linear-gradient(to top, rgba(218,218,218,0.85) 0%, transparent 100%)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          <Link
            href="/create"
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg"
          >
            <Plus size={16} />
            Create Assignment
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}
