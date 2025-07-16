// src/ai/flows/generate-predictive-alerts.ts
'use server';

/**
 * @fileOverview An AI agent for generating predictive insights and alerts for animal lifecycles.
 *
 * - generatePredictiveAlerts - A function that generates predictive insights and alerts for gestation periods and estimated sale weights.
 * - GeneratePredictiveAlertsInput - The input type for the generatePredictiveAlerts function.
 * - GeneratePredictiveAlertsOutput - The return type for the generatePredictiveAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePredictiveAlertsInputSchema = z.object({
  animalSpecies: z.string().describe('The species of the animal (e.g., bovine, porcine, etc.).'),
  animalAgeInMonths: z.number().describe('The age of the animal in months.'),
  animalWeightInKg: z.number().describe('The current weight of the animal in kilograms.'),
  gestationPeriodInDays: z
    .number()
    .optional()
    .describe('The gestation period of the animal species in days. Required for predicting gestation alerts.'),
  averageSaleWeightInKg: z
    .number()
    .optional()
    .describe('The average sale weight of the animal species in kilograms. Required for estimating sale weight.'),
});
export type GeneratePredictiveAlertsInput = z.infer<typeof GeneratePredictiveAlertsInputSchema>;

const GeneratePredictiveAlertsOutputSchema = z.object({
  gestationAlert: z
    .string()
    .optional()
    .describe('An alert indicating the likelihood of gestation based on the provided data.'),
  estimatedSaleWeight: z
    .number()
    .optional()
    .describe('The estimated sale weight of the animal based on its current age and weight.'),
  weightGainAdvice: z
    .string()
    .optional()
    .describe('Advice on optimizing weight gain for the animal to reach the desired sale weight.'),
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
  prompt: `You are an AI assistant specializing in providing predictive insights for livestock management.

  Based on the provided animal data, generate alerts and estimations to help optimize animal lifecycles and sales strategies.

  Species: {{{animalSpecies}}}
  Age (months): {{{animalAgeInMonths}}}
  Weight (kg): {{{animalWeightInKg}}}
  Gestation Period (days, if known): {{{gestationPeriodInDays}}}
  Average Sale Weight (kg, if known): {{{averageSaleWeightInKg}}}

  Generate a gestation alert if the gestation period is provided, estimating the likelihood of gestation based on the animal's age and species.
  Estimate the sale weight of the animal based on its current age and weight, if the average sale weight is provided.
  Provide advice on optimizing weight gain to reach the desired sale weight, if the average sale weight is provided.

  Ensure that any numerical estimations are clearly stated with their units (e.g., kg).
  If certain data is unavailable, return null for that particular key.
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
