'use client';
import { EvaluationForm } from '@/components/evaluation-form';
import { AppHeader } from '@/components/header';

export default function EvaluationPage() {
  return (
    <div className="flex flex-col flex-1">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Teacher Evaluation</h1>
            <p className="text-muted-foreground mt-2">Your feedback is anonymous and helps improve our school.</p>
          </div>
          <EvaluationForm />
        </div>
      </main>
    </div>
  );
}
