

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Syringe, Baby, Scale, ShoppingCart, HeartPulse } from "lucide-react";
import type { Animal, Species } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CowIcon, PigIcon, GoatIcon } from "@/components/icons";
import { Bird, Rabbit } from "lucide-react";
import { useAnimals } from "@/hooks/use-animals";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.enum(["Bovine", "Porcine", "Poultry", "Caprine", "Rabbit"]),
  age: z.coerce.number().min(1, "Age is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
  lot: z.string().min(1, "Lot is required"),
});

type FormData = z.infer<typeof formSchema>;

function AnimalFormDialog({
  open,
  onOpenChange,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const { addAnimal } = useAnimals();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { species: "Bovine", name: "", lot: "", age: 0, weight: 0 },
  });

  function onSubmit(values: FormData) {
    addAnimal({ ...values, status: "Healthy" });
    toast({
      title: `Animal Added`,
      description: `${values.name} has been successfully added to lot ${values.lot}.`,
    });
    onOpenChange(false);
    onSuccess();
    form.reset({ species: "Bovine", name: "", lot: "", age: 0, weight: 0 });
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Cycle by Adding an Animal</DialogTitle>
          <DialogDescription>
            Add a new animal to a lot to begin a new cycle or add to an existing one.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Animal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bessie" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Species</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bovine">Bovine</SelectItem>
                          <SelectItem value="Porcine">Porcine</SelectItem>
                          <SelectItem value="Poultry">Poultry</SelectItem>
                          <SelectItem value="Caprine">Caprine</SelectItem>
                          <SelectItem value="Rabbit">Rabbit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="lot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lot Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., A1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (months)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 650" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="submit">Add Animal to Cycle</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function CyclesPage() {
  const { animals } = useAnimals();
  const [isFormOpen, setIsFormOpen] = useState(false);

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
        <Button onClick={() => setIsFormOpen(true)}>Start New Cycle</Button>
      </PageHeader>

       <AnimalFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} onSuccess={() => {}} />

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
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                          <SpeciesIcon className="h-6 w-6 text-primary" />
                          <span>{cycle.species} - Lot {cycle.lotId}</span>
                        </CardTitle>
                        <CardDescription>{cycle.animalCount} animals, started on {cycle.startDate}</CardDescription>
                    </div>
                    <Link href={`/animals?lot=${cycle.lotId}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                    </Link>
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
                                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border-2", statusClasses[step.status as keyof typeof statusClasses])}>
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
