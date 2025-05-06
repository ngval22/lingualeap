# LinguaLeap - AI Vocabulary Builder

This is a Next.js application built with Firebase Studio, designed to help users build vocabulary using AI and spaced repetition.

## Features

- **AI-Powered Card Generation:** Enter a word, choose a language (German, French, Spanish), and get a translation, example sentences, and a relevant AI-generated image.
- **Vocabulary Deck:** Save generated cards to your personal deck stored in Firebase Firestore.
- **Spaced Repetition Review:** Review your cards using an algorithm inspired by Anki to optimize learning. Cards you know well appear less frequently, while challenging cards show up sooner.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add your Firebase project configuration:
    ```.env.local
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

    # Add your Genkit/Google AI API Key if needed for AI features
    GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY
    ```
    Replace `YOUR_*` placeholders with your actual Firebase and AI credentials.

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    This command starts the Next.js development server (usually on `http://localhost:9002`).

4.  **Run Genkit Development Server (for AI flows):**
    In a separate terminal, run:
    ```bash
    npm run genkit:watch
    ```
    This starts the Genkit development server, allowing your AI flows to run locally.

## Project Structure

-   `src/app/`: Contains the main application pages and layouts (using Next.js App Router).
-   `src/components/`: Reusable React components.
    -   `ui/`: UI components from ShadCN.
-   `src/lib/`: Utility functions, Firebase configuration, type definitions, and the spaced repetition algorithm.
    -   `firebase/`: Firebase setup and Firestore interaction functions.
    -   `types.ts`: TypeScript type definitions.
    -   `spaced-repetition.ts`: Spaced repetition logic.
-   `src/hooks/`: Custom React hooks (e.g., `useAuth`, `useToast`).
-   `src/ai/`: Genkit AI flow definitions.
    - `flows/`: Specific AI flows like card generation and session summarization.
-   `public/`: Static assets.
-   `styles/`: Global CSS styles.

## Key Technologies

-   [Next.js](https://nextjs.org/) (React Framework)
-   [Tailwind CSS](https://tailwindcss.com/) (Styling)
-   [ShadCN/UI](https://ui.shadcn.com/) (UI Components)
-   [Firebase](https://firebase.google.com/) (Authentication, Firestore Database)
-   [Genkit](https://firebase.google.com/docs/genkit) (AI Flow Orchestration)
-   [TypeScript](https://www.typescriptlang.org/)

## Deployment

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) and [Firebase Hosting documentation](https://firebase.google.com/docs/hosting) for deployment options.

      