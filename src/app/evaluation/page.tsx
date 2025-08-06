
import { EvaluationForm } from "@/components/evaluation-form";
import { AppHeader } from "@/components/header";
import { cookies } from "next/headers";
import type { Student } from "@/lib/types";
import { StudentLogin } from "@/components/student-login";


export default function EvaluationPage() {
    const studentCookie = cookies().get("student_session")?.value;
    const student: Student | null = studentCookie ? JSON.parse(studentCookie) : null;

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
            <EvaluationForm student={student} />
          ) : (
            <StudentLogin />
          )}
        </div>
      </main>
    </div>
  );
}
