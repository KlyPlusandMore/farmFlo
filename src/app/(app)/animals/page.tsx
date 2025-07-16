
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Animal, Species } from "@/lib/types";
import { CowIcon, PigIcon, GoatIcon } from "@/components/icons";
import { Bird, Rabbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useToast } from "@/hooks/use-toast";

const initialAnimals: Animal[] = [
  { id: "B-001", name: "Bessie", species: "Bovine", age: 24, weight: 650, lot: "A1", status: "Healthy" },
  { id: "B-002", name: "Angus", species: "Bovine", age: 36, weight: 720, lot: "A1", status: "Healthy" },
  { id: "P-001", name: "Porky", species: "Porcine", age: 6, weight: 110, lot: "B2", status: "Healthy" },
  { id: "P-002", name: "Wilbur", species: "Porcine", age: 7, weight: 125, lot: "B2", status: "Sick" },
  { id: "C-001", name: "Cluck", species: "Poultry", age: 12, weight: 2, lot: "C3", status: "Healthy" },
  { id: "G-001", name: "Billy", species: "Caprine", age: 18, weight: 60, lot: "D4", status: "Sold" },
  { id: "R-001", name: "Roger", species: "Rabbit", age: 4, weight: 3, lot: "E5", status: "Healthy" },
];

const speciesIcons: Record<Species, React.ElementType> = {
  Bovine: CowIcon,
  Porcine: PigIcon,
  Poultry: Bird,
  Caprine: GoatIcon,
  Rabbit: Rabbit,
};

const statusColors: Record<Animal["status"], "default" | "destructive" | "secondary"> = {
  Healthy: "default",
  Sick: "destructive",
  Sold: "secondary",
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.enum(["Bovine", "Porcine", "Poultry", "Caprine", "Rabbit"]),
  age: z.coerce.number().min(1, "Age is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
  lot: z.string().min(1, "Lot is required"),
});

type FormData = z.infer<typeof formSchema>;

function AddAnimalDialog({ onAnimalAdd }: { onAnimalAdd: (animal: Omit<Animal, "id" | "status">) => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      species: "Bovine",
    },
  });

  function onSubmit(values: FormData) {
    onAnimalAdd(values);
    toast({
      title: "Animal Added",
      description: `${values.name} has been added to the list.`,
    });
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Animal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Animal</DialogTitle>
          <DialogDescription>
            Enter the details of the new animal to add it to your farm.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bessie" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Species</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a species" />
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (mths)</FormLabel>
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
            <FormField
              control={form.control}
              name="lot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lot</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., A1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Add Animal</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>(initialAnimals);

  function handleAnimalAdd(newAnimalData: Omit<Animal, "id" | "status">) {
    const speciesPrefix = newAnimalData.species.charAt(0).toUpperCase();
    const newId = `${speciesPrefix}-${String(animals.filter(a => a.species === newAnimalData.species).length + 1).padStart(3, '0')}`;
    const newAnimal: Animal = {
      ...newAnimalData,
      id: newId,
      status: "Healthy",
    };
    setAnimals(prev => [...prev, newAnimal]);
  }

  return (
    <>
      <PageHeader title="Animal Management" description="View and manage all animals in your farm.">
        <AddAnimalDialog onAnimalAdd={handleAnimalAdd} />
      </PageHeader>
      
      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Species</TableHead>
              <TableHead>Age (mths)</TableHead>
              <TableHead>Weight (kg)</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {animals.map((animal) => {
              const Icon = speciesIcons[animal.species];
              return (
                <TableRow key={animal.id}>
                  <TableCell className="font-medium">{animal.id}</TableCell>
                  <TableCell>{animal.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      {animal.species}
                    </div>
                  </TableCell>
                  <TableCell>{animal.age}</TableCell>
                  <TableCell>{animal.weight}</TableCell>
                  <TableCell>{animal.lot}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[animal.status]}>{animal.status}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
