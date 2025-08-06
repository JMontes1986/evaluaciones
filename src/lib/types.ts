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
  { id: 'q1', text: 'Demuestra un profundo conocimiento de la materia.' },
  { id: 'q2', text: 'Comunica los conceptos de forma clara y eficaz.' },
  { id: 'q3', text: 'Crea un ambiente de aprendizaje atractivo e inclusivo.' },
  { id: 'q4', text: 'Proporciona comentarios oportunos y constructivos sobre las tareas.' },
  { id: 'q5', text: 'Es accesible y está disponible para ayudar.' },
];
