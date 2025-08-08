
"use client"

import { useState, useMemo, useCallback, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, Users, Star, GraduationCap } from "lucide-react";
import type { Evaluation, Teacher, Grade } from "@/lib/types";
import { evaluationQuestions } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";
import { getDashboardData } from "@/app/actions";

export function DashboardClient() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState<Evaluation[]>([]);
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const data = await getDashboardData();
        if (data) {
          const { evaluations: evals, grades: gradesData, teachers: teachersData } = data;
          setEvaluations(evals || []);
          setFilteredData(evals || []);
          setGrades(gradesData || []);
          setTeachers(teachersData || []);
        } else {
            setEvaluations([]);
            setFilteredData([]);
            setGrades([]);
            setTeachers([]);
        }

      } catch (error) {
        console.error("Error fetching data: ", error);
        setEvaluations([]);
        setFilteredData([]);
        setGrades([]);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filterData = useCallback(() => {
    let data = evaluations;
    if (selectedGrade !== "all") {
      data = data.filter(e => e.gradeId === selectedGrade);
    }
    if (selectedTeacher !== "all") {
      data = data.filter(e => e.teacherId === selectedTeacher);
    }
    setFilteredData(data);
  }, [evaluations, selectedGrade, selectedTeacher]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const getAverageScore = (evals: Evaluation[]) => {
    if (evals.length === 0) return 0;
    const totalScore = evals.reduce((acc, curr) => {
      if (!curr.scores) return acc;
      const scores = Object.values(curr.scores);
      if (scores.length === 0) return acc;
      return acc + scores.reduce((sAcc, sCurr) => sAcc + sCurr, 0) / scores.length;
    }, 0);
    return (totalScore / evals.length);
  };
  
  const overallAverage = useMemo(() => getAverageScore(filteredData).toFixed(2), [filteredData]);
  const uniqueStudents = useMemo(() => new Set(filteredData.map(e => e.studentId)).size, [filteredData]);

  const teacherAverages = useMemo(() => {
    const teacherData = teachers.map(teacher => {
      const teacherEvals = filteredData.filter(e => e.teacherId === teacher.id);
      if (teacherEvals.length === 0) return null;
      return {
        name: teacher.name,
        average: getAverageScore(teacherEvals).toFixed(2),
        evaluations: teacherEvals.length
      }
    }).filter(Boolean) as { name: string; average: string; evaluations: number }[];
    return teacherData.sort((a,b) => Number(b.average) - Number(a.average));
  }, [filteredData, teachers]);

  const gradeAverages = useMemo(() => {
    return (grades.map((grade) => {
      const gradeEvals = filteredData.filter(e => e.gradeId === grade.id);
       if (gradeEvals.length === 0) return null;
      return {
        name: grade.name,
        average: getAverageScore(gradeEvals).toFixed(2),
        evaluations: gradeEvals.length
      };
    }).filter(Boolean)) as { name: string; average: string; evaluations: number }[];
  }, [filteredData, grades]);
  
  const questionAverages = useMemo(() => {
    return (evaluationQuestions.map(q => {
      const scores = filteredData.flatMap(e => e.scores?.[q.id] ? [e.scores[q.id]] : []).filter(s => typeof s === 'number');
      if (scores.length === 0) return null;
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      return { name: q.text.substring(0, 25) + "...", average: average.toFixed(2) };
    }).filter(Boolean)) as { name: string; average: string }[];
  }, [filteredData]);


  const exportToCSV = () => {
    const headers = ["evaluationId", "teacherName", "gradeName", ...evaluationQuestions.map(q => q.text), "feedback", "date"];
    const csvRows = [headers.join(",")];
    
    filteredData.forEach(e => {
      const teacherName = teachers.find(t => t.id === e.teacherId)?.name || "";
      const gradeName = grades.find(g => g.id === e.gradeId)?.name || "";
      const scores = evaluationQuestions.map(q => e.scores[q.id] || "");
      const row = [e.id, teacherName, gradeName, ...scores, `"${e.feedback}"`, e.createdAt].join(",");
      csvRows.push(row);
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "gradewise_export.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[350px]" />
          </CardContent>
        </Card>
      </div>
    );
  }
  

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>Refina los datos que se muestran en el tablero.</CardDescription>
            </div>
            <Button onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" /> Exportar a CSV
            </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Grado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Grados</SelectItem>
              {grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Profesor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Profesores</SelectItem>
              {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluaciones Totales</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <p className="text-xs text-muted-foreground">En todos los filtros</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntuación Media General</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAverage} / 4</div>
            <p className="text-xs text-muted-foreground">Basado en las puntuaciones enviadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes que Participaron</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueStudents}</div>
            <p className="text-xs text-muted-foreground">Envíos únicos de estudiantes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profesores Evaluados</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(filteredData.map(e => e.teacherId)).size}</div>
            <p className="text-xs text-muted-foreground">Con al menos una evaluación</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="by-teacher">Por Profesor</TabsTrigger>
          <TabsTrigger value="by-grade">Por Grado</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Pregunta</CardTitle>
              <CardDescription>Puntuaciones medias para cada criterio de evaluación.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={questionAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]} />
                  <Tooltip
                    contentStyle={{ 
                      background: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                    cursor={{fill: "hsl(var(--accent) / 0.3)"}}
                  />
                  <Bar dataKey="average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="by-teacher">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento del Profesor</CardTitle>
              <CardDescription>Puntuaciones medias para cada profesor.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={teacherAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]}/>
                  <Tooltip
                     contentStyle={{ 
                      background: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                    cursor={{fill: "hsl(var(--accent) / 0.3)"}}
                  />
                  <Bar dataKey="average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="by-grade">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento del Grado</CardTitle>
              <CardDescription>Puntuaciones medias para cada nivel de grado.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={gradeAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]}/>
                  <Tooltip
                    contentStyle={{ 
                      background: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                    cursor={{fill: "hsl(var(--accent) / 0.3)"}}
                  />
                  <Bar dataKey="average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
