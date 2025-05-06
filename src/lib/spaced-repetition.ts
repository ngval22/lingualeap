// src/lib/spaced-repetition.ts

// Define review quality grades (similar to Anki's buttons)
// 1: Again (Incorrect response, reset interval)
// 2: Hard (Correct, but difficult)
// 3: Good (Correct, standard difficulty)
// 4: Easy (Correct, very easy)
type ReviewQuality = 1 | 2 | 3 | 4;

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

interface SpacedRepetitionResult {
  nextReviewDate: Date;
  newInterval: number; // Interval in days
  newEaseFactor: number;
}

/**
 * Calculates the next review date, interval, and ease factor based on SM-2 algorithm principles.
 * @param quality The user's rating of how well they remembered the card (1-4).
 * @param previousInterval The previous interval in days.
 * @param currentEaseFactor The current ease factor for the card.
 * @returns An object containing the new interval, new ease factor, and the next review date.
 */
export function calculateNextReview(
  quality: ReviewQuality,
  previousInterval: number,
  currentEaseFactor: number = DEFAULT_EASE_FACTOR
): SpacedRepetitionResult {
  let newInterval: number;
  let newEaseFactor = currentEaseFactor;

  // 1. Update Ease Factor based on quality
  // Formula adapted from SM-2: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Simplified approach: Adjust ease factor based on quality rating
  if (quality < 3) {
    // Incorrect or Hard: Decrease ease factor
    if (quality === 1) { // Again
       newEaseFactor = Math.max(MIN_EASE_FACTOR, currentEaseFactor - 0.20);
    } else { // Hard
        newEaseFactor = Math.max(MIN_EASE_FACTOR, currentEaseFactor - 0.14);
    }
  } else if (quality === 4) { // Easy
    // Easy: Increase ease factor
     newEaseFactor = currentEaseFactor + 0.10;
  }
   // Quality 3 (Good): Ease factor remains unchanged


  // Ensure ease factor stays within bounds
  newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor);

  // 2. Calculate New Interval
  if (quality < 3) {
    // If the answer was incorrect or hard, reset the interval.
    // Start with a short interval (e.g., 1 day or even shorter if desired).
    newInterval = 1; // Show again tomorrow
  } else {
    // If the answer was good or easy, calculate the next interval.
    if (previousInterval === 0) {
      // First successful review
      newInterval = 1;
    } else if (previousInterval === 1) {
       // Second successful review
       newInterval = 6;
    } else {
      // Subsequent reviews: Interval = Previous Interval * Ease Factor
      newInterval = Math.round(previousInterval * newEaseFactor);
    }
  }

  // Add a bit of fuzziness to intervals if desired (optional)
  // newInterval = Math.round(newInterval * (1 + Math.random() * 0.1 - 0.05));

  // Clamp interval to a maximum value if needed (e.g., 1 year)
  // newInterval = Math.min(newInterval, 365);

  // 3. Calculate Next Review Date
  const now = new Date();
  const nextReviewDate = new Date(now.setDate(now.getDate() + newInterval));

  return {
    nextReviewDate,
    newInterval,
    newEaseFactor,
  };
}
