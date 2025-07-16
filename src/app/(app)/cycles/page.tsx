

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Gauge, Droplet, ShoppingCart } from "lucide-react";
import type { Vehicle, Make } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Car } from "lucide-react";
import { useVehicles } from "@/hooks/use-vehicles";
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


const statusClasses = {
  completed: "bg-primary border-primary-foreground text-primary-foreground",
  active: "bg-accent border-accent-foreground text-accent-foreground animate-pulse",
  pending: "bg-muted border-muted-foreground/20 text-muted-foreground",
};

const formSchema = z.object({
  id: z.string().min(1, "VIN is required"),
  make: z.enum(["Toyota", "Honda", "Ford", "BMW", "Mercedes"]),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900, "Year is required"),
  mileage: z.coerce.number().min(0, "Mileage is required"),
  location: z.string().min(1, "Location is required"),
});

type FormData = z.infer<typeof formSchema>;

function VehicleFormDialog({
  open,
  onOpenChange,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const { addVehicle } = useVehicles();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { make: "Toyota", model: "", location: "", year: new Date().getFullYear(), mileage: 0, id: "" },
  });

  function onSubmit(values: FormData) {
    addVehicle({ ...values, status: "Available" });
    toast({
      title: `Vehicle Added`,
      description: `${values.make} ${values.model} has been successfully added to ${values.location}.`,
    });
    onOpenChange(false);
    onSuccess();
    form.reset({ make: "Toyota", model: "", location: "", year: new Date().getFullYear(), mileage: 0, id: "" });
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start New Cycle by Adding a Vehicle</DialogTitle>
          <DialogDescription>
            Add a new vehicle to a location to begin a new service cycle or add to an existing one.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>VIN</FormLabel>
                      <FormControl>
                        <Input placeholder="Vehicle Identification Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
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
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Lot A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <DialogFooter>
              <Button type="submit">Add Vehicle to Cycle</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function CyclesPage() {
  const { vehicles } = useVehicles();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const serviceCycles = useMemo(() => {
    const locations = vehicles.reduce<Record<string, Vehicle[]>>((acc, vehicle) => {
      if (vehicle.status !== 'Sold') {
          (acc[vehicle.location] = acc[vehicle.location] || []).push(vehicle);
      }
      return acc;
    }, {});

    return Object.entries(locations).map(([locationId, locationVehicles]) => {
      const make = locationVehicles[0]?.make;
      const vehicleCount = locationVehicles.length;
      
      const steps = [
        { name: "Acquisition", icon: ShoppingCart, date: "Dynamic", status: "completed" },
        { name: "Inspection", icon: Wrench, date: "Dynamic", status: "active" },
        { name: "Oil Change", icon: Droplet, date: "Dynamic", status: "pending" },
        { name: "Final Check", icon: Gauge, date: "Dynamic", status: "pending" },
      ];

      return {
        id: `cycle-${locationId}`,
        locationId,
        make,
        vehicleCount,
        startDate: "N/A", // This would need to be stored somewhere
        steps,
      };
    });
  }, [vehicles]);

  return (
    <>
      <PageHeader title="Service Cycles" description="Track the service lifecycle of each vehicle group.">
        <Button onClick={() => setIsFormOpen(true)}>Start New Cycle</Button>
      </PageHeader>

       <VehicleFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} onSuccess={() => {}} />

      <div className="space-y-6">
        {serviceCycles.length === 0 && (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">No active service cycles. Add vehicles to locations to see them here.</p>
                </CardContent>
            </Card>
        )}
        {serviceCycles.map((cycle) => {
          if (!cycle.make) return null;
          return (
            <Card key={cycle.id}>
              <CardHeader>
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-6 w-6 text-primary" />
                          <span>{cycle.make} Group - Location {cycle.locationId}</span>
                        </CardTitle>
                        <CardDescription>{cycle.vehicleCount} vehicles, started on {cycle.startDate}</CardDescription>
                    </div>
                    <Link href={`/vehicles?location=${cycle.locationId}`}>
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
