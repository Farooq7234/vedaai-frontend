"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, Plus, Minus, X, ChevronDown, ChevronLeft,
  ChevronRight, Calendar, Mic, Loader2
} from "lucide-react";
import { createAssignment } from "@/lib/api";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import DashboardLayout from "@/components/DashboardLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionTypeRow {
  id: string;
  type: string;
  numQuestions: number;
  marks: number;
}

const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Answer Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True/False Questions",
  "Fill in the Blanks",
  "Case Study Questions",
  "Essay Questions",
];

const GRADE_LEVELS = [
  "Grade 1–3", "Grade 4–6", "Grade 7–8",
  "Grade 9–10", "Grade 11–12", "Undergraduate",
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "mixed", label: "Mixed" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stepper({
  value,
  onChange,
  min = 1,
  max = 100,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-0">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 flex items-center justify-center rounded-l-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors text-sm"
      >
        <Minus size={12} />
      </button>
      <div className="w-10 h-7 flex items-center justify-center border-t border-b border-gray-200 bg-white text-sm font-medium text-gray-900 select-none">
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-7 h-7 flex items-center justify-center rounded-r-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors text-sm"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}

function FileDropZone({
  file,
  onFile,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer
        ${dragging ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"}`}
      onClick={() => inputRef.current?.click()}
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Upload size={22} className="text-gray-500" />
      </div>
      {file ? (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800">{file.name}</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFile(null); }}
            className="text-xs text-red-500 hover:text-red-700 mt-1"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700">
            Choose a file or drag &amp; drop it here
          </p>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, upto 10MB</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            className="mt-4 px-5 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Browse Files
          </button>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.jpeg,.jpg,.png"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreatePage() {
  const router = useRouter();
  const setAssignmentId = useAssignmentStore((s) => s.setAssignmentId);

  // Step 1 state
  const [file, setFile] = useState<File | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [rows, setRows] = useState<QuestionTypeRow[]>([
    { id: crypto.randomUUID(), type: "Multiple Choice Questions", numQuestions: 4, marks: 1 },
    { id: crypto.randomUUID(), type: "Short Questions", numQuestions: 3, marks: 2 },
  ]);
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Step 2 state
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [difficulty, setDifficulty] = useState("mixed");

  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Computed totals
  const totalQuestions = rows.reduce((s, r) => s + r.numQuestions, 0);
  const totalMarks = rows.reduce((s, r) => s + r.numQuestions * r.marks, 0);

  const addRow = () => {
    const usedTypes = rows.map((r) => r.type);
    const next = QUESTION_TYPE_OPTIONS.find((t) => !usedTypes.includes(t)) || QUESTION_TYPE_OPTIONS[0];
    setRows((prev) => [...prev, { id: crypto.randomUUID(), type: next, numQuestions: 4, marks: 1 }]);
  };

  const removeRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const updateRow = <K extends keyof QuestionTypeRow>(
    id: string,
    key: K,
    value: QuestionTypeRow[K]
  ) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!dueDate) e.dueDate = "Due date is required";
    else if (new Date(dueDate) <= new Date()) e.dueDate = "Due date must be in the future";
    if (rows.length === 0) e.rows = "Add at least one question type";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!subject.trim()) e.subject = "Subject is required";
    if (!topic.trim()) e.topic = "Topic is required";
    if (!gradeLevel) e.gradeLevel = "Grade level is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("subject", subject);
      fd.append("topic", topic);
      fd.append("gradeLevel", gradeLevel);
      fd.append("questionTypes", JSON.stringify(rows.map((r) => r.type)));
      fd.append("totalQuestions", String(totalQuestions));
      fd.append("totalMarks", String(totalMarks));
      fd.append("difficulty", difficulty);
      fd.append("additionalInstructions", additionalInfo);
      fd.append("dueDate", dueDate);
      // Pass per-type mark breakdown as part of instructions
      const breakdown = rows.map((r) => `${r.type}: ${r.numQuestions} questions × ${r.marks} mark${r.marks > 1 ? "s" : ""} each`).join("; ");
      fd.append("markBreakdown", breakdown);
      if (file) fd.append("file", file);

      const { assignmentId } = await createAssignment(fd);
      setAssignmentId(assignmentId);
      router.push(`/status/${assignmentId}`);
    } catch {
      setErrors({ submit: "Failed to submit. Please try again." });
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center">
        {/* Page heading — full width, left aligned */}
        <div className="w-full px-6 pt-8 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            <h1 className="text-base font-bold text-gray-900">Create Assignment</h1>
          </div>
          <p className="text-xs text-gray-500 ml-4.5">Set up a new assignment for your students</p>
        </div>

        {/* Progress tabs — centered with form */}
        <div className="w-full max-w-2xl px-4 pb-2">
          <div className="flex gap-1">
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-black" : "bg-gray-200"}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-black" : "bg-gray-200"}`} />
          </div>
        </div>

        {/* Content card */}
        <div className="w-full max-w-2xl px-4 py-4">
          <div className="bg-white/50 rounded-2xl border border-gray-100 shadow-sm">
            {step === 1 ? (
              /* ── STEP 1: Assignment Details ── */
              <div className="p-6 sm:p-8">
                <h2 className="text-sm font-bold text-gray-900 mb-0.5">Assignment Details</h2>
                <p className="text-xs text-gray-400 mb-5">Basic information about your assignment</p>

                {/* File upload */}
                <FileDropZone file={file} onFile={setFile} />
                <p className="text-xs text-gray-400 text-center mt-2 mb-6">
                  Upload images of your preferred document/image
                </p>

                {/* Due Date */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Due Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => { setDueDate(e.target.value); setErrors((prev) => ({ ...prev, dueDate: "" })); }}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                    <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
                  </div>
                  {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                </div>

                {/* Question Type table */}
                <div className="mb-2">
                  <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-x-4 mb-2 px-1">
                    <span className="text-sm font-semibold text-gray-800">Question Type</span>
                    <span className="text-sm font-semibold text-gray-800 text-center w-36">No. of Questions</span>
                    <span className="text-sm font-semibold text-gray-800 text-center w-28">Marks</span>
                  </div>

                  <div className="space-y-2">
                    {rows.map((row) => (
                      <QuestionRow
                        key={row.id}
                        row={row}
                        onUpdate={updateRow}
                        onRemove={removeRow}
                        usedTypes={rows.map((r) => r.type).filter((t) => t !== row.type)}
                      />
                    ))}
                  </div>

                  {errors.rows && <p className="text-red-500 text-xs mt-2">{errors.rows}</p>}

                  <button
                    type="button"
                    onClick={addRow}
                    className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0">
                      <Plus size={14} className="text-white" />
                    </span>
                    Add Question Type
                  </button>
                </div>

                {/* Totals */}
                <div className="flex flex-col items-end gap-0.5 mt-5 mb-6">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Total Questions</span> : {totalQuestions}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Total Marks</span> : {totalMarks}
                  </p>
                </div>

                {/* Additional Info */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Additional Information{" "}
                    <span className="font-normal text-gray-400">(For better output)</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      rows={3}
                      placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    />
                    <Mic size={16} className="absolute right-3 bottom-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              </div>
            ) : (
              /* ── STEP 2: Subject Info ── */
              <div className="p-6 sm:p-8">
                <h2 className="text-sm font-bold text-gray-900 mb-0.5">Subject Information</h2>
                <p className="text-xs text-gray-400 mb-6">Tell us what this paper is about</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Subject <span className="text-red-400">*</span></label>
                    <input
                      value={subject}
                      onChange={(e) => { setSubject(e.target.value); setErrors((p) => ({ ...p, subject: "" })); }}
                      placeholder="e.g. Mathematics"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Topic <span className="text-red-400">*</span></label>
                    <input
                      value={topic}
                      onChange={(e) => { setTopic(e.target.value); setErrors((p) => ({ ...p, topic: "" })); }}
                      placeholder="e.g. Quadratic Equations"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Grade Level <span className="text-red-400">*</span></label>
                    <select
                      value={gradeLevel}
                      onChange={(e) => { setGradeLevel(e.target.value); setErrors((p) => ({ ...p, gradeLevel: "" })); }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                    >
                      <option value="">Select grade level</option>
                      {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {errors.gradeLevel && <p className="text-red-500 text-xs mt-1">{errors.gradeLevel}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Difficulty Level</label>
                    <div className="flex flex-wrap gap-2">
                      {DIFFICULTY_OPTIONS.map(({ value, label }) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() => setDifficulty(value)}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            difficulty === value
                              ? "bg-black text-white border-gray-900"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 text-sm text-gray-500 space-y-1">
                    <p className="font-semibold text-gray-700 mb-2">Summary</p>
                    {rows.map((r) => (
                      <div key={r.id} className="flex justify-between">
                        <span>{r.type}</span>
                        <span className="text-gray-700 font-medium">{r.numQuestions} × {r.marks}m</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2 mt-2">
                      <span>Total Questions</span>
                      <span>{totalQuestions}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-900">
                      <span>Total Marks</span>
                      <span>{totalMarks}</span>
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                    {errors.submit}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Nav Bar */}
        <div className="sticky bottom-0 px-4 py-4 flex items-center justify-between w-full max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => step === 1 ? router.back() : setStep(1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {step === 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 disabled:opacity-60 transition-colors"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Generating...</>
              ) : (
                <><span>Generate Paper</span> <ChevronRight size={16} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Question Row ─────────────────────────────────────────────────────────────

function QuestionRow({
  row,
  onUpdate,
  onRemove,
  usedTypes,
}: {
  row: QuestionTypeRow;
  onUpdate: <K extends keyof QuestionTypeRow>(id: string, key: K, value: QuestionTypeRow[K]) => void;
  onRemove: (id: string) => void;
  usedTypes: string[];
}) {
  return (
    <>
      {/* Desktop row */}
      <div className="hidden sm:grid grid-cols-[1fr_auto_auto] items-center gap-x-4">
        {/* Type dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={row.type}
              onChange={(e) => onUpdate(row.id, "type", e.target.value)}
              className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {QUESTION_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t} disabled={usedTypes.includes(t)}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button
            type="button"
            onClick={() => onRemove(row.id)}
            className="text-black hover:text-neutral-700 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* No. of Questions stepper */}
        <div className="flex items-center justify-center w-36">
          <Stepper
            value={row.numQuestions}
            onChange={(v) => onUpdate(row.id, "numQuestions", v)}
          />
        </div>

        {/* Marks stepper */}
        <div className="flex items-center justify-center w-28">
          <Stepper
            value={row.marks}
            onChange={(v) => onUpdate(row.id, "marks", v)}
          />
        </div>
      </div>

      {/* Mobile row */}
      <div className="sm:hidden border border-gray-200 rounded-xl p-3 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <select
              value={row.type}
              onChange={(e) => onUpdate(row.id, "type", e.target.value)}
              className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-7 text-sm text-gray-800 bg-white focus:outline-none"
            >
              {QUESTION_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t} disabled={usedTypes.includes(t)}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button type="button" onClick={() => onRemove(row.id)} className="text-black hover:text-neutral-700 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">No. of Questions</p>
            <Stepper value={row.numQuestions} onChange={(v) => onUpdate(row.id, "numQuestions", v)} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Marks</p>
            <Stepper value={row.marks} onChange={(v) => onUpdate(row.id, "marks", v)} />
          </div>
        </div>
      </div>
    </>
  );
}
