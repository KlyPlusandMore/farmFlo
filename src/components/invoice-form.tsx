
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, PlusCircle } from "lucide-react";
import { useInvoices } from "@/hooks/use-invoices";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@/lib/types";

const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be positive"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative"),
});

const formSchema = z.object({
  id: z.string().optional(),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email address"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["Draft", "Sent", "Paid", "Overdue"]),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
});

type FormData = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  initialData?: Invoice;
}

export function InvoiceForm({ initialData }: InvoiceFormProps) {
  const router = useRouter();
  const { addInvoice, updateInvoice, getNextInvoiceId } = useInvoices();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      issueDate: new Date(initialData.issueDate).toISOString().split("T")[0],
      dueDate: new Date(initialData.dueDate).toISOString().split("T")[0],
    } : {
      clientName: "",
      clientEmail: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
      status: "Draft",
      lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const onSubmit = (data: FormData) => {
    const processedData = {
        ...data,
        lineItems: data.lineItems.map(item => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            total: item.quantity * item.unitPrice,
        }))
    };
    if (initialData) {
      updateInvoice(processedData as Invoice);
      toast({ title: "Invoice Updated", description: `Invoice ${initialData.id} has been updated.` });
    } else {
      const newInvoice = addInvoice(processedData);
      toast({ title: "Invoice Created", description: `New invoice ${newInvoice.id} has been created.` });
    }
    router.push("/invoices");
  };

  const pageTitle = initialData ? `Edit Invoice ${initialData.id}` : "Create New Invoice";
  const pageDescription = initialData ? "Update the invoice details below." : "Fill in the details to create a new invoice.";
  
  return (
    <>
      <PageHeader title={pageTitle} description={pageDescription}>
        <Button onClick={() => router.back()} variant="outline">Cancel</Button>
      </PageHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="clientName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Client Name</FormLabel>
                            <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="clientEmail" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Client Email</FormLabel>
                            <FormControl><Input type="email" placeholder="e.g., john@example.com" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <FormField control={form.control} name="issueDate" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Issue Date</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="dueDate" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Sent">Sent</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
                             <FormField control={form.control} name={`lineItems.${index}.description`} render={({ field }) => (
                                <FormItem className="col-span-12 md:col-span-5">
                                    <FormLabel className={index !== 0 ? 'sr-only' : ''}>Description</FormLabel>
                                    <FormControl><Textarea placeholder="Item description" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name={`lineItems.${index}.quantity`} render={({ field }) => (
                                <FormItem className="col-span-6 md:col-span-2">
                                    <FormLabel className={index !== 0 ? 'sr-only' : ''}>Quantity</FormLabel>
                                    <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name={`lineItems.${index}.unitPrice`} render={({ field }) => (
                                <FormItem className="col-span-6 md:col-span-2">
                                    <FormLabel className={index !== 0 ? 'sr-only' : ''}>Unit Price</FormLabel>
                                    <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="col-span-12 md:col-span-2">
                                <FormLabel className={index !== 0 ? 'sr-only' : ''}>Total</FormLabel>
                                <p className="font-medium h-10 flex items-center">
                                    €{(form.watch(`lineItems.${index}.quantity`) * form.watch(`lineItems.${index}.unitPrice`) || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="col-span-12 md:col-span-1 flex items-end h-full">
                                {fields.length > 1 && (
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove item</span>
                                </Button>
                                )}
                            </div>
                        </div>
                    ))}
                     <Button type="button" variant="outline" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Line Item
                    </Button>
                </CardContent>
                 <CardFooter className="flex justify-end">
                    <div className="w-full max-w-sm space-y-2">
                        <p className="flex justify-between"><span>Subtotal:</span> <span>€{(form.watch('lineItems').reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)).toFixed(2)}</span></p>
                        <p className="flex justify-between"><span>Tax (20%):</span> <span>€{(form.watch('lineItems').reduce((acc, item) => acc + item.quantity * item.unitPrice, 0) * 0.2).toFixed(2)}</span></p>
                        <p className="flex justify-between font-bold text-lg"><span>Total:</span> <span>€{(form.watch('lineItems').reduce((acc, item) => acc + item.quantity * item.unitPrice, 0) * 1.2).toFixed(2)}</span></p>
                    </div>
                </CardFooter>
            </Card>
            
            <div className="flex justify-end gap-2">
                <Button type="submit">{initialData ? "Save Changes" : "Create Invoice"}</Button>
            </div>
        </form>
      </Form>
    </>
  );
}
