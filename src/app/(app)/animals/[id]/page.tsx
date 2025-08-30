
"use client";

import { useParams, useRouter } from "next/navigation";
import { useAnimals } from "@/hooks/use-animals";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rabbit, Weight, Calendar, VenetianMask, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Animal } from "@/lib/types";

const statusColors: Record<Animal["status"], "default" | "destructive" | "secondary"> = {
  Healthy: "default",
  "At Risk": "destructive",
  Sold: "secondary",
};

const getAgeString = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
        years--;
        months += 12;
    }
    let result = '';
    if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
    if (months > 0) {
        if (result) result += ', ';
        result += `${months} month${months > 1 ? 's' : ''}`;
    }
    return result || '0 months';
};

function InfoCard({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getAnimal } = useAnimals();
  const id = typeof params.id === 'string' ? params.id : '';
  const animal = getAnimal(id);

  if (!animal) {
    return (
        <>
            <PageHeader title="Animal Not Found" className="hidden md:flex"/>
            <p>The animal you are looking for does not exist.</p>
        </>
    )
  }

  return (
    <>
      <PageHeader 
        title={`${animal.name} (${animal.id.substring(0,6)}...)`}
        description={`Detailed information for ${animal.breed} ${animal.species}.`}
        className="hidden md:flex"
      >
        <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
        </Button>
      </PageHeader>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Rabbit className="h-6 w-6 text-primary" />
                <span>Identity</span>
            </CardTitle>
            <CardDescription>
                <Badge variant={statusColors[animal.status]}>{animal.status}</Badge>
                 {animal.status === 'Sold' && animal.salePrice && 
                    <span className="ml-2 text-sm font-medium">Sold for €{animal.salePrice.toFixed(2)}</span>
                }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard icon={Rabbit} title="Species" value={animal.species} />
              <InfoCard icon={VenetianMask} title="Breed" value={animal.breed} />
              <InfoCard icon={Calendar} title="Age" value={getAgeString(animal.birthDate)} />
              <InfoCard icon={Weight} title="Weight" value={`${animal.weight} kg`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                 <div><span className="font-semibold">Gender:</span> {animal.gender}</div>
                 <div><span className="font-semibold">Lot:</span> {animal.lot}</div>
                 <div><span className="font-semibold">Birth Date:</span> {new Date(animal.birthDate).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Notes & History</CardTitle>
                <CardDescription>Additional information and observations about this animal.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{animal.notes || 'No notes available.'}</p>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
