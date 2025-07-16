
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction } from '@/lib/types';

interface AccountingContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
  { id: "T-001", date: "2023-07-10", description: "Sale of meat from Billy (G-001)", category: "Sale", type: "Income", amount: 150 },
  { id: "T-002", date: "2023-07-05", description: "Purchase Corn Feed", category: "Feed", type: "Expense", amount: 300 },
  { id: "T-003", date: "2023-07-02", description: "Purchase Ivermectin", category: "Medicine", type: "Expense", amount: 75 },
];

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window === 'undefined') {
        return initialTransactions;
    }
    try {
      const item = window.localStorage.getItem('transactions');
      return item ? JSON.parse(item) : initialTransactions;
    } catch (error) {
      console.error(error);
      return initialTransactions;
    }
  });

  useEffect(() => {
    try {
        window.localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
        console.error(error);
    }
  }, [transactions]);
  
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => {
        const newId = `T-${String(prev.length + 1).padStart(3, '0')}`;
        const newTransaction: Transaction = {
            ...transaction,
            id: newId,
        };
        const updatedTransactions = [newTransaction, ...prev];
        updatedTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return updatedTransactions;
    });
  }, []);

  return (
    <AccountingContext.Provider value={{ transactions, addTransaction }}>
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
