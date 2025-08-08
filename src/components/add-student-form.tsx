
"use client";

import { useState, useTransition, useRef, useEffect } from 'react';
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

interface FormState {
    success: boolean;
    message: string;
    errors?: {
        name?: string[];
        code?: string[];
        gradeId?: string[];
    };
}

export function AddStudentForm({ grades }: AddStudentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<FormState | undefined>();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const formIsDisabled = !grades || grades.length === 0;

  const handleSubmit = (formData: FormData) => {
    setState(undefined); // Clear previous state
    startTransition(async () => {
      const result = await addStudent(formData);
      setState(result);
    });
  };

  useEffect(() => {
    if (state) {
        if (state.success) {
            toast({
              title: "✅ Estudiante Añadido",
              description: state.message,
              variant: "default",
              className: "bg-green-600 text-white border-green-700",
            });
            formRef.current?.reset(); // Reset form on success
        } else if (state.message) {
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
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <fieldset disabled={formIsDisabled || isPending} className="space-y-4">
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
           <Button type="submit" disabled={isPending || formIsDisabled} className="w-full">
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {isPending ? 'Añadiendo...' : 'Añadir Estudiante'}
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}
    