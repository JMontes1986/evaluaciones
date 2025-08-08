
"use client";

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
  const [state, formAction] = useActionState(addStudent, initialState);
  const { toast } = useToast();
  const formIsDisabled = !grades || grades.length === 0;

  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: '',
      code: '',
      gradeId: '',
    },
    // Pass server-side errors to the form
    errors: state?.errors ? (state.errors as any) : {},
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
      // Since we can't directly mutate state, these might not be necessary if state is reset elsewhere
      // Or we can trigger a re-render or state reset mechanism if needed
      state.success = false; 
      state.message = '';
    } else if (state.message && !state.success) {
      toast({
        title: "❌ Error",
        description: state.message,
        variant: "destructive",
      });
       // Reset message to prevent re-firing on subsequent re-renders without a new action
       state.message = '';
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
        {/* The form now directly uses the formAction from useActionState */}
        <form action={formAction} className="space-y-4">
          <fieldset disabled={formIsDisabled || form.formState.isSubmitting} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Juan Pérez"
                required
              />
               {state?.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="code">Código del Estudiante</Label>
                <Input
                    id="code"
                    name="code"
                    placeholder="Ej: 1234"
                    required
                />
                 {state?.errors?.code && <p className="text-sm font-medium text-destructive">{state.errors.code[0]}</p>}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="gradeId">Grado</Label>
                <Select name="gradeId" required>
                    <SelectTrigger>
                    <SelectValue placeholder="Selecciona un grado" />
                    </SelectTrigger>
                    <SelectContent>
                    {grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                 {state?.errors?.gradeId && <p className="text-sm font-medium text-destructive">{state.errors.gradeId[0]}</p>}
            </div>
          </fieldset>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
