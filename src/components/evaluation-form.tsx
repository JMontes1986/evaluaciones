
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { Teacher, Grade, Student, Evaluation } from "@/lib/types";
import { evaluationQuestions } from "@/lib/types";
import { Textarea } from "./ui/textarea";
import { Send, User } from "lucide-react";
import { useActionState } from "react";
import { submitEvaluation, getGrades, getTeachers, getEvaluationsByStudent } from "@/app/actions";
import { Skeleton } from "./ui/skeleton";
import { FeedbackAssistant } from "./feedback-assistant";
import { cn } from "@/lib/utils";

const evaluationSchema = z.object({
  teacherIds: z.array(z.string()).min(1, "Por favor, selecciona al menos un profesor para evaluar."),
  evaluations: z.record(
    z.string(),
    z.object({
      ...evaluationQuestions.reduce((acc, q) => {
        acc[q.id] = z.string().min(1, `Por favor, califica este criterio.`);
        return acc;
      }, {} as Record<string, z.ZodString>),
      feedback: z.string().optional(),
    })
  ),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

const initialState = {
  success: false,
  message: "",
  errors: null,
};

const ratingOptions = [
    { value: "4", label: "SIEMPRE" },
    { value: "3", label: "CASI SIEMPRE" },
    { value: "2", label: "ALGUNAS VECES" },
    { value: "1", label: "NUNCA" },
];

export function EvaluationForm({ student }: { student: Student }) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(submitEvaluation, initialState);
  
  const studentGradeName = useMemo(() => {
    if (!grades || grades.length === 0) return "";
    return grades.find(g => g.id === student.gradeId)?.name;
  }, [grades, student.gradeId]);


  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      teacherIds: [],
      evaluations: {},
    },
  });
  
  useEffect(() => {
    async function fetchData() {
      try {
        const [gradesData, teachersData, pastEvaluations] = await Promise.all([
          getGrades(),
          getTeachers(),
          getEvaluationsByStudent(student.id),
        ]);
        setGrades(gradesData);
        setTeachers(teachersData);

        const evaluatedTeacherIds = new Set(pastEvaluations.map(e => e.teacherId));
        
        const teachersForGrade = teachersData.filter((t) => 
            t.grades.includes(student.gradeId) && !evaluatedTeacherIds.has(t.id)
        );
        setAvailableTeachers(teachersForGrade);

      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "❌ ¡Error!",
          description: "No se pudieron cargar los datos. Inténtalo de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, student.gradeId, student.id, state.success]); // Re-fetch data on successful submission

  const selectedTeachers = form.watch("teacherIds");

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast({
        title: "✅ ¡Éxito!",
        description: state.message,
        variant: "default",
        className: "bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600",
      });
      form.reset({ teacherIds: [], evaluations: {} });
    } else {
       toast({
        title: "❌ ¡Error!",
        description: state.message,
        variant: "destructive",
      });
    }

  }, [state, toast, form]);

  const handleFormAction = async (formData: FormData) => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "📝 Formulario Incompleto",
        description: "Por favor, responde todas las preguntas obligatorias antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    const values = form.getValues();
    formData.append("evaluations", JSON.stringify(values.evaluations));
    formData.append("teacherIds", JSON.stringify(values.teacherIds));
    formAction(formData);
  }

  if (loading) {
     return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 mt-2 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
     )
  }

  return (
    <FormProvider {...form}>
      <form action={handleFormAction} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Hola, {student.name}</CardTitle>
            <CardDescription>Estás evaluando como estudiante de {studentGradeName || "tu grado"}. Selecciona los profesores para los que deseas dar tu opinión.</CardDescription>
          </CardHeader>
          <CardContent>
               <FormField
                control={form.control}
                name="teacherIds"
                render={() => (
                  <FormItem className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableTeachers.map((teacher) => (
                      <FormField
                        key={teacher.id}
                        control={form.control}
                        name="teacherIds"
                        render={({ field }) => {
                          const isChecked = field.value?.includes(teacher.id);
                          return (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors">
                              <FormControl>
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...(field.value || []), teacher.id]
                                      : (field.value || []).filter(
                                          (value) => value !== teacher.id
                                        );
                                    field.onChange(newValue);
                                    
                                    if (!checked) {
                                      const currentEvals = form.getValues("evaluations");
                                      delete currentEvals[teacher.id];
                                      form.setValue("evaluations", currentEvals);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal w-full cursor-pointer">
                                  <div className="font-semibold">{teacher.name}</div>
                                  <div className="text-sm text-muted-foreground">{teacher.subject}</div>
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                     {availableTeachers.length === 0 && (
                        <p className="text-muted-foreground col-span-full">¡Felicitaciones! Ya has evaluado a todos los profesores disponibles para tu grado.</p>
                    )}
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="teacherIds"
                render={() => (
                   <FormMessage />
                )}
              />
            </CardContent>
        </Card>
        
        {selectedTeachers && selectedTeachers.length > 0 && (
          <Card className="shadow-lg animate-in fade-in-50">
            <CardHeader>
              <CardTitle>Proporciona tu Retroalimentación</CardTitle>
              <CardDescription>Califica a cada profesor según los siguientes criterios y proporciona comentarios por escrito.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full" defaultValue={`item-${selectedTeachers[0]}`}>
                {availableTeachers
                  .filter(t => selectedTeachers.includes(t.id))
                  .map((teacher) => (
                    <AccordionItem value={`item-${teacher.id}`} key={teacher.id}>
                      <AccordionTrigger className="text-lg hover:no-underline">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-secondary rounded-full">
                                <User className="h-5 w-5 text-primary" />
                           </div>
                           <div>
                            <p>{teacher.name}</p>
                            <p className="text-sm font-normal text-muted-foreground">{teacher.subject}</p>
                           </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-2 space-y-6">
                        {evaluationQuestions.map((question) => (
                          <FormField
                            key={question.id}
                            control={form.control}
                            name={`evaluations.${teacher.id}.${question.id}`}
                            render={({ field, fieldState }) => (
                               <FormItem className={cn(
                                "space-y-3 rounded-lg border p-4 transition-colors",
                                fieldState.error && "border-yellow-500/50 bg-yellow-500/10"
                              )}>
                                <FormLabel className="text-base">{question.text}</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap items-center gap-x-6 gap-y-2"
                                  >
                                    {ratingOptions.map((option) => (
                                      <FormItem key={option.value} className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                          <RadioGroupItem value={option.value} />
                                        </FormControl>
                                        <FormLabel className="font-normal">{option.label}</FormLabel>
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                        <FormField
                          control={form.control}
                          name={`evaluations.${teacher.id}.feedback`}
                          render={({ field }) => (
                            <FormItem className="space-y-2 rounded-lg border p-4">
                              <FormLabel>Observaciones (Opcional)</FormLabel>
                                <FeedbackAssistant
                                    control={form.control}
                                    name={`evaluations.${teacher.id}.feedback`}
                                    getValues={form.getValues}
                                    setValue={form.setValue}
                                />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {selectedTeachers && selectedTeachers.length > 0 && (
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Enviando..." : "Enviar Evaluaciones"} <Send className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
