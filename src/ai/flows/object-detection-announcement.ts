'use server';
/**
 * @fileOverview ELEOS Spatial Object Detection Flow powered by Gemini 2.5 Flash.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ObjectDetectionInputSchema = z.object({
  imageDataUri: z.string().describe("A photo of the scene as a base64 data URI."),
  sensitivity: z.number().default(3).describe("1: Only danger, 3: Standard, 5: Hyper-aware"),
});
export type ObjectDetectionInput = z.infer<typeof ObjectDetectionInputSchema>;

const DetectedObjectSchema = z.object({
  name: z.string().describe('Object name.'),
  confidence: z.number(),
  boundingBox: z.object({
    x: z.number().describe('Center X (0-1). 0.5 is 12 o\'clock.'),
    y: z.number().describe('Center Y (0-1)'),
    width: z.number(),
    height: z.number().describe('Height ratio for distance. Larger = closer.'),
  }),
});

const ObjectDetectionOutputSchema = z.object({
  detectedObjects: z.array(DetectedObjectSchema),
  urgentStop: z.boolean().describe("True if an obstacle is immediately dangerous (<0.5m)."),
});
export type ObjectDetectionOutput = z.infer<typeof ObjectDetectionOutputSchema>;

export async function detectAndAnnounceObjects(input: ObjectDetectionInput): Promise<ObjectDetectionOutput> {
  return objectDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'objectDetectionPrompt',
  input: { schema: ObjectDetectionInputSchema },
  output: { schema: ObjectDetectionOutputSchema },
  prompt: `You are ELEOS, a mobility assistant for the visually impaired. Analyze the provided image.
  
  SENSITIVITY LEVEL: {{{sensitivity}}}
  - Level 1: Only report objects directly in path and closer than 1 meter.
  - Level 3: Report obstacles and navigation paths (doors, hallways).
  - Level 5: Report everything in detail (surroundings).

  STRICT JSON OUTPUT mapping: 
  Center X (0.5 is 12 o'clock). 
  Object height determines distance (height > 0.7 is < 0.5m).
  Set urgentStop to true ONLY if an obstacle is directly at 12 o'clock and very large.

  Photo: {{media url=imageDataUri}}`,
});

const objectDetectionFlow = ai.defineFlow(
  {
    name: 'objectDetectionFlow',
    inputSchema: ObjectDetectionInputSchema,
    outputSchema: ObjectDetectionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
