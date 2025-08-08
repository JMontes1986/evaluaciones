
"use client";

import { useState, useEffect } from "react";
import type { Grade } from "@/lib/types";
import { getGrades } from "@/app/actions";
import { AddStudentForm } from "@/components/add-student-form";
import { StudentUpload } from "@/components/student-upload";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConfigurationPage() {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            setLoading(true);
            try {
                const gradesData = await getGrades();
                setGrades(gradesData || []);
            } catch (error) {
                console.error("Error fetching grades:", error);
                setGrades([]);
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, []);

    return (
        <div className="flex flex-col flex-1">
             <div className="space-y-2 mb-6">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Configuración</h1>
                <p className="text-muted-foreground">Gestiona los estudiantes del sistema.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <Skeleton className="h-[450px] w-full" />
                    <Skeleton className="h-[450px] w-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <AddStudentForm grades={grades} />
                    <StudentUpload />
                </div>
            )}
        </div>
    );
}
