
"use client";

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { addStudent } from '@/app/actions';
import type { Grade } from '@/lib/types';
import { UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const addStudentSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  code: z.string().min(1, "El código es requerido."),
  gradeId: z.string().min(1, "Por favor, selecciona un grado."),
});

type AddStudentFormValues = z.infer<typeof addStudentSchema>;

interface AddStudentFormProps {
  grades: Grade[];
}

const initialState = {
  message: '',
  success: false,
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      {pending ? 'Añadiendo...' : 'Añadir Estudiante'}
    </Button>
  );
}

export function AddStudentForm({ grades }: AddStudentFormProps) {
  const [state, formAction] = useFormState(addStudent, initialState);
  const { toast } = useToast();
  const formIsDisabled = !grades || grades.length === 0;

  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: '',
      code: '',
      gradeId: '',
    },
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: "✅ Estudiante Añadido",
        description: state.message,
        variant: "default",
        className: "bg-green-600 text-white border-green-700",
      });
      form.reset();
      state.success = false; // Reset state to prevent re-firing
      state.message = '';
    } else if (state.message) {
      toast({
        title: "❌ Error",
        description: state.message,
        variant: "destructive",
      });
       state.message = ''; // Reset state to prevent re-firing
    }
  }, [state, toast, form]);


  return (
    <Card className={cn(formIsDisabled && "bg-muted/50")}>
      <CardHeader>
        <CardTitle>Añadir Estudiante Manualmente</CardTitle>
        <CardDescription>
          {formIsDisabled 
            ? "La carga de grados falló. No se pueden añadir estudiantes en este momento."
            : "Completa el formulario para añadir un nuevo estudiante al sistema."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <fieldset disabled={formIsDisabled} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código del Estudiante</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un grado" />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
            <SubmitButton />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

