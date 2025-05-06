'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserVocabularyCards, deleteVocabularyCard } from '@/lib/firebase/firestore';
import type { VocabularyCardDocument } from '@/lib/types';
import { VocabularyCardDisplay } from './vocabulary-card-display';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export function VocabularyDeck() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = React.useState<VocabularyCardDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchCards();
  }, [user]);

  const fetchCards = async () => {
    if (!user) {
      setError("Please log in to view your deck.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const userCards = await getUserVocabularyCards(user.uid);
      setCards(userCards);
    } catch (err) {
      console.error("Error fetching vocabulary cards:", err);
      setError("Failed to load your vocabulary deck. Please try again later.");
       toast({
         title: 'Error',
         description: 'Could not fetch your vocabulary deck.',
         variant: 'destructive',
       });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    if (!user) return;
    try {
        await deleteVocabularyCard(user.uid, cardId);
        setCards(prevCards => prevCards.filter(card => card.id !== cardId));
        toast({
            title: 'Card Deleted',
            description: 'The vocabulary card has been successfully deleted.',
        });
    } catch (err) {
        console.error("Error deleting card:", err);
        toast({
            title: 'Error',
            description: 'Failed to delete the card. Please try again.',
            variant: 'destructive',
        });
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your deck...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (cards.length === 0) {
    return <p className="text-center text-muted-foreground">Your vocabulary deck is empty. Start by adding some words!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div key={card.id} className="relative group">
           <VocabularyCardDisplay card={card} />
           <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded-full h-8 w-8"
                        aria-label="Delete card"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the vocabulary card for "{card.word}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(card.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      ))}
    </div>
  );
}
