
'use client'

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Car, Users, TrendingUp, DollarSign } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useVehicles } from "@/hooks/use-vehicles";
import { useAccounting } from "@/hooks/use-accounting";

const mileageData = [
  { month: "Jan", mileage: 65000 },
  { month: "Feb", mileage: 72000 },
  { month: "Mar", mileage: 80000 },
  { month: "Apr", mileage: 85000 },
  { month: "May", mileage: 92000 },
  { month: "Jun", mileage: 101000 },
];

const chartConfig = {
  mileage: {
    label: "Mileage (km)",
    color: "hsl(var(--chart-1))",
  },
  Toyota: { label: "Toyota", color: "hsl(var(--chart-1))" },
  Honda: { label: "Honda", color: "hsl(var(--chart-2))" },
  Ford: { label: "Ford", color: "hsl(var(--chart-3))" },
  BMW: { label: "BMW", color: "hsl(var(--chart-4))" },
  Mercedes: { label: "Mercedes", color: "hsl(var(--chart-5))" },
};

const makeLinks = [
  { make: 'Toyota', icon: Car, href: '/vehicles?make=Toyota' },
  { make: 'Honda', icon: Car, href: '/vehicles?make=Honda' },
  { make: 'Ford', icon: Car, href: '/vehicles?make=Ford' },
  { make: 'BMW', icon: Car, href: '/vehicles?make=BMW' },
  { make: 'Mercedes', icon: Car, href: '/vehicles?make=Mercedes' },
]

export default function DashboardPage() {
  const { vehicles } = useVehicles();
  const { transactions } = useAccounting();

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(a => a.status !== 'Sold').length;

  const { totalRevenue, totalExpenses } = useMemo(() => {
    const totalRevenue = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalRevenue, totalExpenses };
  }, [transactions]);

  const vehicleData = useMemo(() => {
    const makeCounts = vehicles.reduce((acc, vehicle) => {
        acc[vehicle.make] = (acc[vehicle.make] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(makeCounts).map(([make, count]) => ({
      make,
      count,
      fill: `var(--color-${make})`
    }));
  }, [vehicles]);


  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back, here is a summary of your auto-car business." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableVehicles}</div>
            <p className="text-xs text-muted-foreground">{totalVehicles} vehicles in total</p>
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
            <CardTitle className="text-sm font-medium">Recent Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Vehicles sold this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Vehicles by Make</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart data={vehicleData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="make" tickLine={false} tickMargin={10} axisLine={false} />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Average Mileage Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <LineChart data={mileageData} accessibilityLayer margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <Tooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="mileage" stroke="var(--color-mileage)" strokeWidth={2} dot={true} />
                </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

       <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Access Makes</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {makeLinks.map(({ make, icon: Icon, href }) => (
                <Link key={make} href={href}>
                    <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-card-hover cursor-pointer transition-colors">
                        <Icon className="h-10 w-10 text-primary"/>
                        <span className="font-medium">{make}</span>
                    </div>
                </Link>
            ))}
          </CardContent>
        </Card>
    </>
  );
}
