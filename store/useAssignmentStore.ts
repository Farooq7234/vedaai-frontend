import { create } from 'zustand';
import { GeneratedPaper, AssignmentFormData } from '@/types';

interface JobState {
  assignmentId: string | null;
  jobStatus: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  progressStep: string;
  errorMessage: string | null;
}

interface AssignmentStore extends JobState {
  formData: Partial<AssignmentFormData>;
  paper: GeneratedPaper | null;

  setFormData: (data: Partial<AssignmentFormData>) => void;
  setAssignmentId: (id: string) => void;
  setJobStatus: (status: JobState['jobStatus'], progress?: number, step?: string) => void;
  setError: (message: string) => void;
  setPaper: (paper: GeneratedPaper) => void;
  reset: () => void;
}

const initialJobState: JobState = {
  assignmentId: null,
  jobStatus: 'idle',
  progress: 0,
  progressStep: '',
  errorMessage: null,
};

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  formData: {},
  paper: null,
  ...initialJobState,

  setFormData: (data) => set((s) => ({ formData: { ...s.formData, ...data } })),
  setAssignmentId: (id) => set({ assignmentId: id, jobStatus: 'pending', progress: 0, errorMessage: null }),
  setJobStatus: (status, progress = 0, step = '') =>
    set({ jobStatus: status, progress, progressStep: step }),
  setError: (message) => set({ jobStatus: 'failed', errorMessage: message }),
  setPaper: (paper) => set({ paper, jobStatus: 'completed', progress: 100 }),
  reset: () => set({ ...initialJobState, formData: {}, paper: null }),
}));
