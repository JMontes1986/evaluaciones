
import { getAdminDb } from './firebase/admin';
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
    { name: "Elizabeth Isaza Isaza", subject: "Matemáticas", grades: ["3°"] },
    { name: "Lina María Restrepo Pineda", subject: "Lengua Castellana", grades: ["3°"] },
    { name: "Luz Dary Zapata Rincón", subject: "Sociales", grades: ["3°"] },
    { name: "Juan Camilo Arroyave Castrillón", subject: "Inglés", grades: ["3°"] },
    { name: "Sandra Milena Lopera Lopera", subject: "Religión", grades: ["3°"] },
    { name: "Beatriz Elena Monsalve Jaramillo", subject: "Ética y Valores", grades: ["3°"] },
    { name: "Oscar Iván Avendaño Garcia", subject: "Música", grades: ["3°"] },
    { name: "Jorge Andrés Marín Osorno", subject: "Arte", grades: ["3°"] },
    { name: "Lucas Restrepo Mesa", subject: "Danzas", grades: ["3°"] },
    { name: "Walter Alonso Muñetón Cano", subject: "Educación Física", grades: ["3°"] },
    { name: "Sandra Patricia Pérez Mesa", subject: "Informática", grades: ["3°"] }
];

const initialStudents: (Omit<Student, 'id'|'gradeId'> & {gradeName: string})[] = [
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
  let exitCode = 0;
  console.log("🌱 Starting to seed the database...");

  try {
    const adminDb = getAdminDb();
    const gradesCollectionRef = adminDb.collection("grades");
    const gradeIdMap = new Map<string, string>();

    console.log("📚 Seeding grades...");
    for (const grade of initialGrades) {
        const q = gradesCollectionRef.where("name", "==", grade.name);
        const querySnapshot = await q.get();
        if (querySnapshot.empty) {
            const docRef = await gradesCollectionRef.add(grade);
            gradeIdMap.set(grade.name, docRef.id);
            console.log(` -> Added grade: ${grade.name}`);
        } else {
            const docId = querySnapshot.docs[0].id;
            gradeIdMap.set(grade.name, docId);
            console.log(` -> Grade already exists: ${grade.name}`);
        }
    }
    console.log("✅ Grades seeded successfully.");


    const teachersCollectionRef = adminDb.collection("teachers");
    console.log("\n👩‍🏫 Seeding teachers...");
    for (const teacher of initialTeachers) {
        const q = teachersCollectionRef.where("name", "==", teacher.name);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            const gradeIds = teacher.grades.map(gradeName => gradeIdMap.get(gradeName)).filter(Boolean) as string[];
            if (gradeIds.length > 0) {
                 await teachersCollectionRef.add({ ...teacher, grades: gradeIds });
                 console.log(` -> Added teacher: ${teacher.name}`);
            } else {
                 console.warn(` -> Could not add teacher '${teacher.name}' due to missing grade ID.`);
            }
        } else {
            console.log(` -> Teacher already exists: ${teacher.name}`);
        }
    }
     console.log("✅ Teachers seeded successfully.");


    const studentsCollectionRef = adminDb.collection("students");
    console.log("\n👨‍🎓 Seeding students...");
    for (const student of initialStudents) {
      const q = studentsCollectionRef.where("code", "==", student.code);
      const querySnapshot = await q.get();

      if (querySnapshot.empty) {
        const gradeId = gradeIdMap.get(student.gradeName);
        if (gradeId) {
          const { gradeName, ...studentData } = student;
          await studentsCollectionRef.add({ ...studentData, gradeId });
          console.log(` -> Added student: ${student.name}`);
        } else {
          console.warn(` -> Could not add student '${student.name}' due to missing grade ID for grade '${student.gradeName}'.`);
        }
      } else {
        console.log(` -> Student with code ${student.code} already exists: ${student.name}`);
      }
    }
    console.log("✅ Students seeded successfully.");

    console.log("\n✨ Database seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding the database:", error);
    exitCode = 1;
  } finally {
    console.log(`\nScript finished with exit code ${exitCode}.`);
    // process.exit(exitCode); // <-- This line causes issues in some environments.
  }
}

seedDatabase();
