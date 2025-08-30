
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

export const InvoicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addInvoice = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'subtotal' | 'tax' | 'total'>) => {
    const totals = calculateTotals(invoiceData.lineItems);
    const newInvoice: Omit<Invoice, 'id'> = {
      ...invoiceData,
      ...totals,
    };
    try {
        const docRef = await addDoc(collection(db, 'invoices'), newInvoice);
        return { ...newInvoice, id: docRef.id };
    } catch (error) {
        console.error("Error adding invoice: ", error);
    }
  }, []);

  const updateInvoice = useCallback(async (updatedInvoice: Invoice) => {
    const invoiceDocRef = doc(db, 'invoices', updatedInvoice.id);
    try {
        const totals = calculateTotals(updatedInvoice.lineItems);
        const { id, ...dataToUpdate } = { ...updatedInvoice, ...totals };
        await updateDoc(invoiceDocRef, dataToUpdate);
    } catch (error) {
        console.error("Error updating invoice: ", error);
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    const invoiceDocRef = doc(db, 'invoices', id);
    try {
        await deleteDoc(invoiceDocRef);
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
