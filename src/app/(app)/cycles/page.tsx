import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Syringe, Baby, Scale, ShoppingCart, HeartPulse } from "lucide-react";
import type { ProductionCycle, CycleStep, Species } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CowIcon, PigIcon } from "@/components/icons";

const cyclesData: ProductionCycle[] = [
  {
    id: "C-B-01", lotId: "A1", species: "Bovine", animalCount: 45, startDate: "2023-01-15",
    steps: [
      { name: "Birth", icon: Baby, date: "2023-01-15", status: "completed" },
      { name: "Vaccination 1", icon: Syringe, date: "2023-02-20", status: "completed" },
      { name: "Weaning", icon: HeartPulse, date: "2023-07-15", status: "active" },
      { name: "Weight Check", icon: Scale, date: "2023-12-15", status: "pending" },
      { name: "Sale", icon: ShoppingCart, date: "2024-07-15", status: "pending" },
    ],
  },
  {
    id: "C-P-02", lotId: "B2", species: "Porcine", animalCount: 120, startDate: "2023-09-01",
    steps: [
      { name: "Birth", icon: Baby, date: "2023-09-01", status: "completed" },
      { name: "Vaccination", icon: Syringe, date: "2023-09-10", status: "completed" },
      { name: "Weight Check", icon: Scale, date: "2023-11-01", status: "completed" },
      { name: "Sale", icon: ShoppingCart, date: "2024-03-01", status: "pending" },
    ],
  },
];

const speciesIcons: Record<Species, React.ElementType> = {
  Bovine: CowIcon,
  Porcine: PigIcon,
  Poultry: Baby,
  Caprine: Baby,
  Rabbit: Baby,
};

const statusClasses: Record<CycleStep["status"], string> = {
    completed: "bg-primary border-primary-foreground text-primary-foreground",
    active: "bg-accent border-accent-foreground text-accent-foreground animate-pulse",
    pending: "bg-muted border-muted-foreground/20 text-muted-foreground",
}

export default function CyclesPage() {
  return (
    <>
      <PageHeader title="Production Cycles" description="Track the lifecycle of each production lot from birth to sale.">
        <Button>Start New Cycle</Button>
      </PageHeader>

      <div className="space-y-6">
        {cyclesData.map((cycle) => {
          const SpeciesIcon = speciesIcons[cycle.species];
          return (
            <Card key={cycle.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                          <SpeciesIcon className="h-6 w-6 text-primary" />
                          <span>{cycle.species} - Lot {cycle.lotId}</span>
                        </CardTitle>
                        <CardDescription>{cycle.animalCount} animals, started on {cycle.startDate}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative w-full">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-border -translate-y-1/2"></div>
                    <div className="relative flex justify-between items-center">
                    {cycle.steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="flex flex-col items-center gap-2 text-center w-24">
                                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border-2", statusClasses[step.status])}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="text-xs font-medium">{step.name}</div>
                                <div className="text-xs text-muted-foreground">{step.date}</div>
                            </div>
                        )
                    })}
                    </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
