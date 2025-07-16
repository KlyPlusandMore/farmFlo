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
import type { Animal, Species } from "@/lib/types";
import { CowIcon, PigIcon, GoatIcon } from "@/components/icons";
import { Bird, Rabbit } from "lucide-react";
import { Button } from "@/components/ui/button";

const animals: Animal[] = [
  { id: "B-001", name: "Bessie", species: "Bovine", age: 24, weight: 650, lot: "A1", status: "Healthy" },
  { id: "B-002", name: "Angus", species: "Bovine", age: 36, weight: 720, lot: "A1", status: "Healthy" },
  { id: "P-001", name: "Porky", species: "Porcine", age: 6, weight: 110, lot: "B2", status: "Healthy" },
  { id: "P-002", name: "Wilbur", species: "Porcine", age: 7, weight: 125, lot: "B2", status: "Sick" },
  { id: "C-001", name: "Cluck", species: "Poultry", age: 12, weight: 2, lot: "C3", status: "Healthy" },
  { id: "G-001", name: "Billy", species: "Caprine", age: 18, weight: 60, lot: "D4", status: "Sold" },
  { id: "R-001", name: "Roger", species: "Rabbit", age: 4, weight: 3, lot: "E5", status: "Healthy" },
];

const speciesIcons: Record<Species, React.ElementType> = {
  Bovine: CowIcon,
  Porcine: PigIcon,
  Poultry: Bird,
  Caprine: GoatIcon,
  Rabbit: Rabbit,
};

const statusColors: Record<Animal["status"], "default" | "destructive" | "secondary"> = {
  Healthy: "default",
  Sick: "destructive",
  Sold: "secondary",
};


export default function AnimalsPage() {
  return (
    <>
      <PageHeader title="Animal Management" description="View and manage all animals in your farm.">
        <Button>Add Animal</Button>
      </PageHeader>
      
      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Species</TableHead>
              <TableHead>Age (mths)</TableHead>
              <TableHead>Weight (kg)</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {animals.map((animal) => {
              const Icon = speciesIcons[animal.species];
              return (
                <TableRow key={animal.id}>
                  <TableCell className="font-medium">{animal.id}</TableCell>
                  <TableCell>{animal.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      {animal.species}
                    </div>
                  </TableCell>
                  <TableCell>{animal.age}</TableCell>
                  <TableCell>{animal.weight}</TableCell>
                  <TableCell>{animal.lot}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[animal.status]}>{animal.status}</Badge>
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
