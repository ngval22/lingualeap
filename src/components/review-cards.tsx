'use client';

import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VocabularyCardDisplay } from './vocabulary-card-display';
import { getDueVocabularyCards, updateCardReview } from '@/lib/firebase/firestore';
import type { VocabularyCardDocument } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { calculateNextReview } from '@/lib/spaced-repetition';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeReviewSession, SummarizeReviewSessionInput } from '@/ai/flows/summarize-review-session';

enum ReviewDifficulty {
  Again = 1, // Show again soon
  Hard = 2, // Show with moderate delay
  Good = 3, // Show with standard delay
  Easy = 4, // Show with longer delay
}

export function ReviewCards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dueCards, setDueCards] = React.useState<VocabularyCardDocument[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [sessionFinished, setSessionFinished] = React.useState(false);
  const [struggledWords, setStruggledWords] = React.useState<string[]>([]);
  const [totalReviewedCount, setTotalReviewedCount] = React.useState(0);
  const [sessionSummary, setSessionSummary] = React.useState<string | null>(null);
   const [isSummarizing, setIsSummarizing] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      fetchDueCards();
    } else {
      setIsLoading(false); // No user, stop loading
    }
  }, [user]);

  const fetchDueCards = async () => {
    if (!user) return;
    setIsLoading(true);
    setSessionFinished(false);
    setSessionSummary(null);
    setStruggledWords([]);
    setTotalReviewedCount(0);
    try {
      const cards = await getDueVocabularyCards(user.uid);
      setDueCards(cards);
      setCurrentCardIndex(0);
      setIsFlipped(false); // Start with card front
    } catch (error) {
      console.error('Error fetching due cards:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch review cards.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (difficulty: ReviewDifficulty) => {
    if (!user || currentCardIndex >= dueCards.length) return;

    const currentCard = dueCards[currentCardIndex];
    const { nextReviewDate, newInterval, newEaseFactor } = calculateNextReview(
      difficulty,
      currentCard.interval ?? 0,
      currentCard.easeFactor ?? 2.5 // Default ease factor
    );

    if (difficulty === ReviewDifficulty.Again || difficulty === ReviewDifficulty.Hard) {
        setStruggledWords(prev => [...prev, currentCard.word]);
    }

    try {
      await updateCardReview(user.uid, currentCard.id, {
        nextReviewDate,
        interval: newInterval,
        easeFactor: newEaseFactor,
        lastReviewed: new Date(),
      });

      // Move to the next card
      const nextIndex = currentCardIndex + 1;
      setTotalReviewedCount(prev => prev + 1);
      if (nextIndex < dueCards.length) {
        setCurrentCardIndex(nextIndex);
        setIsFlipped(false); // Show front of next card
      } else {
        // Session finished
        setSessionFinished(true);
        generateSessionSummary();
      }
    } catch (error) {
      console.error('Error updating card review:', error);
      toast({
        title: 'Error',
        description: 'Could not update card review status.',
        variant: 'destructive',
      });
    }
  };

  const generateSessionSummary = async () => {
    if (!user) return;
    setIsSummarizing(true);
    try {
        const input: SummarizeReviewSessionInput = {
            wordsStruggledWith: struggledWords,
            totalWordsReviewed: totalReviewedCount,
        };
        const result = await summarizeReviewSession(input);
        setSessionSummary(result.summary);
    } catch(error) {
        console.error("Error generating session summary:", error);
        toast({
            title: "Summary Error",
            description: "Could not generate the session summary.",
            variant: "destructive",
        });
    } finally {
        setIsSummarizing(false);
    }
  }

  const currentCard = dueCards[currentCardIndex];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading review cards...</span>
      </div>
    );
  }

  if (sessionFinished) {
      return (
          <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
              <CardHeader>
                  <CardTitle className="text-center text-xl">Review Session Complete!</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                  <p>You have reviewed all due cards for this session.</p>
                  {isSummarizing && (
                     <div className="flex justify-center items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                        <span>Generating summary...</span>
                    </div>
                  )}
                  {sessionSummary && (
                      <div className="p-4 bg-secondary rounded-md text-left">
                          <h3 className="font-semibold mb-2">Session Summary:</h3>
                          <p>{sessionSummary}</p>
                      </div>
                  )}
                  <Button onClick={fetchDueCards} className="bg-primary hover:bg-primary/90 text-primary-foreground">Start New Session</Button>
              </CardContent>
          </Card>
      )
  }


  if (dueCards.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg rounded-lg">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No cards due for review right now. Well done!</p>
           <Button onClick={fetchDueCards} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">Check Again</Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="flex flex-col items-center space-y-6">
       <p className="text-sm text-muted-foreground">Card {currentCardIndex + 1} of {dueCards.length}</p>
      <div className="w-full max-w-2xl perspective">
        <div
           className={`relative w-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
           style={{ minHeight: '300px' }} // Ensure minimum height during flip
           onClick={() => setIsFlipped(!isFlipped)} // Flip on click
        >
           {/* Front of the card */}
          <div className="absolute w-full h-full backface-hidden">
             <Card className="w-full h-full shadow-lg rounded-lg flex flex-col justify-center items-center cursor-pointer">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold">{currentCard.word}</p>
                   <p className="text-sm text-muted-foreground mt-2">({currentCard.targetLanguage})</p>
                </CardContent>
             </Card>
          </div>

           {/* Back of the card */}
           <div className="absolute w-full h-full backface-hidden rotate-y-180">
             <VocabularyCardDisplay card={currentCard} isReviewMode={true}/>
           </div>
        </div>
      </div>


      {/* Review Buttons - Only show after flip */}
      {isFlipped && (
         <CardFooter className="flex justify-around w-full max-w-2xl pt-4">
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleReview(ReviewDifficulty.Again)}
          >
            Again (soon)
          </Button>
          <Button
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
            onClick={() => handleReview(ReviewDifficulty.Hard)}
          >
            Hard
          </Button>
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => handleReview(ReviewDifficulty.Good)}
          >
            Good
          </Button>
           <Button
             variant="outline"
             className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
             onClick={() => handleReview(ReviewDifficulty.Easy)}
           >
             Easy
           </Button>
         </CardFooter>
      )}
       {!isFlipped && (
         <CardFooter className="flex justify-center w-full max-w-2xl pt-4">
            <Button onClick={() => setIsFlipped(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">Show Answer</Button>
         </CardFooter>
       )}
    </div>
  );
}

// Add perspective and transform styles to globals.css or use Tailwind JIT features if configured
// e.g., in globals.css:
/*
.perspective { perspective: 1000px; }
.transform-style-preserve-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }
*/

// Ensure these utility classes are available or define them.
// If using Tailwind JIT, these might work out of the box.
// Otherwise, add them to your globals.css.
