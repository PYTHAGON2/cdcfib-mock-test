
export enum QuestionType {
  MultipleChoice = 'MCQ',
  TrueFalse = 'TF',
  FillInTheBlank = 'FIB',
}

export interface Question {
  id: string;
  questionText: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  note?: string;
}

export interface TimerConfig {
  type: 'per-question' | 'total';
  duration: number; // in seconds
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalQuestions: number;
  questionsToSelect: number;
  timer: TimerConfig;
  questions: Question[];
  showNotesAfterQuestion?: boolean;
}

export interface UserAnswer {
  questionId: string;
  answer: string | string[] | null;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  userName: string;
  ipAddress: string;
  device: string;
  score: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  timestamp: number;
  answers: UserAnswer[];
  comment?: string;
}

export interface User {
  name: string;
  ip: string;
  device: string;
}
