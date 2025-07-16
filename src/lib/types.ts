import type { LucideIcon } from "lucide-react";

export type Species = "Bovine" | "Porcine" | "Poultry" | "Caprine" | "Rabbit";

export interface Animal {
  id: string;
  name: string;
  species: Species;
  age: number; // in months
  weight: number; // in kg
  lot: string;
  status: "Healthy" | "Sick" | "Sold";
  salePrice?: number;
}

export interface InventoryItem {
  id: string;
  name:string;
  category: "Feed" | "Medicine" | "Equipment";
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
  category: "Sale" | "Feed" | "Medicine" | "Equipment" | "Other";
  type: "Income" | "Expense";
  amount: number;
};
