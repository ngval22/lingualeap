'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateVocabularyCard, type GenerateVocabularyCardOutput } from '@/ai/flows/generate-vocabulary-card';
import { VocabularyCardDisplay } from './vocabulary-card-display'; // Import the new component
import { saveVocabularyCard } from '@/lib/firebase/firestore'; // Import Firestore save function
import { useAuth } from '@/hooks/use-auth'; // Import useAuth hook

const supportedLanguages = [
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
];

const formSchema = z.object({
  word: z.string().min(1, { message: 'Please enter a word.' }),
  targetLanguage: z.string().min(1, { message: 'Please select a language.' }),
});

export function AddWordForm() {
  const { toast } = useToast();
  const { user } = useAuth(); // Get the current user
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedCard, setGeneratedCard] = React.useState<GenerateVocabularyCardOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: '',
      targetLanguage: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add words.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedCard(null); // Clear previous card
    console.log('Submitting form with values:', values);

    try {
      const result = await generateVocabularyCard({
        word: values.word,
        targetLanguage: values.targetLanguage,
      });
      console.log('AI Generation Result:', result);
      setGeneratedCard(result);

      // Save the card to Firestore
      try {
          await saveVocabularyCard(user.uid, result);
          toast({
            title: 'Success!',
            description: `Vocabulary card for "${result.word}" saved.`,
          });
          form.reset(); // Reset form after successful save
      } catch (error) {
          console.error('Error saving card to Firestore:', error);
          toast({
              title: 'Save Error',
              description: 'Failed to save the vocabulary card. Please try again.',
              variant: 'destructive',
          });
      }

    } catch (error) {
      console.error('Error generating vocabulary card:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate vocabulary card. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-lg mx-auto shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">Enter a Word</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="word"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Word</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Haus, maison, casa" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {supportedLanguages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Card'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {generatedCard && (
        <div className="mt-6">
           <VocabularyCardDisplay card={generatedCard} />
        </div>
      )}
    </div>
  );
}
