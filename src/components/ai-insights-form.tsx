
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, AlertTriangle, ShieldCheck, HeartPulse } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  species: z.string().min(1, "Species is required"),
  age: z.coerce.number().min(0, "Age is required"),
  weight: z.coerce.number().min(0, "Weight is required"),
  symptoms: z.string().min(10, "Please provide a detailed description of symptoms."),
});

type FormData = z.infer<typeof formSchema>;

export default function AiInsightsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratePredictiveAlertsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      species: "Bovine",
      age: 12,
      weight: 150,
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generatePredictiveAlerts(values);
      setResult(response);
    } catch (error) {
      console.error("Error generating alerts:", error);
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
          <CardDescription>Enter animal details and symptoms to get predictive alerts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="grid grid-cols-1 gap-4">
                 <FormField
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Species</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a species" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bovine">Bovine</SelectItem>
                          <SelectItem value="Porcine">Porcine</SelectItem>
                          <SelectItem value="Poultry">Poultry</SelectItem>
                          <SelectItem value="Caprine">Caprine</SelectItem>
                          <SelectItem value="Rabbit">Rabbit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
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
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptoms / Observations</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Animal is lethargic and has a reduced appetite..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Alerts
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
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Overall health risk level.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-muted-foreground">Analyzing data...</p>}
            {result?.riskLevel && (
                <p className="font-medium text-lg">{result.riskLevel}</p>
            )}
            {!isLoading && !result?.riskLevel && <p className="text-muted-foreground">Submit animal data to get a risk assessment.</p>}
          </CardContent>
        </Card>
        <Card className="min-h-[150px]">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-full bg-primary/10 text-primary"><HeartPulse className="h-6 w-6" /></div>
            <div>
                <CardTitle>Potential Health Issues</CardTitle>
                <CardDescription>Possible underlying conditions.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-muted-foreground">Identifying issues...</p>}
            {result?.potentialIssues && (
                 <ul className="list-disc pl-5 space-y-1 font-medium">
                    {result.potentialIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
            )}
            {!isLoading && !result?.potentialIssues && <p className="text-muted-foreground">Submit animal data to see potential issues.</p>}
          </CardContent>
        </Card>
        <Card className="min-h-[150px]">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-full bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" /></div>
            <div>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>Suggested next steps.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-muted-foreground">Calculating recommendations...</p>}
            {result?.recommendedActions && (
                 <ul className="list-disc pl-5 space-y-1 font-medium">
                    {result.recommendedActions.map((action, i) => <li key={i}>{action}</li>)}
                </ul>
            )}
            {!isLoading && !result && <p className="text-muted-foreground">Submit animal data to get recommendations.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
