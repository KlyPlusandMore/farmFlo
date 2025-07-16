import type { LucideIcon } from "lucide-react";

export type Make = "Toyota" | "Honda" | "Ford" | "BMW" | "Mercedes";

export interface Vehicle {
  id: string; // VIN
  make: Make;
  model: string;
  year: number;
  mileage: number; // in km
  location: string;
  status: "Available" | "In Service" | "Sold";
  salePrice?: number;
}

export interface InventoryItem {
  id: string;
  name:string;
  category: "Engine Part" | "Brake Part" | "Suspension Part" | "Fluid" | "Tool";
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

export type ServiceCycle = {
  id: string;
  locationId: string;
  make: Make;
  vehicleCount: number;
  startDate: string;
  steps: CycleStep[];
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  category: "Sale" | "Engine Part" | "Brake Part" | "Suspension Part" | "Fluid" | "Tool" | "Other";
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
