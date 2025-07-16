
"use client";

import { useInvoices } from "@/hooks/use-invoices";
import { InvoiceForm } from "@/components/invoice-form";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";

export default function EditInvoicePage() {
  const params = useParams();
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

  return <InvoiceForm initialData={invoice} />;
}
