import type { LucideIcon } from "lucide-react";

export type Species = "Bovine" | "Porcine" | "Poultry" | "Caprine" | "Rabbit";

export interface Animal {
  id: string;
  name: string;
  species: Species;
  breed: string;
  birthDate: string; // ISO string
  gender: "Male" | "Female";
  weight: number; // in kg
  lot: string;
  status: "Healthy" | "At Risk" | "Sold";
  salePrice?: number;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name:string;
  category: "Feed" | "Medication" | "Equipment";
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  purchasePrice?: number;
}

export type CycleStep = {
  name: string;
  icon: LucideIcon;
  date: string;
  status: "completed" | "pending" | "active";
};

export type ProductionCycle = {
  id: string;
  lotId: string;
  species: Species;
  animalCount: number;
  startDate: string;
  steps: CycleStep[];
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  category: "Sale" | "Feed" | "Medication" | "Equipment" | "Other";
  type: "Income" | "Expense";
  amount: number;
};

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
}
