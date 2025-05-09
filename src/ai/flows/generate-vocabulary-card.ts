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
  prompt: `You are a language teacher. Generate three example sentences using the word "{{word}}" in {{targetLanguage}}, and their English translations in the following order: "3 {{targetLanguage}} sentences. 3 English translations of those sentences.". Try to generate sentences with different contexts or even with different meanings of the given word if possible. Each sentence should be on a newline. Just return the sentences without any extra formatting or explanations.`,
});

// Wrapper function to extract sentences and return only the array
const generateExampleSentences = async (
  input: { word: string; targetLanguage: string }
): Promise<string[]> => {
  // Call the prompt
  const response = await generateExampleSentencesPrompt(input);

  // Extract the content from the response
  const content = response.message?.content;

  // Validate content
  if (!content) {
    console.error('No content found in response:', response);
    return [];
  }

  // Handle different content structures
  let sentences: string[];
  if (Array.isArray(content)) {
    if (Array.isArray(content[0])) {
      // Case: content is a nested array, e.g., [["sentence1", "sentence2", "sentence3"]]
      sentences = content[0].filter((item): item is string => typeof item === 'string');
    } else if (content.every((item) => typeof item === 'string')) {
      // Case: content is an array of strings, e.g., ["sentence1", "sentence2", "sentence3"]
      sentences = content as string[];
    } else {
      // Case: content is an array of objects, e.g., [{ text: "sentence1" }, { text: "sentence2" }]
      sentences = content
        .filter((item) => item && typeof item === 'object' && 'text' in item)
        .map((item: any) => item.text)
        .filter((text): text is string => typeof text === 'string');
    }
  } else {
    console.error('Content is not an array:', content);
    return [];
  }

  // Validate with Zod schema
  try {
    return z.array(z.string()).parse(sentences);
  } catch (error) {
    console.error('Sentences do not match expected schema:', sentences, error);
    return [];
  }
};


const generateVocabularyCardFlow = ai.defineFlow(
  {
    name: 'generateVocabularyCardFlow',
    inputSchema: GenerateVocabularyCardInputSchema,
    outputSchema: GenerateVocabularyCardOutputSchema,
  },
  async input => {
    const translationResult: Translation = await translateText(input.word, 'en');
    const exampleSentences = await generateExampleSentences(input);
    //console.log('Is array?', Array.isArray(exampleSentences));
    console.log('exampleSentences :', exampleSentences);

    const translatedSentences = [];
    const splitSentences = exampleSentences[0].split('\n');
    for (let i = 0; i < 3; i++) {
        const translation = splitSentences[i+3];
	translatedSentences.push({ sentence: splitSentences[i], translation: translation });
    }

    console.log('translatedSentences:', translatedSentences);

    //const {media} = await ai.generate({
    //  model: 'googleai/gemini-2.0-flash-exp',
    //  prompt: `Generate an image that represents the word: ${input.word}`,
    //  config: {
    //    responseModalities: ['TEXT', 'IMAGE'],
    //  },
    //});

    return {
      word: input.word,
      targetLanguage: input.targetLanguage,
      translation: translationResult.translatedText,
      exampleSentences: translatedSentences,
      imageUrl: "https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg",
    };
  }
);
