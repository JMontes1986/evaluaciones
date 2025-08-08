
"use client";

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { addStudent } from '@/app/actions';
import type { Grade } from '@/lib/types';
import { UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddStudentFormProps {
  grades: Grade[];
}

const initialState = {
  message: '',
  success: false,
  errors: {
    name: [] as string[] | undefined,
    code: [] as string[] | undefined,
    gradeId: [] as string[] | undefined,
  },
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

  useEffect(() => {
    if (state && state.message) {
      if (state.success) {
        toast({
          title: "✅ Estudiante Añadido",
          description: state.message,
          variant: "default",
          className: "bg-green-600 text-white border-green-700",
        });
        // This is a way to reset the form after successful submission
        // by clearing the state in the action.
        const form = document.getElementById('add-student-form') as HTMLFormElement;
        if (form) form.reset();
      } else {
        toast({
          title: "❌ Error",
          description: state.message,
          variant: "destructive",
        });
      }
    }
  }, [state, toast]);


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
        <form id="add-student-form" action={formAction} className="space-y-4">
          <fieldset disabled={formIsDisabled} className="space-y-4">
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
