// This is a new file that replaces ai-insights-form.tsx. The content from that file has been moved here and updated.
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  generateVehicleDiagnostics,
  type GenerateVehicleDiagnosticsOutput,
} from "@/ai/flows/generate-vehicle-diagnostics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, AlertTriangle, Wrench, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900, "Valid year is required"),
  mileage: z.coerce.number().min(0, "Mileage is required"),
  issueDescription: z.string().min(10, "Please provide a detailed description."),
});

type FormData = z.infer<typeof formSchema>;

export default function AiDiagnosticsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateVehicleDiagnosticsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: "Toyota",
      year: new Date().getFullYear(),
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateVehicleDiagnostics({
          ...values,
          issueDescription: values.issueDescription
      });
      setResult(response);
    } catch (error) {
      console.error("Error generating diagnostics:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI diagnostics. Please try again.",
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
          <CardTitle>Vehicle Data</CardTitle>
          <CardDescription>Enter vehicle details and issue to get diagnostics.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Toyota">Toyota</SelectItem>
                          <SelectItem value="Honda">Honda</SelectItem>
                          <SelectItem value="Ford">Ford</SelectItem>
                          <SelectItem value="BMW">BMW</SelectItem>
                          <SelectItem value="Mercedes">Mercedes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Camry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2021" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage (km)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 50000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                <FormField
                  control={form.control}
                  name="issueDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Engine makes a strange rattling noise on startup..." {...field} />
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
                    Generate Diagnostics
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
                <CardTitle>Possible Causes</CardTitle>
                <CardDescription>Potential reasons for the issue.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-muted-foreground">Analyzing data...</p>}
            {result?.possibleCauses && (
                <ul className="list-disc pl-5 space-y-1 font-medium">
                    {result.possibleCauses.map((cause, i) => <li key={i}>{cause}</li>)}
                </ul>
            )}
            {!isLoading && !result?.possibleCauses && <p className="text-muted-foreground">Submit vehicle data to get possible causes.</p>}
          </CardContent>
        </Card>
        <Card className="min-h-[150px]">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-full bg-primary/10 text-primary"><Wrench className="h-6 w-6" /></div>
            <div>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>Suggested steps for diagnosis.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-muted-foreground">Calculating recommendations...</p>}
            {result?.recommendedActions && (
                 <ul className="list-disc pl-5 space-y-1 font-medium">
                    {result.recommendedActions.map((action, i) => <li key={i}>{action}</li>)}
                </ul>
            )}
            {!isLoading && !result?.recommendedActions && <p className="text-muted-foreground">Submit vehicle data to get recommendations.</p>}
          </CardContent>
        </Card>
        <Card className="min-h-[150px]">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-full bg-primary/10 text-primary"><Euro className="h-6 w-6" /></div>
            <div>
                <CardTitle>Estimated Cost</CardTitle>
                <CardDescription>A rough estimate for repairs.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-muted-foreground">Calculating estimate...</p>}
            {result?.estimatedCost && <p className="font-medium">{result.estimatedCost}</p>}
            {!isLoading && !result && <p className="text-muted-foreground">Submit vehicle data to get an estimate.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
