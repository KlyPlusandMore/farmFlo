import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InventoryItem } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

const inventory: InventoryItem[] = [
  { id: "F-001", name: "Corn Feed", category: "Feed", quantity: 500, unit: "kg", lowStockThreshold: 100 },
  { id: "F-002", name: "Soybean Meal", category: "Feed", quantity: 80, unit: "kg", lowStockThreshold: 150 },
  { id: "M-001", name: "Ivermectin", category: "Medicine", quantity: 20, unit: "bottles", lowStockThreshold: 10 },
  { id: "M-002", name: "Penicillin", category: "Medicine", quantity: 5, unit: "bottles", lowStockThreshold: 5 },
  { id: "E-001", name: "Syringes", category: "Equipment", quantity: 250, unit: "units", lowStockThreshold: 50 },
  { id: "E-002", name: "Heat Lamps", category: "Equipment", quantity: 8, unit: "units", lowStockThreshold: 4 },
];

export default function InventoryPage() {
  return (
    <>
      <PageHeader title="Stock & Supplies" description="Manage your inventory of feed, medicine, and equipment.">
        <Button>Add Item</Button>
      </PageHeader>
      
      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="w-[200px]">Stock Level</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => {
              const isLowStock = item.quantity <= item.lowStockThreshold;
              const stockPercentage = Math.min((item.quantity / (item.lowStockThreshold * 2)) * 100, 100);
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{`${item.quantity} ${item.unit}`}</TableCell>
                  <TableCell>
                    <Progress value={stockPercentage} className="h-2" />
                  </TableCell>
                  <TableCell>
                    {isLowStock ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : (
                      <Badge variant="default">In Stock</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
