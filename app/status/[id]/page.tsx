"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { getAssignment, regeneratePaper } from "@/lib/api";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import DashboardLayout from "@/components/DashboardLayout";

interface Props {
  params: Promise<{ id: string }>;
}

export default function StatusPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { jobStatus, progress, progressStep, errorMessage, setJobStatus, setError } = useAssignmentStore();
  const [regenerating, setRegenerating] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const socket = connectSocket(id);

    socket.on("job:progress", (data: { assignmentId: string; step: string; percent: number }) => {
      if (data.assignmentId === id) {
        setJobStatus("processing", data.percent, data.step);
      }
    });

    socket.on("job:completed", (data: { assignmentId: string }) => {
      if (data.assignmentId === id) {
        setJobStatus("completed", 100, "Done!");
        clearPolling();
        setTimeout(() => router.push(`/paper/${id}`), 800);
      }
    });

    socket.on("job:failed", (data: { assignmentId: string; error: string }) => {
      if (data.assignmentId === id) {
        setError(data.error || "Generation failed");
        clearPolling();
      }
    });

    // Polling fallback
    const poll = async () => {
      try {
        const assignment = await getAssignment(id);
        if (assignment.status === "completed") {
          setJobStatus("completed", 100, "Done!");
          clearPolling();
          router.push(`/paper/${id}`);
        } else if (assignment.status === "failed") {
          setError(assignment.errorMessage || "Generation failed");
          clearPolling();
        } else if (assignment.status === "processing") {
          setJobStatus("processing", progress || 20, "Processing...");
        }
      } catch {
        // Ignore poll errors — WebSocket is primary
      }
    };

    pollingRef.current = setInterval(poll, 5000);
    poll();

    return () => {
      socket.off("job:progress");
      socket.off("job:completed");
      socket.off("job:failed");
      disconnectSocket();
      clearPolling();
    };
  }, [id]);

  const clearPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await regeneratePaper(id);
      setJobStatus("pending", 0, "Starting...");
      connectSocket(id);
      setRegenerating(false);
    } catch {
      setRegenerating(false);
    }
  };

  const isFailed = jobStatus === "failed";
  const isCompleted = jobStatus === "completed";

  const steps = [
    "Loading assignment...",
    "Building prompt...",
    "Generating questions with AI...",
    "Parsing AI response...",
    "Saving paper to database...",
    "Done!",
  ];

  const currentStepIndex = steps.indexOf(progressStep);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="bg-white/50 rounded-2xl border border-gray-100 shadow-sm p-8">

            {isFailed ? (
              /* ── Failed ── */
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <XCircle className="text-red-500" size={28} />
                </div>
                <h1 className="text-lg font-bold text-gray-900 mb-1">Generation Failed</h1>
                <p className="text-sm text-gray-500 mb-6">{errorMessage || "An error occurred while generating the paper."}</p>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-neutral-800 disabled:opacity-60 transition-colors"
                >
                  {regenerating ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                  Try Again
                </button>
              </div>

            ) : isCompleted ? (
              /* ── Completed ── */
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="text-green-600" size={28} />
                </div>
                <h1 className="text-lg font-bold text-gray-900 mb-1">Paper Generated!</h1>
                <p className="text-sm text-gray-500 mb-4">Redirecting to your paper...</p>
                <Loader2 className="animate-spin text-gray-400 mx-auto" size={20} />
              </div>

            ) : (
              /* ── Generating ── */
              <>
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                    <h1 className="text-base font-bold text-gray-900">Generating Your Paper</h1>
                  </div>
                  <p className="text-xs text-gray-500 ml-4.5">Our AI is crafting your question paper. This usually takes 15–30 seconds.</p>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>{progressStep || "Starting..."}</span>
                    <span className="font-medium text-gray-700">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {steps.slice(0, -1).map((stepLabel, i) => (
                    <div key={stepLabel} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        i < currentStepIndex ? "bg-black" :
                        i === currentStepIndex ? "bg-black" :
                        "bg-gray-200"
                      }`}>
                        {i < currentStepIndex && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {i === currentStepIndex && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        i < currentStepIndex ? "text-gray-900 font-medium" :
                        i === currentStepIndex ? "text-gray-900 font-medium" :
                        "text-gray-400"
                      }`}>{stepLabel}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
