export interface Teacher {
  id: string;
  name: string;
  subject: string;
  grades: string[];
}

export interface Grade {
  id: string;
  name: string;
}

export interface Evaluation {
  id: string;
  teacherId: string;
  gradeId: string;
  studentId: string; // Anonymized
  scores: { [questionId: string]: number };
  feedback: string;
  createdAt: string;
}

export const evaluationQuestions = [
  { id: 'q1', text: 'Demonstrates deep knowledge of the subject.' },
  { id: 'q2', text: 'Communicates concepts clearly and effectively.' },
  { id: 'q3', text: 'Creates an engaging and inclusive learning environment.' },
  { id: 'q4', text: 'Provides timely and constructive feedback on assignments.' },
  { id: 'q5', text: 'Is approachable and available for help.' },
];
