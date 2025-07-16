
'use server';

/**
 * @fileOverview An AI agent for generating vehicle diagnostic insights.
 *
 * - generateVehicleDiagnostics - A function that generates diagnostic insights for vehicles.
 * - GenerateVehicleDiagnosticsInput - The input type for the generateVehicleDiagnostics function.
 * - GenerateVehicleDiagnosticsOutput - The return type for the generateVehicleDiagnostics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVehicleDiagnosticsInputSchema = z.object({
  make: z.string().describe('The make of the vehicle (e.g., Toyota, Ford).'),
  model: z.string().describe('The model of the vehicle (e.g., Camry, F-150).'),
  year: z.number().describe('The manufacturing year of the vehicle.'),
  mileage: z.number().describe('The current mileage of the vehicle in kilometers.'),
  issueDescription: z
    .string()
    .describe('A description of the issue the vehicle is experiencing.'),
});
export type GenerateVehicleDiagnosticsInput = z.infer<typeof GenerateVehicleDiagnosticsInputSchema>;

const GenerateVehicleDiagnosticsOutputSchema = z.object({
  possibleCauses: z
    .array(z.string())
    .describe('A list of possible causes for the described issue.'),
  recommendedActions: z
    .array(z.string())
    .describe('A list of recommended actions or checks to perform.'),
  estimatedCost: z
    .string()
    .optional()
    .describe('A rough estimate of the potential repair cost.'),
});
export type GenerateVehicleDiagnosticsOutput = z.infer<typeof GenerateVehicleDiagnosticsOutputSchema>;

export async function generateVehicleDiagnostics(
  input: GenerateVehicleDiagnosticsInput
): Promise<GenerateVehicleDiagnosticsOutput> {
  return generateVehicleDiagnosticsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVehicleDiagnosticsPrompt',
  input: {schema: GenerateVehicleDiagnosticsInputSchema},
  output: {schema: GenerateVehicleDiagnosticsOutputSchema},
  prompt: `You are an expert AI mechanic specializing in vehicle diagnostics.

  Based on the provided vehicle data and issue description, generate a preliminary diagnostic report.

  Make: {{{make}}}
  Model: {{{model}}}
  Year: {{{year}}}
  Mileage: {{{mileage}}} km
  Issue Description: {{{issueDescription}}}

  Generate a list of the most likely causes for the issue.
  Provide a list of recommended diagnostic steps or checks.
  Optionally, provide a very rough cost estimate for the repair (e.g., "€100-€300").

  Ensure your response is clear, concise, and helpful for a mechanic or vehicle owner.
  If the issue is unclear, state that more information is needed.
  `,
});

const generateVehicleDiagnosticsFlow = ai.defineFlow(
  {
    name: 'generateVehicleDiagnosticsFlow',
    inputSchema: GenerateVehicleDiagnosticsInputSchema,
    outputSchema: GenerateVehicleDiagnosticsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
