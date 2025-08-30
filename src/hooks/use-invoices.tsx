
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Invoice, InvoiceLineItem } from '@/lib/types';

interface InvoicesContextType {
  invoices: Invoice[];
  getInvoice: (id: string) => Invoice | undefined;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'subtotal' | 'tax' | 'total'>) => Promise<Invoice | undefined>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  loading: boolean;
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

const calculateTotals = (lineItems: InvoiceLineItem[]) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.20; // 20% tax for example
    const total = subtotal + tax;
    return { subtotal, tax, total };
}

const initialInvoices: Invoice[] = [
    {
        id: "INV001",
        clientName: "Local Restaurant",
        clientEmail: "buyer@example.com",
        issueDate: "2024-05-15",
        dueDate: "2024-06-14",
        lineItems: [{ id: "LI01", description: "Sale of animal A004", quantity: 1, unitPrice: 300, total: 300 }],
        subtotal: 300,
        tax: 60,
        total: 360,
        status: "Paid",
    },
    {
        id: "INV002",
        clientName: "Butcher Shop",
        clientEmail: "butcher@example.com",
        issueDate: "2024-04-20",
        dueDate: "2024-05-20",
        lineItems: [{ id: "LI02", description: "Sale of 5 Yorkshire pigs", quantity: 5, unitPrice: 150, total: 750 }],
        subtotal: 750,
        tax: 150,
        total: 900,
        status: "Overdue",
    }
];

export const InvoicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporarily load initial data to bypass Firestore permission issues
    setInvoices(initialInvoices);
    setLoading(false);

    // The code below connects to Firestore. It is commented out until permissions are fixed.
    /*
    const invoicesCollection = collection(db, 'invoices');
    const q = query(invoicesCollection, orderBy('issueDate', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const invoicesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Invoice));
        setInvoices(invoicesData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching invoices from Firestore: ", error);
        setInvoices(initialInvoices);
        setLoading(false);
    });

    return () => unsubscribe();
    */
  }, []);

  const addInvoice = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'subtotal' | 'tax' | 'total'>) => {
    const totals = calculateTotals(invoiceData.lineItems);
    const newInvoice: Invoice = {
      ...invoiceData,
      ...totals,
      id: `INV${(Math.random() * 1000).toFixed(0).padStart(3,'0')}`,
    };
    try {
        setInvoices(prev => [newInvoice, ...prev]);
        // The line below connects to Firestore. It is commented out until permissions are fixed.
        // const docRef = await addDoc(collection(db, 'invoices'), { ...invoiceData, ...totals });
        return { ...newInvoice, id: newInvoice.id };
    } catch (error) {
        console.error("Error adding invoice: ", error);
        return undefined;
    }
  }, []);

  const updateInvoice = useCallback(async (updatedInvoice: Invoice) => {
    try {
        const totals = calculateTotals(updatedInvoice.lineItems);
        const finalInvoice = { ...updatedInvoice, ...totals };
        setInvoices(prev => prev.map(inv => inv.id === finalInvoice.id ? finalInvoice : inv));
        // The lines below connect to Firestore. They are commented out until permissions are fixed.
        // const invoiceDocRef = doc(db, 'invoices', updatedInvoice.id);
        // const { id, ...dataToUpdate } = finalInvoice;
        // await updateDoc(invoiceDocRef, dataToUpdate);
    } catch (error) {
        console.error("Error updating invoice: ", error);
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    try {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        // The line below connects to Firestore. It is commented out until permissions are fixed.
        // const invoiceDocRef = doc(db, 'invoices', id);
        // await deleteDoc(invoiceDocRef);
    } catch (error) {
        console.error("Error deleting invoice: ", error);
    }
  }, []);

  const getInvoice = useCallback((id: string) => {
    return invoices.find(inv => inv.id === id);
  }, [invoices]);

  return (
    <InvoicesContext.Provider value={{ invoices, getInvoice, addInvoice, updateInvoice, deleteInvoice, loading }}>
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
