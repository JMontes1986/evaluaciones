import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardData } from "@/app/actions";

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();

  return (
    <div className="flex flex-col flex-1">
        <div className="space-y-2 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Dashboard de Resultados</h1>
            <p className="text-muted-foreground">Resultados agregados de las evaluaciones de los estudiantes.</p>
        </div>
        <div className="mt-6">
          <DashboardClient initialData={dashboardData} />
        </div>
    </div>
  );
}
