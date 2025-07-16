

"use client";

import { useParams, useRouter } from "next/navigation";
import { useInvoices } from "@/hooks/use-invoices";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, X, Car } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Invoice } from "@/lib/types";

const statusColors: Record<Invoice["status"], "default" | "secondary" | "destructive" | "outline"> = {
  Paid: "default",
  Sent: "secondary",
  Draft: "outline",
  Overdue: "destructive",
};


export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getInvoice } = useInvoices();
  const id = typeof params.id === 'string' ? params.id : '';
  const invoice = getInvoice(id);

  if (!invoice) {
    return (
        <>
            <PageHeader title="Invoice Not Found" />
            <p>The invoice you are looking for does not exist.</p>
        </>
    )
  }

  const handlePrint = () => {
    window.print();
  }

  return (
    <>
      <PageHeader title={`Invoice ${invoice.id}`} description={`Details for invoice sent to ${invoice.clientName}.`}>
        <Button onClick={handlePrint} variant="outline" className="print:hidden">
            <Printer className="mr-2 h-4 w-4" />
            Print / Save PDF
        </Button>
        <Button onClick={() => router.push('/invoices')} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Close
        </Button>
      </PageHeader>
      
      <Card className="max-w-4xl mx-auto p-4 sm:p-8">
        <CardHeader className="p-2 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start justify-between">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <Car className="h-12 w-12 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold font-headline">KPM Autocar</h1>
                        <p className="text-muted-foreground">123 Autocar Road, Cityville</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold text-primary">INVOICE</h2>
                    <p className="text-muted-foreground">{invoice.id}</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                    <h3 className="font-semibold mb-1">Bill To:</h3>
                    <p className="font-bold">{invoice.clientName}</p>
                    <p>{invoice.clientEmail}</p>
                </div>
                <div className="text-right">
                    <p><span className="font-semibold">Issue Date:</span> {new Date(invoice.issueDate).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    <div><span className="font-semibold">Status:</span> <Badge variant={statusColors[invoice.status]}>{invoice.status}</Badge></div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {invoice.lineItems.map((item) => (
                        <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">€{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">€{item.total.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end mt-8">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">€{invoice.subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (20%):</span>
                        <span className="font-medium">€{invoice.tax.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-xl font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>€{invoice.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter className="p-2 sm:p-4 mt-8 text-center text-xs text-muted-foreground">
            <p>Thank you for your business! Please make payment by the due date.</p>
        </CardFooter>
      </Card>
    </>
  );
}
