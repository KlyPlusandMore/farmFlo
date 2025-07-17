
'use server';

/**
 * @fileOverview An AI agent for generating predictive health alerts for farm animals.
 *
 * - generatePredictiveAlerts - A function that generates health alerts.
 * - GeneratePredictiveAlertsInput - The input type for the function.
 * - GeneratePredictiveAlertsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePredictiveAlertsInputSchema = z.object({
  species: z.string().describe('The species of the animal (e.g., Bovine, Porcine).'),
  age: z.number().describe('The age of the animal in months.'),
  weight: z.number().describe('The weight of the animal in kilograms.'),
  symptoms: z.string().describe('A description of the animal\'s symptoms or unusual behavior.'),
});
export type GeneratePredictiveAlertsInput = z.infer<typeof GeneratePredictiveAlertsInputSchema>;

const GeneratePredictiveAlertsOutputSchema = z.object({
  riskLevel: z.string().describe('The assessed risk level (e.g., Low, Medium, High, Critical).'),
  potentialIssues: z.array(z.string()).describe('A list of potential health issues or diseases.'),
  recommendedActions: z.array(z.string()).describe('A list of recommended actions, such as "Consult a veterinarian" or "Isolate the animal".'),
});
export type GeneratePredictiveAlertsOutput = z.infer<typeof GeneratePredictiveAlertsOutputSchema>;

export async function generatePredictiveAlerts(
  input: GeneratePredictiveAlertsInput
): Promise<GeneratePredictiveAlertsOutput> {
  return generatePredictiveAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePredictiveAlertsPrompt',
  input: {schema: GeneratePredictiveAlertsInputSchema},
  output: {schema: GeneratePredictiveAlertsOutputSchema},
  prompt: `You are an expert veterinarian AI specializing in early disease detection in farm animals.

  Based on the provided animal data and symptoms, generate a predictive health alert.

  Species: {{{species}}}
  Age: {{{age}}} months
  Weight: {{{weight}}} kg
  Symptoms: {{{symptoms}}}

  Assess the risk level for the animal's health.
  Identify potential health issues or diseases.
  Recommend immediate actions for the farmer to take.

  Ensure your response is clear, concise, and actionable for a non-expert.
  If the symptoms are benign, state that the risk is low.
  `,
});

const generatePredictiveAlertsFlow = ai.defineFlow(
  {
    name: 'generatePredictiveAlertsFlow',
    inputSchema: GeneratePredictiveAlertsInputSchema,
    outputSchema: GeneratePredictiveAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
