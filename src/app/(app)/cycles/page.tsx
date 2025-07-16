

"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Syringe, Baby, Scale, ShoppingCart, HeartPulse } from "lucide-react";
import type { Animal, Species } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CowIcon, PigIcon, GoatIcon } from "@/components/icons";
import { Bird, Rabbit } from "lucide-react";
import { useAnimals } from "@/hooks/use-animals";

const speciesIcons: Record<Species, React.ElementType> = {
  Bovine: CowIcon,
  Porcine: PigIcon,
  Poultry: Bird,
  Caprine: GoatIcon,
  Rabbit: Rabbit,
};

const statusClasses = {
  completed: "bg-primary border-primary-foreground text-primary-foreground",
  active: "bg-accent border-accent-foreground text-accent-foreground animate-pulse",
  pending: "bg-muted border-muted-foreground/20 text-muted-foreground",
};

export default function CyclesPage() {
  const { animals } = useAnimals();

  const productionCycles = useMemo(() => {
    const lots = animals.reduce<Record<string, Animal[]>>((acc, animal) => {
      if (animal.status !== 'Sold') {
          (acc[animal.lot] = acc[animal.lot] || []).push(animal);
      }
      return acc;
    }, {});

    return Object.entries(lots).map(([lotId, lotAnimals]) => {
      const species = lotAnimals[0]?.species;
      const animalCount = lotAnimals.length;
      
      // Example steps, would need to be dynamic based on real data
      const steps = [
        { name: "Birth", icon: Baby, date: "Dynamic", status: "completed" },
        { name: "Vaccination", icon: Syringe, date: "Dynamic", status: "active" },
        { name: "Weight Check", icon: Scale, date: "Dynamic", status: "pending" },
        { name: "Sale", icon: ShoppingCart, date: "Dynamic", status: "pending" },
      ];

      return {
        id: `cycle-${lotId}`,
        lotId,
        species,
        animalCount,
        startDate: "N/A", // This would need to be stored somewhere
        steps,
      };
    });
  }, [animals]);

  return (
    <>
      <PageHeader title="Production Cycles" description="Track the lifecycle of each production lot from birth to sale.">
        <Button>Start New Cycle</Button>
      </PageHeader>

      <div className="space-y-6">
        {productionCycles.length === 0 && (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">No active production cycles. Add animals to lots to see them here.</p>
                </CardContent>
            </Card>
        )}
        {productionCycles.map((cycle) => {
          if (!cycle.species) return null;
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
