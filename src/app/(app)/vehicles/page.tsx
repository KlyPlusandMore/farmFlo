

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
import type { Vehicle, Make } from "@/lib/types";
import { Car, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { useVehicles } from "@/hooks/use-vehicles";

const statusColors: Record<Vehicle["status"], "default" | "destructive" | "secondary"> = {
  Available: "default",
  "In Service": "destructive",
  Sold: "secondary",
};

const formSchema = z.object({
  id: z.string().min(1, "VIN is required"),
  make: z.enum(["Toyota", "Honda", "Ford", "BMW", "Mercedes"]),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900, "Year is required"),
  mileage: z.coerce.number().min(0, "Mileage is required"),
  location: z.string().min(1, "Location is required"),
  status: z.enum(["Available", "In Service", "Sold"]),
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

function VehicleFormDialog({
  mode,
  initialData,
  children,
}: {
  mode: "add" | "edit";
  initialData?: Vehicle;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { addVehicle, updateVehicle } = useVehicles();
  const { addTransaction } = useAccounting();
  const { addInvoice } = useInvoices();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { make: "Toyota", status: "Available" },
  });

  const status = form.watch("status");

  function onSave(data: FormData) {
     if (initialData) { // Update
      const originalVehicle = initialData;
      updateVehicle(data as Vehicle);
      
      if (data.status === 'Sold' && originalVehicle?.status !== 'Sold' && data.salePrice) {
        addTransaction({
            date: new Date().toISOString().split('T')[0],
            description: `Sale of ${data.make} ${data.model} (${data.id})`,
            category: 'Sale',
            type: 'Income',
            amount: data.salePrice
        });
        toast({
            title: "Income Recorded",
            description: `Sale of ${data.make} ${data.model} for €${data.salePrice} added to accounting.`,
        });

        const newInvoice = addInvoice({
          clientName: 'To Be Determined',
          clientEmail: 'client@example.com',
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
          lineItems: [{
            id: '1',
            description: `Vehicle: ${data.year} ${data.make} ${data.model} (VIN: ${data.id})`,
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
      addVehicle(data as Omit<Vehicle, 'id'>);
    }
  }


  function onSubmit(values: FormData) {
    onSave(values);
    toast({
      title: `Vehicle ${mode === "add" ? "Added" : "Updated"}`,
      description: `${values.make} ${values.model} has been successfully ${mode === "add" ? "added" : "updated"}.`,
    });
    setOpen(false);
    if (mode === "add") {
      form.reset({ make: "Toyota", status: "Available" });
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Vehicle" : "Edit Vehicle"}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? "Enter the details of the new vehicle." : `Editing details for ${initialData?.make} ${initialData?.model}.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN</FormLabel>
                  <FormControl>
                    <Input placeholder="Vehicle Identification Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Toyota">Toyota</SelectItem>
                          <SelectItem value="Honda">Honda</SelectItem>
                          <SelectItem value="Ford">Ford</SelectItem>
                          <SelectItem value="BMW">BMW</SelectItem>
                          <SelectItem value="Mercedes">Mercedes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Camry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2022" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage (km)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lot A" {...field} />
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
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="In Service">In Service</SelectItem>
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
                        <Input type="number" placeholder="e.g., 25000" {...field} />
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

function DeleteVehicleAlert({
  vehicleName,
  onDelete,
  children,
}: {
  vehicleName: string;
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
            This action cannot be undone. This will permanently delete {vehicleName} from the records.
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

function VehiclesPageContent() {
  const { vehicles, deleteVehicle } = useVehicles();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const makeFilter = searchParams.get("make");
  const locationFilter = searchParams.get("location");

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const makeMatch = !makeFilter || vehicle.make === makeFilter;
      const locationMatch = !locationFilter || vehicle.location === locationFilter;
      return makeMatch && locationMatch;
    });
  }, [vehicles, makeFilter, locationFilter]);

  function handleDeleteVehicle(vehicleId: string) {
    deleteVehicle(vehicleId);
    toast({
      title: "Vehicle Deleted",
      description: "The vehicle has been removed from the list.",
      variant: "destructive",
    });
  }
  
  const pageTitle = useMemo(() => {
    if (makeFilter) return `${makeFilter} Vehicle Management`;
    if (locationFilter) return `Location ${locationFilter} Vehicles`;
    return "Vehicle Management";
  }, [makeFilter, locationFilter]);

  const pageDescription = useMemo(() => {
    if (makeFilter) return `View and manage all ${makeFilter} vehicles.`;
    if (locationFilter) return `View and manage all vehicles at location ${locationFilter}.`;
    return "View and manage all vehicles in your inventory.";
  }, [makeFilter, locationFilter]);


  return (
    <>
      <PageHeader title={pageTitle} description={pageDescription}>
        <VehicleFormDialog mode="add">
          <Button>Add Vehicle</Button>
        </VehicleFormDialog>
      </PageHeader>
      
      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>VIN</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Mileage (km)</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((vehicle) => {
              return (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      {vehicle.make}
                    </div>
                  </TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.mileage.toLocaleString()}</TableCell>
                  <TableCell>{vehicle.location}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[vehicle.status]}>{vehicle.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {vehicle.salePrice ? `€${vehicle.salePrice.toFixed(2)}` : 'N/A'}
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
                        <VehicleFormDialog mode="edit" initialData={vehicle}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                        </VehicleFormDialog>
                        <DeleteVehicleAlert
                          vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          onDelete={() => handleDeleteVehicle(vehicle.id)}
                        >
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                             <span>Delete</span>
                          </DropdownMenuItem>
                        </DeleteVehicleAlert>
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

export default function VehiclesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VehiclesPageContent />
        </Suspense>
    )
}
