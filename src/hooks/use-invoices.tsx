
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Invoice, InvoiceLineItem } from '@/lib/types';

interface InvoicesContextType {
  invoices: Invoice[];
  getInvoice: (id: string) => Invoice | undefined;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'subtotal' | 'tax' | 'total'>) => Invoice;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  getNextInvoiceId: () => string;
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

const initialInvoices: Invoice[] = [
    {
      id: "INV-001",
      clientName: "Local Butcher Shop",
      clientEmail: "butcher@local.com",
      issueDate: "2023-07-10",
      dueDate: "2023-08-09",
      lineItems: [
        { id: "1", description: "Sale of meat from Billy (G-001)", quantity: 1, unitPrice: 150, total: 150 }
      ],
      subtotal: 150,
      tax: 30, // Example tax
      total: 180,
      status: "Paid",
    },
];

const calculateTotals = (lineItems: InvoiceLineItem[]) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.20; // 20% tax for example
    const total = subtotal + tax;
    return { subtotal, tax, total };
}

export const InvoicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('invoices');
      if (item) {
        setInvoices(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
          window.localStorage.setItem('invoices', JSON.stringify(invoices));
      } catch (error) {
          console.error(error);
      }
    }
  }, [invoices, isInitialized]);
  
  const getNextInvoiceId = useCallback(() => {
    const lastId = invoices.reduce((maxId, inv) => {
        const idNum = parseInt(inv.id.split('-')[1] || '0');
        return idNum > maxId ? idNum : maxId;
    }, 0);
    return `INV-${String(lastId + 1).padStart(3, '0')}`;
  }, [invoices]);

  const addInvoice = useCallback((invoiceData: Omit<Invoice, 'id' | 'subtotal' | 'tax' | 'total'>) => {
    const newId = getNextInvoiceId();
    const totals = calculateTotals(invoiceData.lineItems);
    const newInvoice: Invoice = {
      ...invoiceData,
      id: newId,
      ...totals,
    };
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  }, [getNextInvoiceId]);

  const updateInvoice = useCallback((updatedInvoice: Invoice) => {
    const totals = calculateTotals(updatedInvoice.lineItems);
    const finalInvoice = { ...updatedInvoice, ...totals };
    setInvoices(prev => prev.map(inv => inv.id === finalInvoice.id ? finalInvoice : inv));
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  }, []);

  const getInvoice = useCallback((id: string) => {
    return invoices.find(inv => inv.id === id);
  }, [invoices]);

  return (
    <InvoicesContext.Provider value={{ invoices, getInvoice, addInvoice, updateInvoice, deleteInvoice, getNextInvoiceId }}>
      {children}
    </InvoicesContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoicesContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoicesProvider');
  }
  return context;
};
