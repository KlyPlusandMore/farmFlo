
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Invoice, InvoiceLineItem } from '@/lib/types';
import { useAuth } from './use-auth';

interface InvoicesContextType {
  invoices: Invoice[];
  getInvoice: (id: string) => Invoice | undefined;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'subtotal' | 'tax' | 'total' | 'userId'>) => Promise<Invoice | undefined>;
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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
        setInvoices([]);
        setLoading(false);
        return;
    }

    setLoading(true);
    const invoicesCollection = collection(db, 'invoices');
    const q = query(invoicesCollection, where("userId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const invoicesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Invoice));
        setInvoices(invoicesData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching invoices from Firestore: ", error);
        setInvoices([]);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addInvoice = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'subtotal' | 'tax' | 'total' | 'userId'>) => {
    if (!user) return undefined;
    
    const totals = calculateTotals(invoiceData.lineItems);
    try {
        const docRef = await addDoc(collection(db, 'invoices'), { ...invoiceData, ...totals, userId: user.uid });
        return { ...invoiceData, ...totals, id: docRef.id, userId: user.uid } as Invoice;
    } catch (error) {
        console.error("Error adding invoice: ", error);
        return undefined;
    }
  }, [user]);

  const updateInvoice = useCallback(async (updatedInvoice: Invoice) => {
    if (!user) return;
    try {
        const totals = calculateTotals(updatedInvoice.lineItems);
        const finalInvoice = { ...updatedInvoice, ...totals };
        const invoiceDocRef = doc(db, 'invoices', updatedInvoice.id);
        const { id, ...dataToUpdate } = finalInvoice;
        await updateDoc(invoiceDocRef, dataToUpdate);
    } catch (error) {
        console.error("Error updating invoice: ", error);
    }
  }, [user]);

  const deleteInvoice = useCallback(async (id: string) => {
    if (!user) return;
    try {
        const invoiceDocRef = doc(db, 'invoices', id);
        await deleteDoc(invoiceDocRef);
    } catch (error) {
        console.error("Error deleting invoice: ", error);
    }
  }, [user]);

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
