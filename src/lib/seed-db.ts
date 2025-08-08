
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
  { name: "Natalia Valencia Benítez", subject: "Ciencias Naturales", grades: ["3°"] },
];

const initialStudents: Omit<Student, 'id'|'gradeId'> & {gradeName: string}[] = [
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
  const db = adminDb; 

  try {
    // ---- Poblar Grados ----
    console.log("📚 Añadiendo grados...");
    const gradesCollection = db.collection("grades");
    // Primero, obtener todos los grados existentes para no duplicar por nombre
    const existingGradesSnapshot = await gradesCollection.get();
    const existingGradesMap = new Map(existingGradesSnapshot.docs.map(doc => [doc.data().name, doc.id]));

    const gradeIdMap = new Map<string, string>(existingGradesMap);

    const gradesBatch = db.batch();
    for (const grade of initialGrades) {
        if (!existingGradesMap.has(grade.name)) {
            const docRef = gradesCollection.doc();
            gradesBatch.set(docRef, grade);
            gradeIdMap.set(grade.name, docRef.id);
            console.log(` -> Grado a añadir: ${grade.name}`);
        } else {
            console.log(` -> Grado ya existe: ${grade.name}`);
        }
    }
    await gradesBatch.commit();
    console.log("✅ Grados procesados con éxito.");

    // ---- Poblar Profesores ----
     console.log("👩‍🏫 Añadiendo profesores...");
    const teachersCollection = db.collection("teachers");
    const existingTeachersSnapshot = await teachersCollection.get();
    const existingTeachersSet = new Set(existingTeachersSnapshot.docs.map(doc => doc.data().name));
    
    const teachersBatch = db.batch();
    for (const teacher of initialTeachers) {
        if(!existingTeachersSet.has(teacher.name)) {
            const docRef = teachersCollection.doc();
            const gradeIds = teacher.grades.map(gradeName => gradeIdMap.get(gradeName)).filter(Boolean) as string[];
            if(gradeIds.length > 0) {
                teachersBatch.set(docRef, { ...teacher, grades: gradeIds });
                console.log(` -> Profesor a añadir: ${teacher.name}`);
            } else {
                 console.warn(` -> Saltando profesor '${teacher.name}' porque su grado no fue encontrado.`);
            }
        } else {
            console.log(` -> Profesor ya existe: ${teacher.name}`);
        }
    }
    await teachersBatch.commit();
    console.log("✅ Profesores procesados con éxito.");

    // ---- Poblar Estudiantes ----
    console.log("👨‍🎓 Añadiendo estudiantes...");
    const studentsCollection = db.collection("students");
    const existingStudentsSnapshot = await studentsCollection.get();
    const existingCodesSet = new Set(existingStudentsSnapshot.docs.map(doc => doc.data().code));
    
    const studentsBatch = db.batch();
    for (const student of initialStudents) {
        if (!existingCodesSet.has(student.code)) {
            const gradeId = gradeIdMap.get(student.gradeName);
            if (gradeId) {
                const docRef = studentsCollection.doc();
                const { gradeName, ...studentData } = student;
                studentsBatch.set(docRef, { ...studentData, gradeId });
                console.log(` -> Estudiante a añadir: ${student.name}`);
            } else {
                console.warn(` -> Saltando estudiante '${student.name}' porque su grado '${student.gradeName}' no fue encontrado.`);
            }
        } else {
             console.log(` -> Estudiante con código ${student.code} ya existe: ${student.name}`);
        }
    }
    await studentsBatch.commit();
    console.log("✅ Estudiantes procesados con éxito.");


    console.log("✨ ¡Base de datos poblada exitosamente!");

  } catch (error) {
    console.error("❌ Error poblando la base de datos:", error);
    exitCode = 1;
  } finally {
    // Forzar la salida del proceso para asegurar que el script termine.
    process.exit(exitCode);
  }
}

seedDatabase();

    