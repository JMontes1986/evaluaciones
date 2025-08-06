'use client';
import { DashboardClient } from '@/components/dashboard-client';
import { AppHeader } from '@/components/header';

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
            <h1 className="text-4xl font-bold font-headline">Results Dashboard</h1>
            <p className="text-muted-foreground">Aggregated results from student evaluations.</p>
        </div>
        <div className="mt-6">
          <DashboardClient />
        </div>
      </main>
    </div>
  );
}
