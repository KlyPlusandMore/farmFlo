
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInvoices } from "@/hooks/use-invoices";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@/lib/types";

const statusColors: Record<Invoice["status"], "default" | "secondary" | "destructive" | "outline"> = {
  Paid: "default",
  Sent: "secondary",
  Draft: "outline",
  Overdue: "destructive",
};

export default function InvoicesPage() {
  const router = useRouter();
  const { invoices, deleteInvoice, loading } = useInvoices();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    await deleteInvoice(id);
    toast({
      title: "Invoice Deleted",
      description: `Invoice ${id} has been permanently deleted.`,
      variant: "destructive",
    });
  };

  return (
    <>
      <PageHeader title="Invoices" description="Manage all your sales invoices.">
        <Link href="/invoices/new">
          <Button>Create Invoice</Button>
        </Link>
      </PageHeader>
      
      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">Loading invoices...</TableCell>
                </TableRow>
            ) : invoices.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">No invoices found.</TableCell>
                </TableRow>
            ) : (
                invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id.substring(0, 8)}...</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                    <Badge variant={statusColors[invoice.status]}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                    €{invoice.total.toFixed(2)}
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
                        <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete invoice {invoice.id.substring(0,8)}...
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(invoice.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
