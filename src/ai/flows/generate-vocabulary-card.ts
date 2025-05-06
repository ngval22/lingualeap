// src/ai/flows/generate-vocabulary-card.ts
'use server';

/**
 * @fileOverview AI flow for generating a vocabulary card with translations, example sentences, and a relevant image.
 *
 * - generateVocabularyCard - A function that handles the vocabulary card generation process.
 * - GenerateVocabularyCardInput - The input type for the generateVocabularyCard function.
 * - GenerateVocabularyCardOutput - The return type for the generateVocabularyCard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {translateText, Translation} from '@/services/translation';

const GenerateVocabularyCardInputSchema = z.object({
  word: z.string().describe('The word to translate and generate a vocabulary card for.'),
  targetLanguage: z
    .string()
    .describe('The target language code (e.g., \'de\' for German, \'fr\' for French).'),
});

export type GenerateVocabularyCardInput = z.infer<typeof GenerateVocabularyCardInputSchema>;

const ExampleSentenceSchema = z.object({
  sentence: z.string().describe('Example sentence in the target language.'),
  translation: z.string().describe('Translation of the example sentence in English.'),
});

const GenerateVocabularyCardOutputSchema = z.object({
  word: z.string().describe('The input word.'),
  targetLanguage: z.string().describe('The target language.'),
  translation: z.string().describe('The translation of the word in English.'),
  exampleSentences: z.array(ExampleSentenceSchema).describe('Example sentences and their translations.'),
  imageUrl: z.string().describe('Data URI of the generated image.'),
});

export type GenerateVocabularyCardOutput = z.infer<typeof GenerateVocabularyCardOutputSchema>;

export async function generateVocabularyCard(input: GenerateVocabularyCardInput): Promise<GenerateVocabularyCardOutput> {
  return generateVocabularyCardFlow(input);
}

const generateExampleSentencesPrompt = ai.definePrompt({
  name: 'generateExampleSentencesPrompt',
  input: z.object({
    word: z.string(),
    targetLanguage: z.string(),
  }),
  output: z.array(z.string()),
  prompt: `You are a language teacher. Generate three example sentences using the word "{{word}}" in {{targetLanguage}}. Just return the sentences without any extra formatting or explanations.`,
});

const generateVocabularyCardFlow = ai.defineFlow(
  {
    name: 'generateVocabularyCardFlow',
    inputSchema: GenerateVocabularyCardInputSchema,
    outputSchema: GenerateVocabularyCardOutputSchema,
  },
  async input => {
    const translationResult: Translation = await translateText(input.word, 'en');
    const exampleSentences = await generateExampleSentencesPrompt(input);

    const translatedSentences = await Promise.all(
      exampleSentences.map(async sentence => {
        const translation = await translateText(sentence, 'en');
        return {sentence, translation: translation.translatedText};
      })
    );

    // Generate the image
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Generate an image that represents the word: ${input.word}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {
      word: input.word,
      targetLanguage: input.targetLanguage,
      translation: translationResult.translatedText,
      exampleSentences: translatedSentences,
      imageUrl: media.url,
    };
  }
);
