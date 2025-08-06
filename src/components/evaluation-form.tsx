'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { grades, teachers } from '@/lib/mock-data';
import type { Teacher, Evaluation } from '@/lib/types';
import { evaluationQuestions } from '@/lib/types';
import { FeedbackAssistant } from './feedback-assistant';
import { ArrowRight, Send, User, Book } from 'lucide-react';

const evaluationSchema = z.object({
  gradeId: z.string().min(1, 'Por favor, selecciona un grado.'),
  teacherIds: z.array(z.string()).min(1, 'Por favor, selecciona al menos un profesor para evaluar.'),
  evaluations: z.record(
    z.string(),
    z.object({
      ...evaluationQuestions.reduce((acc, q) => {
        acc[q.id] = z.string().min(1, `Por favor, califica este criterio.`);
        return acc;
      }, {} as Record<string, z.ZodString>),
      feedback: z.string().min(1, 'Por favor, proporciona retroalimentación por escrito.'),
    })
  ),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

export function EvaluationForm() {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const { toast } = useToast();

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      gradeId: '',
      teacherIds: [],
      evaluations: {},
    },
  });

  const selectedTeachers = form.watch('teacherIds');

  const handleGradeChange = (gradeId: string) => {
    setSelectedGrade(gradeId);
    form.setValue('gradeId', gradeId);
    const teachersForGrade = teachers.filter((t) => t.grades.includes(gradeId));
    setAvailableTeachers(teachersForGrade);
    form.setValue('teacherIds', []); // Reset teacher selection
    form.setValue('evaluations', {}); // Reset evaluations
  };
  
  const onSubmit = (data: EvaluationFormData) => {
    console.log(data);
    toast({
      title: '✅ ¡Evaluación Enviada!',
      description: 'Gracias por tus valiosos comentarios.',
      className: 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600'
    });
    form.reset();
    setSelectedGrade('');
    setAvailableTeachers([]);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Paso 1: Selecciona tu Grado</CardTitle>
            <CardDescription>Esto te mostrará la lista de profesores disponibles para evaluar.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="gradeId"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={handleGradeChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu grado..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {selectedGrade && availableTeachers.length > 0 && (
          <Card className="shadow-lg animate-in fade-in-50">
            <CardHeader>
              <CardTitle>Paso 2: Elige a los Profesores a Evaluar</CardTitle>
              <CardDescription>Selecciona los profesores para los que deseas dar tu opinión.</CardDescription>
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
                          return (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(teacher.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, teacher.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== teacher.id
                                          )
                                        )
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
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}
        
        {selectedTeachers.length > 0 && (
          <Card className="shadow-lg animate-in fade-in-50">
            <CardHeader>
              <CardTitle>Paso 3: Proporciona tu Retroalimentación</CardTitle>
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
                            render={({ field }) => (
                              <FormItem className="space-y-3 rounded-lg border p-4">
                                <FormLabel>{question.text}</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center space-x-4"
                                  >
                                    {[1, 2, 3, 4, 5].map((val) => (
                                      <FormItem key={val} className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                          <RadioGroupItem value={String(val)} />
                                        </FormControl>
                                        <FormLabel className="font-normal">{val}</FormLabel>
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                        <div className="space-y-2 rounded-lg border p-4">
                           <FormLabel>Retroalimentación Adicional</FormLabel>
                           <p className="text-sm text-muted-foreground">Usa el asistente de IA para que tus comentarios sean más claros y objetivos.</p>
                           <FeedbackAssistant 
                            control={form.control} 
                            name={`evaluations.${teacher.id}.feedback`} 
                            getValues={form.getValues}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {selectedTeachers.length > 0 && (
          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Enviar Evaluaciones <Send className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
