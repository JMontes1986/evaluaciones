
import { adminDb } from "./firebase/admin"; // Usar la instancia de admin
import type { Grade, Teacher, Student } from "./types";

const initialGrades: Omit<Grade, "id">[] = [
  { name: "3°" },
  { name: "4°" },
  { name: "5°" },
  { name: "6°" },
  { name: "7°" },
  { name: "8°" },
  { name: "9°" },
  { name: "10°" },
  { name: "11°" },
];

const initialTeachers: Omit<Teacher, "id">[] = [
  { name: "Natalia Valencia Benítez", subject: "Ciencias Naturales", grades: ["g1"] },
];

const initialStudents: Omit<Student, "id"|'gradeId'> & {gradeName: string}[] = [
    { name: "ARCILA DÍAZ SAMANTHA", code: "5540", gradeName: "3°" },
    { name: "ARÍAS GONZÁLEZ DAMIAN", code: "5741", gradeName: "3°" },
    { name: "BOTERO GIRALDO SANTIAGO", code: "5593", gradeName: "3°" },
    { name: "CALLE DÁVILA ANTONIO", code: "5502", gradeName: "3°" },
    { name: "CASAS GARCIA EMMANUEL", code: "5619", gradeName: "3°" },
    { name: "CASTRILLÓN OROZCO MARÍA PAZ", code: "5539", gradeName: "3°" },
    { name: "DUQUE VALENCIA SAMANTHA", code: "5519", gradeName: "3°" },
    { name: "FERNANDEZ RAMIREZ JUAN ANDRES", code: "5615", gradeName: "3°" },
    { name: "FRANCO MORENO JOAQUÍN", code: "5686", gradeName: "3°" },
    { name: "GALLEGO GARCIA GABRIELA", code: "5627", gradeName: "3°" },
    { name: "GARCÍA LEÓN KATHERINE", code: "5493", gradeName: "3°" },
    { name: "HOYOS MISAS LUCIA", code: "5491", gradeName: "3°" },
    { name: "ISAZA LONDOÑO ANTONIA", code: "5504", gradeName: "3°" },
    { name: "LÓPEZ CASTAÑO TOMÁS", code: "5526", gradeName: "3°" },
    { name: "MARTÍNEZ ALVAREZ VICTORIA", code: "5651", gradeName: "3°" },
    { name: "MUNEVAR GRANADOS VALERI LUCIANA", code: "5543", gradeName: "3°" },
    { name: "NARANJO LÓPEZ LUCIANA", code: "5562", gradeName: "3°" },
    { name: "OSORIO LOPERA ANTONIA", code: "5628", gradeName: "3°" },
    { name: "OSPINA ECHEVERRY EMILIANO", code: "5608", gradeName: "3°" },
    { name: "PATIÑO HIGUITA ISABELLA", code: "5705", gradeName: "3°" },
    { name: "PAVA GONZÁLEZ JUAN JOSÉ", code: "5671", gradeName: "3°" },
    { name: "RESTREPO LONDOÑO MARTÍN", code: "5735", gradeName: "3°" },
    { name: "RUANO MUÑOZ JOSÉ FERNANDO", code: "5658", gradeName: "3°" },
    { name: "SALAZAR CASTAÑEDA MATÍAS", code: "5503", gradeName: "3°" },
    { name: "SALAZAR QUINTERO SAMUEL", code: "5604", gradeName: "3°" },
    { name: "SANCHEZ ARBOLEDA ANTONIA", code: "5606", gradeName: "3°" },
    { name: "SERNA TRUJILLO FEDERICO", code: "5514", gradeName: "3°" },
    { name: "TRUJILLO AGUIRRE MARTIN", code: "5623", gradeName: "3°" },
    { name: "URUEÑA CRUZ DANNA ISABELLA", code: "5563", gradeName: "3°" }
];


async function seedDatabase() {
  console.log("🌱 Empezando a poblar la base de datos...");
  let exitCode = 0;
  const db = adminDb; // Alias para compatibilidad

  try {
    // ---- Poblar Grados ----
    const gradesCollection = db.collection("grades");
    const gradesBatch = db.batch();
    console.log("🗑️ Borrando grados existentes...");
    const existingGrades = await gradesCollection.get();
    existingGrades.docs.forEach(doc => gradesBatch.delete(doc.ref));
    await gradesBatch.commit();
    
    const newGradesBatch = db.batch();
    const gradeIdMap = new Map<string, string>();
    console.log("📚 Añadiendo grados...");
    initialGrades.forEach((grade) => {
      const docRef = gradesCollection.doc(); // Firestore auto-generates ID
      newGradesBatch.set(docRef, grade);
      gradeIdMap.set(grade.name, docRef.id);
    });
    await newGradesBatch.commit();
    console.log("✅ Grados añadidos con éxito.");

    // ---- Poblar Profesores ----
    const teachersCollection = db.collection("teachers");
    const teachersBatch = db.batch();
    console.log("🗑️ Borrando profesores existentes...");
    const existingTeachers = await teachersCollection.get();
    existingTeachers.docs.forEach(doc => teachersBatch.delete(doc.ref));
    await teachersBatch.commit();

    const newTeachersBatch = db.batch();
    console.log("👩‍🏫 Añadiendo profesores...");
    initialTeachers.forEach((teacher) => {
      const docRef = teachersCollection.doc();
      const gradeIds = teacher.grades.map(gradeName => gradeIdMap.get(gradeName)).filter(Boolean) as string[];
      newTeachersBatch.set(docRef, { ...teacher, grades: gradeIds });
    });
    await newTeachersBatch.commit();
    console.log("✅ Profesores añadidos con éxito.");

    // ---- Poblar Estudiantes ----
    const studentsCollection = db.collection("students");
    const studentsBatch = db.batch();
    console.log("🗑️ Borrando estudiantes existentes...");
    const existingStudents = await studentsCollection.get();
    existingStudents.docs.forEach(doc => studentsBatch.delete(doc.ref));
    await studentsBatch.commit();

    const newStudentsBatch = db.batch();
    console.log("👨‍🎓 Añadiendo estudiantes...");
    initialStudents.forEach((student) => {
        const gradeId = gradeIdMap.get(student.gradeName);
        if (gradeId) {
            const docRef = studentsCollection.doc();
            const { gradeName, ...studentData } = student;
            newStudentsBatch.set(docRef, { ...studentData, gradeId });
        } else {
            console.warn(`Grado no encontrado para '${student.gradeName}'. Saltando estudiante: ${student.name}`);
        }
    });
    await newStudentsBatch.commit();
    console.log("✅ Estudiantes añadidos con éxito.");

    console.log("✨ ¡Base de datos poblada exitosamente!");

  } catch (error) {
    console.error("❌ Error poblando la base de datos:", error);
    exitCode = 1;
  } finally {
    process.exit(exitCode);
  }
}

seedDatabase();

    