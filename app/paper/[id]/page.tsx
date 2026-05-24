"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getPaper, regeneratePaper } from "@/lib/api";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { GeneratedPaper, Question } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";

const PDFButton = dynamic(() => import("@/components/PDFButton"), { ssr: false, loading: () => null });

interface Props {
  params: Promise<{ id: string }>;
}

const DIFFICULTY_STYLES = {
  easy: "bg-green-100 text-green-700 border border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  hard: "bg-red-100 text-red-700 border border-red-200",
};

function DifficultyBadge({ level }: { level: string }) {
  const style = DIFFICULTY_STYLES[level as keyof typeof DIFFICULTY_STYLES] || "bg-gray-100 text-gray-600";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${style}`}>
      {level}
    </span>
  );
}

function QuestionItem({ question, showOptions }: { question: Question; showOptions?: boolean }) {
  return (
    <div className="group">
      <div className="flex items-start gap-3">
        <span className="font-semibold text-gray-900 min-w-[24px]">{question.number}.</span>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <p className="text-gray-800 leading-relaxed">{question.text}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <DifficultyBadge level={question.difficulty} />
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                [{question.marks} {question.marks === 1 ? "mark" : "marks"}]
              </span>
            </div>
          </div>
          {question.options && question.options.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-1">
              {question.options.map((opt, i) => (
                <div key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="font-medium text-gray-500">({String.fromCharCode(97 + i)})</span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaperPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { setPaper } = useAssignmentStore();
  const [paper, setPaperLocal] = useState<GeneratedPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPaper(id);
        setPaperLocal(data);
        setPaper(data);
      } catch {
        setError("Failed to load paper. It may still be generating.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await regeneratePaper(id);
      router.push(`/status/${id}`);
    } catch {
      setRegenerating(false);
    }
  };


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <Loader2 className="animate-spin text-gray-400 mx-auto mb-4" size={40} />
            <p className="text-gray-600">Loading your paper...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !paper) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <AlertCircle className="text-red-400 mx-auto mb-4" size={40} />
          <p className="text-gray-700 font-medium mb-2">Paper not found</p>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Link href="/create" className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800">
            Create New Assessment
          </Link>
        </div>
        </div>
      </DashboardLayout>
    );
  }

  const { metadata, sections } = paper;

  return (
    <DashboardLayout>
    <div className="print:bg-white">
      {/* Action Bar — hidden on print */}
      <div className="print:hidden px-4 sm:px-6 pt-4 pb-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
          <div className="text-sm font-semibold text-gray-800">Question Paper</div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              {regenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Regenerate
            </button>
            {paper && <PDFButton paper={paper} />}
          </div>
        </div>
      </div>

      {/* Paper */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 print:py-0 print:max-w-none print:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          {/* Paper Header */}
          <div className="border-b-2 border-gray-900 px-10 py-8 print:px-0">
            <div className="text-center mb-6">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1">Examination Paper</div>
              <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
                {metadata.subject}
              </h1>
              <p className="text-lg text-gray-600 mt-1">{metadata.topic}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Grade</div>
                <div className="font-semibold text-gray-900">{metadata.gradeLevel}</div>
              </div>
              <div className="w-px bg-gray-300" />
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Total Marks</div>
                <div className="font-semibold text-gray-900">{metadata.totalMarks}</div>
              </div>
              <div className="w-px bg-gray-300" />
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Questions</div>
                <div className="font-semibold text-gray-900">{metadata.totalQuestions}</div>
              </div>
              <div className="w-px bg-gray-300" />
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Date</div>
                <div className="font-semibold text-gray-900">{new Date(metadata.generatedAt).toLocaleDateString("en-IN")}</div>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="px-10 py-6 border-b border-gray-200 print:px-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["Name", "Roll Number", "Section"].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{field}</label>
                  <div className="border-b-2 border-gray-400 pb-1 min-h-[28px]" />
                </div>
              ))}
            </div>
          </div>

          {/* General Instructions */}
        

          {/* Sections */}
          <div className="px-10 py-8 space-y-10 print:px-0">
            {sections.map((section) => (
              <div key={section.label}>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider">
                    {section.label}
                  </h2>
                  <span className="text-sm font-semibold text-gray-700">
                    [{section.totalMarks} marks]
                  </span>
                </div>
                <p className="text-sm text-gray-600 italic mb-4 border-l-4 border-indigo-300 pl-3 print:border-gray-400">
                  {section.instruction}
                </p>

                <div className="space-y-5">
                  {section.questions.map((question) => (
                    <QuestionItem key={question.number} question={question} />
                  ))}
                </div>
              </div>
            ))}
          </div>

     
        </div>

      
      </div>
    </div>
    </DashboardLayout>
  );
}
