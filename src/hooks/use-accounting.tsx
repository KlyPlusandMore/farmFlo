
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction } from '@/lib/types';

interface AccountingContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
  { id: "T-001", date: "2023-07-10", description: "Sale of 2019 BMW X5", category: "Sale", type: "Income", amount: 35000 },
  { id: "T-002", date: "2023-07-05", description: "Purchase Brake Pads", category: "Brake Part", type: "Expense", amount: 300 },
  { id: "T-003", date: "2023-07-02", description: "Purchase Engine Oil", category: "Fluid", type: "Expense", amount: 75 },
];

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('transactions');
      if (item) {
        setTransactions(JSON.parse(item));
      } else {
        setTransactions(initialTransactions);
      }
    } catch (error) {
      console.error(error);
      setTransactions(initialTransactions);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
          window.localStorage.setItem('transactions', JSON.stringify(transactions));
      } catch (error) {
          console.error(error);
      }
    }
  }, [transactions, isInitialized]);
  
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
