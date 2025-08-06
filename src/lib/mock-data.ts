import type { Grade, Teacher, Evaluation } from './types';

export const grades: Grade[] = [
  { id: 'g1', name: '9º Grado' },
  { id: 'g2', name: '10º Grado' },
  { id: 'g3', name: '11º Grado' },
  { id: 'g4', name: '12º Grado' },
];

export const teachers: Teacher[] = [
  { id: 't1', name: 'Dra. Evelyn Reed', subject: 'Física', grades: ['g3', 'g4'] },
  { id: 't2', name: 'Sr. Samuel Carter', subject: 'Historia', grades: ['g1', 'g2'] },
  { id: 't3', name: 'Sra. Clara Evans', subject: 'Literatura', grades: ['g1', 'g3', 'g4'] },
  { id: 't4', name: 'Sr. Benjamin Hayes', subject: 'Matemáticas', grades: ['g1', 'g2', 'g3', 'g4'] },
  { id: 't5', name: 'Sra. Olivia Chen', subject: 'Química', grades: ['g2', 'g3'] },
  { id: 't6', name: 'Sr. Leo Rodriguez', subject: 'Educación Física', grades: ['g1', 'g2'] },
];

const generateRandomEvaluations = (): Evaluation[] => {
  const evaluations: Evaluation[] = [];
  let evalId = 1;
  for (const grade of grades) {
    const gradeTeachers = teachers.filter(t => t.grades.includes(grade.id));
    for (let i = 1; i <= 20; i++) { // 20 students per grade
      for (const teacher of gradeTeachers) {
        if (Math.random() > 0.2) { // not all students evaluate all teachers
          const scores: { [key: string]: number } = {};
          for (let q = 1; q <= 5; q++) {
            scores[`q${q}`] = Math.floor(Math.random() * 3) + 3; // Scores between 3 and 5
          }
          evaluations.push({
            id: `eval${evalId++}`,
            teacherId: teacher.id,
            gradeId: grade.id,
            studentId: `student${i}_${grade.id}`,
            scores,
            feedback: "Buena clase, pero podría ser más interactiva.",
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }
    }
  }
  return evaluations;
};

export const evaluations: Evaluation[] = generateRandomEvaluations();
