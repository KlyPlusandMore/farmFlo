
'use client'

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bird, Rabbit, Users, TrendingUp, DollarSign } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { CowIcon, GoatIcon, PigIcon } from "@/components/icons";
import { useAnimals } from "@/hooks/use-animals";
import { useAccounting } from "@/hooks/use-accounting";

const weightData = [
  { month: "Jan", weight: 65 },
  { month: "Feb", weight: 72 },
  { month: "Mar", weight: 80 },
  { month: "Apr", weight: 85 },
  { month: "May", weight: 92 },
  { month: "Jun", weight: 101 },
];

const chartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--chart-1))",
  },
  Bovine: { label: "Bovine", color: "hsl(var(--chart-1))" },
  Porcine: { label: "Porcine", color: "hsl(var(--chart-2))" },
  Poultry: { label: "Poultry", color: "hsl(var(--chart-3))" },
  Caprine: { label: "Caprine", color: "hsl(var(--chart-4))" },
  Rabbit: { label: "Rabbit", color: "hsl(var(--chart-5))" },
};

const speciesLinks = [
  { species: 'Bovine', icon: CowIcon, href: '/animals?species=Bovine' },
  { species: 'Porcine', icon: PigIcon, href: '/animals?species=Porcine' },
  { species: 'Poultry', icon: Bird, href: '/animals?species=Poultry' },
  { species: 'Caprine', icon: GoatIcon, href: '/animals?species=Caprine' },
  { species: 'Rabbit', icon: Rabbit, href: '/animals?species=Rabbit' },
]

export default function DashboardPage() {
  const { animals } = useAnimals();
  const { transactions } = useAccounting();

  const totalAnimals = animals.length;
  const activeAnimals = animals.filter(a => a.status !== 'Sold').length;

  const { totalRevenue, totalExpenses } = useMemo(() => {
    const totalRevenue = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalRevenue, totalExpenses };
  }, [transactions]);

  const animalData = useMemo(() => {
    const speciesCounts = animals.reduce((acc, animal) => {
        acc[animal.species] = (acc[animal.species] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(speciesCounts).map(([species, count]) => ({
      species,
      count,
      fill: `var(--color-${species})`
    }));
  }, [animals]);


  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back, here is a summary of your farm." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAnimals}</div>
            <p className="text-xs text-muted-foreground">{totalAnimals} animals in total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All-time income</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All-time expenses</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204 L</div>
            <p className="text-xs text-muted-foreground">Milk production this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Animals by Species</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart data={animalData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="species" tickLine={false} tickMargin={10} axisLine={false} />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Average Weight Growth (Bovins)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <LineChart data={weightData} accessibilityLayer margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <Tooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" strokeWidth={2} dot={true} />
                </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

       <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Access Species</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {speciesLinks.map(({ species, icon: Icon, href }) => (
                <Link key={species} href={href}>
                    <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-card-hover cursor-pointer transition-colors">
                        <Icon className="h-10 w-10 text-primary"/>
                        <span className="font-medium">{species}</span>
                    </div>
                </Link>
            ))}
          </CardContent>
        </Card>
    </>
  );
}
