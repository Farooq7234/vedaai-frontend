export interface Question {
  number: number;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  type: string;
  options?: string[];
}

export interface Section {
  label: string;
  instruction: string;
  questions: Question[];
  totalMarks: number;
}

export interface PaperMetadata {
  totalMarks: number;
  totalQuestions: number;
  generatedAt: string;
  subject: string;
  topic: string;
  gradeLevel: string;
}

export interface GeneratedPaper {
  _id: string;
  assignmentId: string;
  sections: Section[];
  metadata: PaperMetadata;
}

export interface Assignment {
  _id: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: string;
  dueDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  jobId?: string;
}

export interface AssignmentFormData {
  subject: string;
  topic: string;
  gradeLevel: string;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  additionalInstructions: string;
  dueDate: string;
  file?: File;
}
