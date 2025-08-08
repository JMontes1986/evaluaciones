
import { getGrades } from "@/app/actions";
import { AddStudentForm } from "@/components/add-student-form";
import { StudentUpload } from "@/components/student-upload";

export default async function ConfigurationPage() {
    const grades = await getGrades();

    return (
        <div className="flex flex-col flex-1">
             <div className="space-y-2 mb-6">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Configuración</h1>
                <p className="text-muted-foreground">Gestiona los estudiantes del sistema.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <AddStudentForm grades={grades} />
                <StudentUpload />
            </div>
        </div>
    );
}
