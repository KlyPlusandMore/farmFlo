"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  generatePredictiveAlerts,
  type GeneratePredictiveAlertsOutput,
} from "@/ai/flows/generate-predictive-alerts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, AlertTriangle, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  animalSpecies: z.string().min(1, "Species is required"),
  animalAgeInMonths: z.coerce.number().min(1, "Age is required"),
  animalWeightInKg: z.coerce.number().min(1, "Weight is required"),
  gestationPeriodInDays: z.coerce.number().optional(),
  averageSaleWeightInKg: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AiInsightsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratePredictiveAlertsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      animalSpecies: "Bovine",
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generatePredictiveAlerts(values);
      setResult(response);
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Animal Data</CardTitle>
          <CardDescription>Enter the details of the animal to get predictions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="animalSpecies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Animal Species</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a species" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Bovine">Bovine (Cow)</SelectItem>
                        <SelectItem value="Porcine">Porcine (Pig)</SelectItem>
                        <SelectItem value="Poultry">Poultry (Chicken)</SelectItem>
                        <SelectItem value="Caprine">Caprine (Goat)</SelectItem>
                        <SelectItem value="Ovine">Ovine (Sheep)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="animalAgeInMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (months)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 24" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="animalWeightInKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 650" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gestationPeriodInDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gestation Period (days)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Optional, e.g., 283" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averageSaleWeightInKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avg. Sale Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Optional, e.g., 750" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Insights
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="min-h-[150px]">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
             <div className="p-3 rounded-full bg-primary/10 text-primary"><AlertTriangle className="h-6 w-6" /></div>
            <div>
                <CardTitle>Gestation Alert</CardTitle>
                <CardDescription>Likelihood of gestation based on data.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-muted-foreground">Analyzing data...</p>}
            {result?.gestationAlert && <p className="font-medium">{result.gestationAlert}</p>}
            {!isLoading && !result?.gestationAlert && <p className="text-muted-foreground">Provide gestation period to get an alert.</p>}
          </CardContent>
        </Card>
        <Card className="min-h-[150px]">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-full bg-primary/10 text-primary"><Scale className="h-6 w-6" /></div>
            <div>
                <CardTitle>Estimated Sale Weight</CardTitle>
                <CardDescription>Predicted weight at average sale age.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-muted-foreground">Calculating estimates...</p>}
            {result?.estimatedSaleWeight && <p className="font-medium">{result.estimatedSaleWeight} kg</p>}
             {result?.weightGainAdvice && <p className="text-sm text-muted-foreground mt-2">{result.weightGainAdvice}</p>}
            {!isLoading && !result?.estimatedSaleWeight && <p className="text-muted-foreground">Provide average sale weight to get an estimate.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
