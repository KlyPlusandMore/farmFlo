'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bird, Rabbit, Users, TrendingUp, DollarSign } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { CowIcon, GoatIcon, PigIcon } from "@/components/icons";

const animalData = [
  { species: "Bovins", count: 45, fill: "var(--color-bovins)" },
  { species: "Porcins", count: 120, fill: "var(--color-porcins)" },
  { species: "Volailles", count: 350, fill: "var(--color-volailles)" },
  { species: "Caprins", count: 80, fill: "var(--color-caprins)" },
  { species: "Lapins", count: 200, fill: "var(--color-lapins)" },
];

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
  bovins: { label: "Bovins", color: "hsl(var(--chart-1))" },
  porcins: { label: "Porcins", color: "hsl(var(--chart-2))" },
  volailles: { label: "Volailles", color: "hsl(var(--chart-3))" },
  caprins: { label: "Caprins", color: "hsl(var(--chart-4))" },
  lapins: { label: "Lapins", color: "hsl(var(--chart-5))" },
};

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">795</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reproduction Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+2% from last cycle</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€12,234.50</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
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
            <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-card-hover cursor-pointer transition-colors">
                <CowIcon className="h-10 w-10 text-primary"/>
                <span className="font-medium">Bovins</span>
            </div>
             <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-card-hover cursor-pointer transition-colors">
                <PigIcon className="h-10 w-10 text-primary"/>
                <span className="font-medium">Porcins</span>
            </div>
             <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-card-hover cursor-pointer transition-colors">
                <Bird className="h-10 w-10 text-primary"/>
                <span className="font-medium">Volailles</span>
            </div>
             <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-card-hover cursor-pointer transition-colors">
                <GoatIcon className="h-10 w-10 text-primary"/>
                <span className="font-medium">Caprins</span>
            </div>
             <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-card-hover cursor-pointer transition-colors">
                <Rabbit className="h-10 w-10 text-primary"/>
                <span className="font-medium">Lapins</span>
            </div>
          </CardContent>
        </Card>
    </>
  );
}
