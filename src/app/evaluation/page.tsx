
import { EvaluationForm } from "@/components/evaluation-form";
import { AppHeader } from "@/components/header";
import { cookies } from "next/headers";
import type { Student, Teacher, Grade, Evaluation } from "@/lib/types";
import { StudentLogin } from "@/components/student-login";
import { getGrades, getTeachers, getEvaluationsByStudent } from "@/app/actions";

async function getEvaluationData(student: Student | null) {
  if (!student) {
    return {
      grades: [],
      availableTeachers: [],
      studentGradeName: "",
    };
  }

  try {
    const [gradesData, teachersData, pastEvaluations] = await Promise.all([
      getGrades(),
      getTeachers(),
      getEvaluationsByStudent(student.id),
    ]);

    const evaluatedTeacherIds = new Set(pastEvaluations.map(e => e.teacherId));
    
    const availableTeachers = teachersData.filter((t) => 
        t.grades.includes(student.gradeId) && !evaluatedTeacherIds.has(t.id)
    );

    const studentGradeName = gradesData.find(g => g.id === student.gradeId)?.name || "";

    return { grades: gradesData, availableTeachers, studentGradeName };
  } catch (error) {
    console.error("Error fetching evaluation data on server:", error);
    return { grades: [], availableTeachers: [], studentGradeName: "" };
  }
}

export default async function EvaluationPage() {
    const studentCookie = cookies().get("student_session")?.value;
    const student: Student | null = studentCookie ? JSON.parse(studentCookie) : null;
    const { grades, availableTeachers, studentGradeName } = await getEvaluationData(student);

  return (
    <div className="flex flex-col flex-1">
      <AppHeader studentName={student?.name} />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Evaluación de Profesores</h1>
            <p className="text-muted-foreground mt-2">Tus comentarios son anónimos y ayudan a mejorar nuestra escuela.</p>
          </div>
          {student ? (
            <EvaluationForm 
              student={student} 
              initialAvailableTeachers={availableTeachers}
              studentGradeName={studentGradeName}
            />
          ) : (
            <StudentLogin />
          )}
        </div>
      </main>
    </div>
  );
}
