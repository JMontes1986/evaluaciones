
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import type { Teacher, Student } from "@/lib/types";
import { evaluationQuestions } from "@/lib/types";
import { Textarea } from "./ui/textarea";
import { Send, User } from "lucide-react";
import { useActionState } from "react";
import { submitEvaluation } from "@/app/actions";
import { Skeleton } from "./ui/skeleton";
import { FeedbackAssistant } from "./feedback-assistant";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";


const evaluationSchema = z.object({
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

interface EvaluationFormProps {
  student: Student;
  initialAvailableTeachers: Teacher[];
  studentGradeName?: string;
}

export function EvaluationForm({ student, initialAvailableTeachers, studentGradeName }: EvaluationFormProps) {
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>(initialAvailableTeachers);
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(submitEvaluation, initialState);
  const [activeAccordion, setActiveAccordion] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      teacherIds: [],
      evaluations: {},
    },
    mode: 'onChange',
  });

  const selectedTeachers = form.watch("teacherIds");
  const formValues = form.watch();

  const isFormSubmittable = useMemo(() => {
    if (!formValues.teacherIds || formValues.teacherIds.length === 0) {
      return false;
    }
    return formValues.teacherIds.every(teacherId => {
      const teacherEval = formValues.evaluations?.[teacherId];
      if (!teacherEval) return false;
      return evaluationQuestions.every(q => {
        const value = teacherEval[q.id as keyof typeof teacherEval];
        return typeof value === 'string' && value.length > 0;
      });
    });
  }, [formValues]);
  
  useEffect(() => {
    if (isPending) return;

    if (state.success) {
      toast({
        title: "✅ ¡Evaluación Enviada!",
        description: "¡Gracias por tus comentarios! Tu opinión nos ayuda a mejorar.",
        variant: "default",
        className: "bg-green-600 text-white border-green-700",
      });
      router.refresh();
      form.reset({ teacherIds: [], evaluations: {} });
      setActiveAccordion("");

    } else if (state.message && !state.success && form.formState.isSubmitted) {
        toast({
            title: "❌ ¡Error!",
            description: state.message,
            variant: "destructive",
        });
        const firstInvalidTeacher = selectedTeachers.find(teacherId => {
            const evaluation = form.getValues(`evaluations.${teacherId}`);
            return evaluationQuestions.some(q => !evaluation[q.id as keyof typeof evaluation]);
        });

        if (firstInvalidTeacher && activeAccordion !== `item-${firstInvalidTeacher}`) {
            setActiveAccordion(`item-${firstInvalidTeacher}`);
        }
    }
  }, [state, isPending, form.formState.isSubmitted, router, form, toast, selectedTeachers, activeAccordion]);

  useEffect(() => {
    setAvailableTeachers(initialAvailableTeachers);
  }, [initialAvailableTeachers]);


  useEffect(() => {
    if (selectedTeachers.length > 0 && !activeAccordion) {
      setActiveAccordion(`item-${selectedTeachers[0]}`);
    } else if (selectedTeachers.length === 0) {
      setActiveAccordion("");
    }
  }, [selectedTeachers, activeAccordion]);

  const handleFormAction = (formData: FormData) => {
    const values = form.getValues();
    formData.append("evaluations", JSON.stringify(values.evaluations));
    formData.append("teacherIds", JSON.stringify(values.teacherIds));
    formAction(formData);
  };
  

  return (
    <FormProvider {...form}>
      <form ref={formRef} action={handleFormAction} className="space-y-8">
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
        
        {selectedTeachers && selectedTeachers.length > 0 && (
          <Card className="shadow-lg animate-in fade-in-50">
            <CardHeader>
              <CardTitle>Proporciona tu Retroalimentación</CardTitle>
              <CardDescription>Califica a cada profesor según los siguientes criterios y proporciona comentarios por escrito.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" className="w-full" value={activeAccordion} onValueChange={setActiveAccordion}>
                {availableTeachers
                  .filter(t => selectedTeachers.includes(t.id))
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
                                fieldState.invalid && form.formState.isSubmitted && "border-green-500/50 bg-green-900/40 text-white"
                              )}>
                                <FormLabel className={cn("text-base", fieldState.invalid && form.formState.isSubmitted && "text-white")}>{index + 1}. {question.text}</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="flex flex-wrap items-center gap-x-6 gap-y-2"
                                  >
                                    {ratingOptions.map((option) => (
                                      <FormItem key={option.value} className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                          <RadioGroupItem value={option.value} className={cn(fieldState.invalid && form.formState.isSubmitted && "border-white text-white")} />
                                        </FormControl>
                                        <FormLabel className={cn("font-normal", fieldState.invalid && form.formState.isSubmitted && "text-white")}>{option.label}</FormLabel>
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage className={cn(fieldState.invalid && form.formState.isSubmitted && "text-yellow-300")} />
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
             <Button type="submit" size="lg" disabled={isPending || !isFormSubmittable}>
              {isPending ? "Enviando..." : "Enviar Evaluaciones"} <Send className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}

    
