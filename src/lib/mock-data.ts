import type { Grade, Teacher } from './types';

// This file is now deprecated for grades and teachers, as they are fetched from Firestore.
// It can be removed or kept for reference.

export const initialGrades: Grade[] = [
  { id: 'g1', name: '3°' },
  { id: 'g2', name: '4°' },
  { id: 'g3', name: '5°' },
  { id: 'g4', name: '6°' },
  { id: 'g5', name: '7°' },
  { id: 'g6', name: '8°' },
  { id: 'g7', name: '9°' },
  { id: 'g8', name: '10°' },
  { id: 'g9', name: '11°' },
];

export const initialTeachers: Teacher[] = [
  { id: 't1', name: 'Dra. Evelyn Reed', subject: 'Física', grades: ['g7', 'g8', 'g9'] },
  { id: 't2', name: 'Sr. Samuel Carter', subject: 'Historia', grades: ['g5', 'g6', 'g7'] },
  { id: 't3', name: 'Sra. Clara Evans', subject: 'Literatura', grades: ['g1', 'g2', 'g3', 'g4'] },
  { id: 't4', name: 'Sr. Benjamin Hayes', subject: 'Matemáticas', grades: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9'] },
  { id: 't5', name: 'Sra. Olivia Chen', subject: 'Química', grades: ['g8', 'g9'] },
  { id: 't6', name: 'Sr. Leo Rodriguez', subject: 'Educación Física', grades: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'] },
];