// src/lib/firebase/firestore.ts
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import type { GenerateVocabularyCardOutput, VocabularyCardDocument } from '@/lib/types';

const VOCAB_COLLECTION = 'vocabularyCards';

/**
 * Saves a newly generated vocabulary card to Firestore for a specific user.
 * Initializes spaced repetition fields.
 */
export async function saveVocabularyCard(userId: string, cardData: GenerateVocabularyCardOutput): Promise<string> {
  try {
    const now = new Date();
    const cardToSave = {
      ...cardData,
      userId: userId,
      createdAt: Timestamp.fromDate(now),
      lastReviewed: null,
      nextReviewDate: Timestamp.fromDate(now), // Due for review immediately
      interval: 0, // Initial interval
      easeFactor: 2.5, // Standard starting ease factor
    };
    const docRef = await addDoc(collection(db, VOCAB_COLLECTION), cardToSave);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to save vocabulary card.");
  }
}

/**
 * Retrieves all vocabulary cards for a specific user.
 */
export async function getUserVocabularyCards(userId: string): Promise<VocabularyCardDocument[]> {
  const cards: VocabularyCardDocument[] = [];
  const q = query(collection(db, VOCAB_COLLECTION), where("userId", "==", userId), orderBy("createdAt", "desc"));

  try {
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      cards.push({
        id: doc.id,
        ...data,
        // Convert Timestamps back to Dates
        createdAt: (data.createdAt as Timestamp)?.toDate(),
        lastReviewed: (data.lastReviewed as Timestamp)?.toDate() || null,
        nextReviewDate: (data.nextReviewDate as Timestamp)?.toDate(),
      } as VocabularyCardDocument); // Ensure type assertion matches all fields
    });
    return cards;
  } catch (error) {
    console.error("Error getting documents: ", error);
    throw new Error("Failed to retrieve vocabulary cards.");
  }
}


/**
 * Retrieves vocabulary cards that are due for review for a specific user.
 * A card is due if its nextReviewDate is in the past or is today.
 */
export async function getDueVocabularyCards(userId: string): Promise<VocabularyCardDocument[]> {
    const cards: VocabularyCardDocument[] = [];
    const now = Timestamp.now();
     // Order by nextReviewDate to review oldest due cards first
    const q = query(
        collection(db, VOCAB_COLLECTION),
        where("userId", "==", userId),
        where("nextReviewDate", "<=", now),
        orderBy("nextReviewDate", "asc")
    );

    try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
        const data = doc.data();
        cards.push({
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate(),
            lastReviewed: (data.lastReviewed as Timestamp)?.toDate() || null,
            nextReviewDate: (data.nextReviewDate as Timestamp).toDate(),
        } as VocabularyCardDocument);
        });
        return cards;
    } catch (error) {
        console.error("Error getting due documents: ", error);
        throw new Error("Failed to retrieve due vocabulary cards.");
    }
}


/**
 * Updates the review status (lastReviewed, nextReviewDate, interval, easeFactor)
 * of a specific vocabulary card.
 */
export async function updateCardReview(
  userId: string,
  cardId: string,
  reviewData: {
    nextReviewDate: Date;
    interval: number;
    easeFactor: number;
    lastReviewed: Date;
  }
): Promise<void> {
  const cardRef = doc(db, VOCAB_COLLECTION, cardId);
  // Ensure the card belongs to the user before updating (optional but good practice)
  // You might fetch the card first to verify userId if needed.

  try {
    await updateDoc(cardRef, {
      lastReviewed: Timestamp.fromDate(reviewData.lastReviewed),
      nextReviewDate: Timestamp.fromDate(reviewData.nextReviewDate),
      interval: reviewData.interval,
      easeFactor: reviewData.easeFactor,
    });
  } catch (error) {
    console.error("Error updating document: ", error);
    throw new Error("Failed to update card review status.");
  }
}

/**
 * Deletes a specific vocabulary card from Firestore.
 */
export async function deleteVocabularyCard(userId: string, cardId: string): Promise<void> {
    const cardRef = doc(db, VOCAB_COLLECTION, cardId);
    // Optional: Verify ownership before deleting
    // const cardSnap = await getDoc(cardRef);
    // if (!cardSnap.exists() || cardSnap.data().userId !== userId) {
    //     throw new Error("Card not found or permission denied.");
    // }

    try {
        await deleteDoc(cardRef);
        console.log(`Document with ID ${cardId} deleted successfully.`);
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw new Error("Failed to delete vocabulary card.");
    }
}
