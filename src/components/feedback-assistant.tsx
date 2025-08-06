
'use client';

import { useFormStatus } from 'react-dom';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getFeedbackSuggestions } from '@/app/actions';
import { Sparkles, Lightbulb, Loader2 } from 'lucide-react';
import type { Control, FieldValues, Path, UseFormGetValues } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { useEffect, useActionState, useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  success: false,
  message: '',
  suggestions: null,
  errors: null,
};

function SubmitButton() {
  const [isPending, startTransition] = useTransition();
  const { pending } = useFormStatus();

  return (
    <Button type="button" formAction={
      // @ts-ignore
      (formData) => startTransition(() => getFeedbackSuggestions(null, formData))
    } disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Obteniendo Sugerencias...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Obtener Sugerencias de IA
        </>
      )}
    </Button>
  );
}

interface FeedbackAssistantProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    getValues: UseFormGetValues<T>;
}

export function FeedbackAssistant<T extends FieldValues>({ control, name, getValues }: FeedbackAssistantProps<T>) {
  const [state, formAction] = useActionState(getFeedbackSuggestions, initialState);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        variant: "destructive",
        title: "¡Oh no! Algo salió mal.",
        description: state.message,
      })
    }
  }, [state, toast])
  
  const handleGetSuggestions = () => {
    const formData = new FormData();
    const evaluationText = getValues(name);
    formData.append('evaluationText', evaluationText as string);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <div className="space-y-4">
              <FormControl>
                <Textarea
                  placeholder="Proporciona retroalimentación detallada y constructiva aquí..."
                  className="min-h-[120px] resize-y"
                  {...field}
                  name="evaluationText"
                />
              </FormControl>
               <FormMessage/>

              <div className="flex justify-end">
                 <Button type="button" onClick={handleGetSuggestions} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Obteniendo Sugerencias...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Obtener Sugerencias de IA
                    </>
                  )}
                </Button>
              </div>
            </div>
          </FormItem>
        )}
      />

      {state.suggestions && state.success && (
        <Card className="bg-accent/50 border-accent animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
              Sugerencias de Retroalimentación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-accent-foreground">
              {state.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 text-primary">&#8227;</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
