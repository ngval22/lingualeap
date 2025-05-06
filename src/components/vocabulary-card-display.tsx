'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { GenerateVocabularyCardOutput, VocabularyCardDocument } from '@/lib/types'; // Assuming types are consolidated
import { cn } from '@/lib/utils';

interface VocabularyCardDisplayProps {
  card: GenerateVocabularyCardOutput | VocabularyCardDocument;
  isReviewMode?: boolean; // Optional prop for styling in review mode
}

export function VocabularyCardDisplay({ card, isReviewMode = false }: VocabularyCardDisplayProps) {
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  // Handle potential differences between generated and stored cards
  const displayCard = {
    word: card.word,
    targetLanguage: card.targetLanguage,
    translation: 'translation' in card ? card.translation : `Translated: ${card.word}`, // Basic fallback
    exampleSentences: card.exampleSentences || [], // Ensure array
    imageUrl: card.imageUrl || 'https://picsum.photos/300/200?random='+card.word, // Fallback image URL
  };

  const cardClasses = cn(
    "w-full h-full shadow-lg rounded-lg flex flex-col",
    isReviewMode ? "bg-card border-2 border-primary" : "bg-card", // Highlight border in review mode
     "cursor-pointer" // Add cursor pointer for flipping
  );

  return (
    <Card className={cardClasses}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
             <CardTitle className="text-2xl font-semibold">{displayCard.word}</CardTitle>
             <p className="text-sm text-muted-foreground">{displayCard.translation}</p>
          </div>
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
            {displayCard.targetLanguage.toUpperCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Example Sentences:</h4>
          {displayCard.exampleSentences.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {displayCard.exampleSentences.map((ex, index) => (
                <li key={index}>
                  <p>{ex.sentence}</p>
                  <p className="text-muted-foreground italic text-xs">({ex.translation})</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No example sentences available.</p>
          )}
        </div>
        <Separator orientation="vertical" className="hidden md:block h-auto mx-4" />
         <Separator orientation="horizontal" className="block md:hidden my-4" />
        <div className="w-full md:w-1/3 flex justify-center items-center">
          {imageLoading && !imageError && <Skeleton className="h-32 w-full rounded-md" />}
          {imageError && (
              <div className="h-32 w-full rounded-md bg-muted flex flex-col items-center justify-center text-center p-2">
                 <p className="text-xs text-muted-foreground">Image failed to load.</p>
                 <p className="text-xs text-muted-foreground">Using placeholder.</p>
              </div>
          )}
          <Image
            src={displayCard.imageUrl}
            alt={`AI generated image for ${displayCard.word}`}
            width={300}
            height={200}
            className={`rounded-md object-cover ${imageLoading || imageError ? 'hidden' : 'block'}`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
            unoptimized={displayCard.imageUrl?.startsWith('data:')} // Avoid optimization for data URIs
            data-ai-hint={`word image ${displayCard.word}`}
          />
        </div>
      </CardContent>
       {isReviewMode && (
          <CardFooter className="p-2 text-center">
             <p className="text-xs text-muted-foreground w-full">Click card to see the word</p>
          </CardFooter>
       )}
    </Card>
  );
}
