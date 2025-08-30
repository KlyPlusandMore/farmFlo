
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  onSave: (data: Omit<InventoryItem, 'id'> | InventoryItem) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: '', category: "Feed", quantity: 0, unit: '', lowStockThreshold: 10, purchasePrice: 0 },
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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addTransaction } = useAccounting();
  const { toast } = useToast();

  useEffect(() => {
    const inventoryCollection = collection(db, 'inventory');
    const unsubscribe = onSnapshot(inventoryCollection, (snapshot) => {
      const inventoryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryItem));
      setInventory(inventoryData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching inventory from Firestore: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleSaveItem(data: Omit<InventoryItem, 'id'> | InventoryItem) {
     if ('id' in data && data.id) { // Update
      const originalItem = inventory.find(i => i.id === data.id);
      const quantityAdded = data.quantity - (originalItem?.quantity || 0);
      
      const { id, ...dataToUpdate } = data;
      const itemDocRef = doc(db, 'inventory', id);
      await updateDoc(itemDocRef, dataToUpdate);

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
      const { id, ...dataToAdd } = data;
      const newItemRef = await addDoc(collection(db, 'inventory'), dataToAdd);

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

  async function handleDeleteItem(itemId: string) {
    const itemDocRef = doc(db, 'inventory', itemId);
    await deleteDoc(itemDocRef);
    toast({
      title: "Item Deleted",
      description: "The item has been removed from the inventory.",
      variant: "destructive",
    });
  }

  return (
    <>
      <PageHeader title="Inventory Management" description="Manage your inventory of feed, medication, and equipment." className="hidden md:flex">
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
             {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">Loading inventory...</TableCell>
              </TableRow>
            ) : inventory.length === 0 ? (
               <TableRow>
                <TableCell colSpan={6} className="text-center h-24">No inventory items found.</TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => {
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
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
