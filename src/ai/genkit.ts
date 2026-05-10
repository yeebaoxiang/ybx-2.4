import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * ELEOS Genkit Configuration.
 * Using Gemini 2.5 Flash (googleAI) for high-speed vision as per the Final ELEOS specification.
 */
export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }),
  ],
  model: googleAI.model('gemini-2.5-flash'),
});
