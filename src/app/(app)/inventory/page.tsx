
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "@/lib/types";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { useAccounting } from "@/hooks/use-accounting";


const initialInventory: InventoryItem[] = [
  { id: "FEED-001", name: "Bovine Feed", category: "Feed", quantity: 50, unit: "bags", lowStockThreshold: 10 },
  { id: "MED-001", name: "General Antibiotic", category: "Medication", quantity: 20, unit: "bottles", lowStockThreshold: 5 },
  { id: "EQUIP-001", name: "Water Trough", category: "Equipment", quantity: 10, unit: "units", lowStockThreshold: 2 },
];

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  category: z.enum(["Feed", "Medication", "Equipment"]),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  unit: z.string().min(1, "Unit is required"),
  lowStockThreshold: z.coerce.number().min(0, "Threshold cannot be negative"),
  purchasePrice: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

function InventoryFormDialog({
  mode,
  initialData,
  onSave,
  children,
}: {
  mode: "add" | "edit";
  initialData?: InventoryItem;
  onSave: (data: FormData) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { category: "Feed", quantity: 0, lowStockThreshold: 10 },
  });

  function onSubmit(values: FormData) {
    onSave(values);
    toast({
      title: `Item ${mode === "add" ? "Added" : "Updated"}`,
      description: `${values.name} has been successfully ${mode === "add" ? "added" : "updated"}.`,
    });
    setOpen(false);
    if (mode === "add") {
      form.reset({
        name: "",
        category: "Feed",
        quantity: 0,
        unit: "",
        lowStockThreshold: 10,
        purchasePrice: 0,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Item" : "Edit Item"}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? "Enter the details of the new inventory item." : `Editing details for ${initialData?.name}.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto max-h-[70vh] p-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bovine Feed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Feed">Feed</SelectItem>
                      <SelectItem value="Medication">Medication</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., bags" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (€)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Total cost of purchase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="lowStockThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} />
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

function DeleteItemAlert({
  itemName,
  onDelete,
  children,
}: {
  itemName: string;
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
            This action cannot be undone. This will permanently delete {itemName} from the inventory.
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


export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const { addTransaction } = useAccounting();
  const { toast } = useToast();

  function handleSaveItem(data: FormData) {
     if (data.id) { // Update
      const originalItem = inventory.find(i => i.id === data.id);
      const quantityAdded = data.quantity - (originalItem?.quantity || 0);

      setInventory(prev => prev.map(item => item.id === data.id ? { ...item, ...data } as InventoryItem : item));
      
      if (data.purchasePrice && data.purchasePrice > 0 && quantityAdded > 0) {
        addTransaction({
          date: new Date().toISOString().split('T')[0],
          description: `Purchase of ${data.name}`,
          category: data.category,
          type: 'Expense',
          amount: data.purchasePrice
        });
        toast({
            title: "Expense Recorded",
            description: `Purchase of ${data.name} for €${data.purchasePrice} added to accounting.`
        });
      }

    } else { // Create
      const categoryPrefix = data.category.substring(0, 4).toUpperCase();
      const newId = `${categoryPrefix}-${String(inventory.filter(i => i.category === data.category).length + 1).padStart(3, '0')}`;
      const newItem: InventoryItem = {
        ...data,
        id: newId,
      };
      setInventory(prev => [...prev, newItem]);
       if (data.purchasePrice && data.purchasePrice > 0) {
        addTransaction({
            date: new Date().toISOString().split('T')[0],
            description: `Purchase of ${data.name}`,
            category: data.category,
            type: 'Expense',
            amount: data.purchasePrice
        });
        toast({
            title: "Expense Recorded",
            description: `Purchase of ${data.name} for €${data.purchasePrice} added to accounting.`
        });
      }
    }
  }

  function handleDeleteItem(itemId: string) {
    setInventory(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Item Deleted",
      description: "The item has been removed from the inventory.",
      variant: "destructive",
    });
  }

  return (
    <>
      <PageHeader title="Inventory" description="Manage your inventory of feed, medication, and equipment.">
        <InventoryFormDialog mode="add" onSave={handleSaveItem}>
          <Button>Add Item</Button>
        </InventoryFormDialog>
      </PageHeader>
      
      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="w-[200px]">Stock Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => {
              const isLowStock = item.quantity <= item.lowStockThreshold;
              const stockPercentage = Math.min((item.quantity / (item.lowStockThreshold * 2)) * 100, 100);
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{`${item.quantity} ${item.unit}`}</TableCell>
                  <TableCell>
                    <Progress value={stockPercentage} className="h-2" />
                  </TableCell>
                  <TableCell>
                    {isLowStock ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : (
                      <Badge variant="default">In Stock</Badge>
                    )}
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
                        <InventoryFormDialog mode="edit" initialData={item} onSave={handleSaveItem}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                        </InventoryFormDialog>
                        <DeleteItemAlert
                          itemName={item.name}
                          onDelete={() => handleDeleteItem(item.id)}
                        >
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                             <span>Delete</span>
                          </DropdownMenuItem>
                        </DeleteItemAlert>
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

    