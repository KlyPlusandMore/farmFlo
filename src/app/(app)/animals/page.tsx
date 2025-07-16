
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { Animal, Species } from "@/lib/types";
import { CowIcon, PigIcon, GoatIcon } from "@/components/icons";
import { Bird, Rabbit, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  species: z.enum(["Bovine", "Porcine", "Poultry", "Caprine", "Rabbit"]),
  age: z.coerce.number().min(1, "Age is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
  lot: z.string().min(1, "Lot is required"),
  status: z.enum(["Healthy", "Sick", "Sold"]).optional(),
});

type FormData = z.infer<typeof formSchema>;

function AnimalFormDialog({
  mode,
  initialData,
  onSave,
  children,
}: {
  mode: "add" | "edit";
  initialData?: Animal;
  onSave: (data: FormData) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { species: "Bovine", status: "Healthy" },
  });

  function onSubmit(values: FormData) {
    onSave(values);
    toast({
      title: `Animal ${mode === "add" ? "Added" : "Updated"}`,
      description: `${values.name} has been successfully ${mode === "add" ? "added" : "updated"}.`,
    });
    setOpen(false);
    if (mode === "add") {
      form.reset();
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Animal" : "Edit Animal"}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? "Enter the details of the new animal." : `Editing details for ${initialData?.name}.`}
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAnimalAlert({
  animalName,
  onDelete,
  children,
}: {
  animalName: string;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete {animalName} from the records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>(initialAnimals);
  const { toast } = useToast();

  function handleSaveAnimal(data: FormData) {
    if (data.id) { // Update
      setAnimals(prev => prev.map(animal => animal.id === data.id ? { ...animal, ...data } as Animal : animal));
    } else { // Create
      const speciesPrefix = data.species.charAt(0).toUpperCase();
      const newId = `${speciesPrefix}-${String(animals.filter(a => a.species === data.species).length + 1).padStart(3, '0')}`;
      const newAnimal: Animal = {
        ...data,
        id: newId,
        status: "Healthy",
      };
      setAnimals(prev => [...prev, newAnimal]);
    }
  }

  function handleDeleteAnimal(animalId: string) {
    setAnimals(prev => prev.filter(animal => animal.id !== animalId));
    toast({
      title: "Animal Deleted",
      description: "The animal has been removed from the list.",
      variant: "destructive",
    });
  }

  return (
    <>
      <PageHeader title="Animal Management" description="View and manage all animals in your farm.">
        <AnimalFormDialog mode="add" onSave={handleSaveAnimal}>
          <Button>Add Animal</Button>
        </AnimalFormDialog>
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
              <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <AnimalFormDialog mode="edit" initialData={animal} onSave={handleSaveAnimal}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                        </AnimalFormDialog>
                        <DeleteAnimalAlert
                          animalName={animal.name}
                          onDelete={() => handleDeleteAnimal(animal.id)}
                        >
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                             <span>Delete</span>
                          </DropdownMenuItem>
                        </DeleteAnimalAlert>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
