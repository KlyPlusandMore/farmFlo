
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/lib/types';

interface AccountingContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  loading: boolean;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
    { id: "T001", date: "2024-05-15", description: "Sale of animal A004", category: "Sale", type: "Income", amount: 300 },
    { id: "T002", date: "2024-05-10", description: "Purchase of 20 bags of bovine feed", category: "Feed", type: "Expense", amount: 500 },
    { id: "T003", date: "2024-05-08", description: "Veterinary visit for Lot L001", category: "Medication", type: "Expense", amount: 150 },
];

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporarily load initial data to bypass Firestore permission issues
    setTransactions(initialTransactions);
    setLoading(false);

    // The code below connects to Firestore. It is commented out until permissions are fixed.
    /*
    const transactionsCollection = collection(db, 'transactions');
    const q = query(transactionsCollection, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      setTransactions(transactionsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions from Firestore: ", error);
      setTransactions(initialTransactions);
      setLoading(false);
    });

    return () => unsubscribe();
    */
  }, []);

  const addTransaction = useCallback(async (transactionData: Omit<Transaction, 'id'>) => {
    try {
        const newTransaction = { ...transactionData, id: crypto.randomUUID() };
        setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        // The line below connects to Firestore. It is commented out until permissions are fixed.
        // await addDoc(collection(db, 'transactions'), transactionData);
    } catch (error) {
      console.error("Error adding transaction: ", error);
    }
  }, []);

  return (
    <AccountingContext.Provider value={{ transactions, addTransaction, loading }}>
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (context === undefined) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
