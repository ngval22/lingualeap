// src/lib/types.ts
import type { Timestamp } from 'firebase/firestore';

// Type for the output of the AI generation flow
export interface GenerateVocabularyCardOutput {
  word: string;
  targetLanguage: string;
  translation?: string; // Make optional if generation might fail
  exampleSentences?: Array<{ // Make optional
    sentence: string;
    translation: string;
  }>;
  imageUrl?: string; // Make optional
}

// Type for the Vocabulary Card document stored in Firestore
export interface VocabularyCardDocument {
  id: string; // Firestore document ID
  userId: string; // ID of the user who owns the card
  word: string;
  targetLanguage: string;
  translation?: string; // Optional from generation
  exampleSentences?: Array<{ sentence: string; translation: string }>; // Optional from generation
  imageUrl?: string; // Optional from generation
  createdAt: Date | Timestamp; // Timestamp when the card was created (can be Date or Timestamp)
  lastReviewed: Date | Timestamp | null; // Timestamp of the last review
  nextReviewDate: Date | Timestamp; // Timestamp for the next scheduled review
  interval: number; // Spaced repetition interval (in days)
  easeFactor: number; // Spaced repetition ease factor
}
