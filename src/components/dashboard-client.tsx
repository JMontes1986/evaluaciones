'use client'

import { useState, useMemo, useCallback } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, BarChart3, Users, Star, GraduationCap } from 'lucide-react';
import { evaluations, teachers, grades } from '@/lib/mock-data';
import type { Evaluation, Teacher, Grade } from '@/lib/types';
import { evaluationQuestions } from '@/lib/mock-data';

export function DashboardClient() {
  const [filteredData, setFilteredData] = useState<Evaluation[]>(evaluations);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');

  const filterData = useCallback(() => {
    let data = evaluations;
    if (selectedGrade !== 'all') {
      data = data.filter(e => e.gradeId === selectedGrade);
    }
    if (selectedTeacher !== 'all') {
      data = data.filter(e => e.teacherId === selectedTeacher);
    }
    setFilteredData(data);
  }, [selectedGrade, selectedTeacher]);

  useMemo(() => {
    filterData();
  }, [filterData]);

  const getAverageScore = (evals: Evaluation[]) => {
    if (evals.length === 0) return 0;
    const totalScore = evals.reduce((acc, curr) => {
      const scores = Object.values(curr.scores);
      return acc + scores.reduce((sAcc, sCurr) => sAcc + sCurr, 0) / scores.length;
    }, 0);
    return (totalScore / evals.length).toFixed(2);
  };
  
  const overallAverage = useMemo(() => getAverageScore(filteredData), [filteredData]);
  const uniqueStudents = useMemo(() => new Set(filteredData.map(e => e.studentId)).size, [filteredData]);

  const teacherAverages = useMemo(() => {
    const teacherData = teachers.map(teacher => {
      const teacherEvals = filteredData.filter(e => e.teacherId === teacher.id);
      if (teacherEvals.length === 0) return null;
      return {
        name: teacher.name,
        average: getAverageScore(teacherEvals),
        evaluations: teacherEvals.length
      }
    }).filter(Boolean);
    return teacherData.sort((a,b) => Number(b.average) - Number(a.average));
  }, [filteredData]);

  const gradeAverages = useMemo(() => {
    return grades.map(grade => {
      const gradeEvals = filteredData.filter(e => e.gradeId === grade.id);
       if (gradeEvals.length === 0) return null;
      return {
        name: grade.name,
        average: getAverageScore(gradeEvals),
        evaluations: gradeEvals.length
      }
    }).filter(Boolean);
  }, [filteredData]);
  
  const questionAverages = useMemo(() => {
    return evaluationQuestions.map(q => {
      const scores = filteredData.map(e => e.scores[q.id]).filter(Boolean);
      if (scores.length === 0) return null;
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      return { name: q.text.substring(0, 25) + '...', average: average.toFixed(2) };
    }).filter(Boolean);
  }, [filteredData]);


  const exportToCSV = () => {
    const headers = ['evaluationId', 'teacherName', 'gradeName', ...evaluationQuestions.map(q => q.text), 'feedback', 'date'];
    const csvRows = [headers.join(',')];
    
    filteredData.forEach(e => {
      const teacherName = teachers.find(t => t.id === e.teacherId)?.name || '';
      const gradeName = grades.find(g => g.id === e.gradeId)?.name || '';
      const scores = evaluationQuestions.map(q => e.scores[q.id] || '');
      const row = [e.id, teacherName, gradeName, ...scores, `"${e.feedback}"`, e.createdAt].join(',');
      csvRows.push(row);
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'gradewise_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Refine the data shown on the dashboard.</CardDescription>
            </div>
            <Button onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" /> Export to CSV
            </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger>
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger>
              <SelectValue placeholder="Select Teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <p className="text-xs text-muted-foreground">Across all filters</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAverage} / 5</div>
            <p className="text-xs text-muted-foreground">Based on submitted scores</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Participated</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueStudents}</div>
            <p className="text-xs text-muted-foreground">Unique student submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers Evaluated</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(filteredData.map(e => e.teacherId)).size}</div>
            <p className="text-xs text-muted-foreground">With at least one evaluation</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-teacher">By Teacher</TabsTrigger>
          <TabsTrigger value="by-grade">By Grade</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Question</CardTitle>
              <CardDescription>Average scores for each evaluation criterion.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={questionAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 5]} />
                  <Tooltip
                    contentStyle={{ 
                      background: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                    cursor={{fill: 'hsl(var(--accent) / 0.3)'}}
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
              <CardTitle>Teacher Performance</CardTitle>
              <CardDescription>Average scores for each teacher.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={teacherAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 5]}/>
                  <Tooltip
                     contentStyle={{ 
                      background: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                    cursor={{fill: 'hsl(var(--accent) / 0.3)'}}
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
              <CardTitle>Grade Performance</CardTitle>
              <CardDescription>Average scores for each grade level.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={gradeAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 5]}/>
                  <Tooltip
                    contentStyle={{ 
                      background: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                    cursor={{fill: 'hsl(var(--accent) / 0.3)'}}
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
