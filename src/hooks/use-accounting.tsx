
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/lib/types';
import { useAuth } from './use-auth';

interface AccountingContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  loading: boolean;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const transactionsCollection = collection(db, 'transactions');
    const q = query(transactionsCollection, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      setTransactions(transactionsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions from Firestore: ", error);
      setTransactions([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;
    try {
        await addDoc(collection(db, 'transactions'), { ...transactionData, userId: user.uid });
    } catch (error) {
      console.error("Error adding transaction: ", error);
    }
  }, [user]);

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
