
"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { Teacher, Student } from "@/lib/types";
import { Textarea } from "./ui/textarea";
import { Send, User } from "lucide-react";
import { submitEvaluation } from "@/app/actions";
import { cn } from "@/lib/utils";

const ratingOptions = [
    { value: "4", label: "SIEMPRE" },
    { value: "3", label: "CASI SIEMPRE" },
    { value: "2", label: "ALGUNAS VECES" },
    { value: "1", label: "NUNCA" },
];

interface EvaluationFormProps {
  student: Student;
  initialAvailableTeachers: Teacher[];
  allTeachers: Teacher[];
  studentGradeName?: string;
  evaluationQuestions: {id: string, text: string}[];
}

export function EvaluationForm({ student, initialAvailableTeachers, allTeachers, studentGradeName, evaluationQuestions }: EvaluationFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeAccordion, setActiveAccordion] = useState<string>("");
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>(initialAvailableTeachers);
  
  const evaluationSchema = useMemo(() => z.object({
    teacherIds: z.array(z.string()).min(1, "Por favor, selecciona al menos un profesor para evaluar."),
    evaluations: z.record(
      z.string(),
      z.object({
        ...evaluationQuestions.reduce((acc, q) => {
          acc[q.id] = z.string({
              required_error: "Por favor, califica este criterio.",
          }).min(1, `Por favor, califica este criterio.`);
          return acc;
        }, {} as Record<string, z.ZodString>),
        feedback: z.string().optional(),
      })
    ),
  }), [evaluationQuestions]);

  type EvaluationFormData = z.infer<typeof evaluationSchema>;

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      teacherIds: [],
      evaluations: {},
    },
    mode: 'onChange',
  });
  
  const watchedValues = form.watch();

  const isFormSubmittable = useMemo(() => {
    const { teacherIds, evaluations } = watchedValues;
    if (!teacherIds || teacherIds.length === 0) {
      return false;
    }
    return teacherIds.every(teacherId => {
      const teacherEval = evaluations?.[teacherId];
      if (!teacherEval) return false;
      return evaluationQuestions.every(q => {
        const value = teacherEval[q.id as keyof typeof teacherEval];
        return typeof value === 'string' && value.length > 0;
      });
    });
  }, [watchedValues, evaluationQuestions]);
  
  const onSubmit = (data: EvaluationFormData) => {
    startTransition(async () => {
      const result = await submitEvaluation({ ...data, studentId: student.id });

      if (result.success) {
        toast({
          title: "✅ ¡Evaluación Enviada!",
          description: "¡Gracias por tus comentarios! Puedes seguir evaluando a otros profesores.",
          variant: "default",
          className: "bg-green-600 text-white border-green-700",
        });

        // Update the list of available teachers on the client
        const evaluatedTeacherIds = data.teacherIds;
        setAvailableTeachers(currentTeachers => 
          currentTeachers.filter(t => !evaluatedTeacherIds.includes(t.id))
        );

        // Reset the form to its default state
        form.reset({
          teacherIds: [],
          evaluations: {},
        });
        setActiveAccordion("");
        
      } else {
        toast({
          title: "❌ ¡Error!",
          description: result.message || "Ocurrió un error. Por favor, intenta de nuevo.",
          variant: "destructive",
        });
        const firstInvalidTeacher = watchedValues.teacherIds.find(teacherId => {
            const evaluation = form.getValues(`evaluations.${teacherId}`);
            return evaluationQuestions.some(q => !evaluation[q.id as keyof typeof evaluation]);
        });

        if (firstInvalidTeacher && activeAccordion !== `item-${firstInvalidTeacher}`) {
            setActiveAccordion(`item-${firstInvalidTeacher}`);
        }
      }
    });
  };

  useEffect(() => {
    const selectedTeachers = watchedValues.teacherIds || [];
    if (selectedTeachers.length > 0 && !activeAccordion) {
      setActiveAccordion(`item-${selectedTeachers[0]}`);
    } else if (selectedTeachers.length === 0) {
      setActiveAccordion("");
    }
  }, [watchedValues.teacherIds, activeAccordion]);
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                                    } else {
                                        const currentEvals = form.getValues("evaluations");
                                        form.setValue("evaluations", {
                                            ...currentEvals,
                                            [teacher.id]: {
                                                ...evaluationQuestions.reduce((acc, q) => ({...acc, [q.id]: ""}), {}),
                                                feedback: ""
                                            }
                                        })
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
                render={({fieldState}) => (
                   <FormMessage>{fieldState.error?.message}</FormMessage>
                )}
              />
            </CardContent>
        </Card>
        
        {watchedValues.teacherIds && watchedValues.teacherIds.length > 0 && (
          <Card className="shadow-lg animate-in fade-in-50">
            <CardHeader>
              <CardTitle>Proporciona tu Retroalimentación</CardTitle>
              <CardDescription>Califica a cada profesor según los siguientes criterios y proporciona comentarios por escrito.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" className="w-full" value={activeAccordion} onValueChange={setActiveAccordion}>
                {allTeachers
                  .filter(t => watchedValues.teacherIds.includes(t.id))
                  .map((teacher) => (
                    <AccordionItem value={`item-${teacher.id}`} key={teacher.id}>
                      <AccordionTrigger className="text-lg hover:no-underline">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-primary rounded-full">
                                <User className="h-5 w-5 text-primary-foreground" />
                           </div>
                           <div>
                            <p>{teacher.name}</p>
                            <p className="text-sm font-normal text-muted-foreground">{teacher.subject}</p>
                           </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-2 space-y-6">
                        {evaluationQuestions.map((question, index) => (
                          <FormField
                            key={question.id}
                            control={form.control}
                            name={`evaluations.${teacher.id}.${question.id}`}
                            render={({ field, fieldState }) => (
                               <FormItem className={cn(
                                "space-y-3 rounded-lg border p-4 transition-colors",
                                fieldState.invalid && form.formState.isSubmitted && "border-destructive/50 bg-destructive/10"
                              )}>
                                <FormLabel className={cn("text-base", fieldState.invalid && form.formState.isSubmitted && "text-destructive")}>{index + 1}. {question.text}</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="flex flex-wrap items-center gap-x-6 gap-y-2"
                                  >
                                    {ratingOptions.map((option) => (
                                      <FormItem key={option.value} className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                          <RadioGroupItem value={option.value} className={cn(fieldState.invalid && form.formState.isSubmitted && "border-destructive text-destructive")} />
                                        </FormControl>
                                        <FormLabel className={cn("font-normal", fieldState.invalid && form.formState.isSubmitted && "text-destructive")}>{option.label}</FormLabel>
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
                              <FormLabel className="text-base">Observaciones (Opcional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Proporciona observaciones detalladas y constructivas aquí..."
                                  className="min-h-[120px] resize-y"
                                  {...field}
                                />
                              </FormControl>
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

        {watchedValues.teacherIds && watchedValues.teacherIds.length > 0 && (
          <div className="flex justify-end">
             <Button type="submit" size="lg" disabled={isPending || !isFormSubmittable}>
              {isPending ? "Enviando..." : "Enviar Evaluaciones"} <Send className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}

    