
"use client";

import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getFeedbackSuggestions } from "@/app/actions";
import { Sparkles, Lightbulb, Loader2 } from "lucide-react";
import type { Control, FieldValues, Path, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useEffect, useActionState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";

const initialState = {
  success: false,
  message: "",
  suggestions: null,
};

interface FeedbackAssistantProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    getValues: UseFormGetValues<T>;
    setValue: UseFormSetValue<T>;
}

export function FeedbackAssistant<T extends FieldValues>({ control, name, getValues, setValue }: FeedbackAssistantProps<T>) {
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
  }, [state, toast]);
  
  const handleGetSuggestions = () => {
    const formData = new FormData();
    const evaluationText = getValues(name);
    formData.append("evaluationText", evaluationText as string);
    startTransition(() => {
      formAction(formData);
    });
  };

  const applySuggestion = (suggestion: string) => {
    setValue(name, suggestion as any, { shouldValidate: true });
  }

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <div className="space-y-2">
              <FormControl>
                <Textarea
                  placeholder="Proporciona observaciones detalladas y constructivas aquí..."
                  className="min-h-[120px] resize-y"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-end">
                 <Button type="button" onClick={handleGetSuggestions} disabled={isPending} size="sm" variant="ghost">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Obteniendo...
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
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-base">
              <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
              Sugerencias de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-accent-foreground">
              {state.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-primary">&#8227;</span>
                    <span>{suggestion}</span>
                  </div>
                   <Button 
                    type="button" 
                    size="sm" 
                    variant="secondary"
                    onClick={() => applySuggestion(suggestion)}
                   >
                    Aplicar
                   </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
