
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

export interface Student {
    id: string;
    name: string;
    code: string;
    gradeId: string;
}

export interface Evaluation {
  id: string;
  teacherId: string;
  gradeId: string;
  studentId: string; 
  scores: { [questionId: string]: number };
  feedback: string;
  createdAt: string;
}

export const evaluationQuestions = [
  { id: "q1", text: "Demuestra dominio en los temas explicados en clase" },
  { id: "q2", text: "Presenta los temas con claridad" },
  { id: "q3", text: "Comunica el propósito de cada clase." },
  { id: "q4", text: "Responde las preguntas planteadas por los estudiantes." },
  { id: "q5", text: "Es puntual para iniciar y finalizar   las clases." },
  { id: "q6", text: "Explica los criterios de evaluación de la materia." },
  { id: "q7", text: "Representa figura de autoridad y controla la disciplina del grupo." },
  { id: "q8", text: "Revisa con frecuencia módulos y cuadernos" },
  { id: "q9", text: "Da a conocer oportunamente los resultados de las evaluaciones." },
  { id: "q10", text: "Indica normas de comportamiento en clase claras para todos" },
  { id: "q11", text: "El docente es respetado por los estudiantes del curso" },
  { id: "q12", text: "Realiza clases lúdicas y dinámicas" },
  { id: "q13", text: "Utiliza las herramientas tecnológicas del aula para dinamizar los procesos de enseñanza aprendizaje." },
  { id: "q14", text: "Actualiza el sistema académico de manera periódica, ingresando notas, tareas y evaluaciones." },
  { id: "q15", text: "Demuestra planeación y organización en el desarrollo del contenido de la asignatura" },
  { id: "q16", text: "Demuestra en su cotidianidad liderazgo positivo con estudiantes" },
  { id: "q17", text: "Escucha y atiende oportunamente las inquietudes e ideas de los estudiantes" },
  { id: "q18", text: "Refuerza las actitudes positivas de los estudiantes" },
  { id: "q19", text: "Establece y hace seguimiento a las estrategias que favorecen la sana convivencia escolar." },
  { id: "q20", text: "Promueve en sus estudiantes valores y actitud franciscana y lo demuestra con su ejemplo." },
  { id: "q21", text: "Relaciona los contenidos de su área con los contenidos de otras asignaturas" },
  { id: "q22", text: "El docente realiza la socialización y retroalimentación de las pruebas de seguimiento y/o simulacros." },
  { id: "q23", text: "El docente realiza evaluaciones claras, que se relacionan directamente con los aprendizajes orientados durante las clases." }
];
