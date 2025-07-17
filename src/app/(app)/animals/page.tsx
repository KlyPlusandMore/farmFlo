

"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { Rabbit, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { useAccounting } from "@/hooks/use-accounting";
import { useInvoices } from "@/hooks/use-invoices";
import { useAnimals } from "@/hooks/use-animals";

const statusColors: Record<Animal["status"], "default" | "destructive" | "secondary"> = {
  Healthy: "default",
  "At Risk": "destructive",
  Sold: "secondary",
};

const formSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  species: z.enum(["Bovine", "Porcine", "Poultry", "Caprine", "Rabbit"]),
  age: z.coerce.number().min(0, "Age is required"),
  weight: z.coerce.number().min(0, "Weight is required"),
  lot: z.string().min(1, "Lot is required"),
  status: z.enum(["Healthy", "At Risk", "Sold"]),
  salePrice: z.coerce.number().optional(),
}).refine(data => {
    if (data.status === 'Sold') {
        return data.salePrice !== undefined && data.salePrice > 0;
    }
    return true;
}, {
    message: "Sale price is required when status is Sold.",
    path: ["salePrice"],
});


type FormData = z.infer<typeof formSchema>;

function AnimalFormDialog({
  mode,
  initialData,
  children,
}: {
  mode: "add" | "edit";
  initialData?: Animal;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { addAnimal, updateAnimal } = useAnimals();
  const { addTransaction } = useAccounting();
  const { addInvoice } = useInvoices();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { species: "Bovine", status: "Healthy" },
  });

  const status = form.watch("status");

  function onSave(data: FormData) {
     if (initialData) { // Update
      const originalAnimal = initialData;
      updateAnimal(data as Animal);
      
      if (data.status === 'Sold' && originalAnimal?.status !== 'Sold' && data.salePrice) {
        addTransaction({
            date: new Date().toISOString().split('T')[0],
            description: `Sale of ${data.species} ${data.name} (${data.id})`,
            category: 'Sale',
            type: 'Income',
            amount: data.salePrice
        });
        toast({
            title: "Income Recorded",
            description: `Sale of ${data.name} for €${data.salePrice} added to accounting.`,
        });

        const newInvoice = addInvoice({
          clientName: 'To Be Determined',
          clientEmail: 'client@example.com',
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
          lineItems: [{
            id: '1',
            description: `Animal: ${data.species} - ${data.name} (ID: ${data.id})`,
            quantity: 1,
            unitPrice: data.salePrice,
            total: data.salePrice
          }],
          status: 'Draft'
        });
        toast({
            title: "Draft Invoice Created",
            description: `Invoice ${newInvoice.id} has been created. Please complete it in the Invoices section.`,
        });
      }

    } else { // Create
      addAnimal(data as Omit<Animal, 'id'>);
    }
  }


  function onSubmit(values: FormData) {
    onSave(values);
    toast({
      title: `${values.species} ${mode === "add" ? "Added" : "Updated"}`,
      description: `${values.name} has been successfully ${mode === "add" ? "added" : "updated"}.`,
    });
    setOpen(false);
    if (mode === "add") {
      form.reset({ species: "Bovine", status: "Healthy" });
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
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
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Animal ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Unique identification number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Daisy" {...field} />
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
                      <Input type="number" placeholder="e.g., 500" {...field} />
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
                    <Input placeholder="e.g., L001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Healthy">Healthy</SelectItem>
                        <SelectItem value="At Risk">At Risk</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {status === 'Sold' && (
                 <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sale Price (€)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 1200" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}
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

function AnimalsPageContent() {
  const { animals, deleteAnimal } = useAnimals();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const speciesFilter = searchParams.get("species");
  const lotFilter = searchParams.get("lot");

  const filteredAnimals = useMemo(() => {
    return animals.filter(animal => {
      const speciesMatch = !speciesFilter || animal.species === speciesFilter;
      const lotMatch = !lotFilter || animal.lot === lotFilter;
      return speciesMatch && lotMatch;
    });
  }, [animals, speciesFilter, lotFilter]);

  function handleDeleteAnimal(animalId: string) {
    deleteAnimal(animalId);
    toast({
      title: "Animal Deleted",
      description: "The animal has been removed from the list.",
      variant: "destructive",
    });
  }
  
  const pageTitle = useMemo(() => {
    if (speciesFilter) return `${speciesFilter} Management`;
    if (lotFilter) return `Lot ${lotFilter} Animals`;
    return "Animal Management";
  }, [speciesFilter, lotFilter]);

  const pageDescription = useMemo(() => {
    if (speciesFilter) return `View and manage all ${speciesFilter}.`;
    if (lotFilter) return `View and manage all animals in lot ${lotFilter}.`;
    return "View and manage all animals on your farm.";
  }, [speciesFilter, lotFilter]);


  return (
    <>
      <PageHeader title={pageTitle} description={pageDescription}>
        <AnimalFormDialog mode="add">
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
              <TableHead>Sale Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnimals.map((animal) => {
              return (
                <TableRow key={animal.id}>
                  <TableCell className="font-medium">{animal.id}</TableCell>
                  <TableCell>{animal.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Rabbit className="h-5 w-5 text-muted-foreground" />
                      {animal.species}
                    </div>
                  </TableCell>
                  <TableCell>{animal.age}</TableCell>
                  <TableCell>{animal.weight}</TableCell>
                  <TableCell>{animal.lot}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[animal.status]}>{animal.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {animal.salePrice ? `€${animal.salePrice.toFixed(2)}` : 'N/A'}
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
                        <AnimalFormDialog mode="edit" initialData={animal}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                        </AnimalFormDialog>
                        <DeleteAnimalAlert
                          animalName={`${animal.name} (${animal.species})`}
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

export default function AnimalsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AnimalsPageContent />
        </Suspense>
    )
}
