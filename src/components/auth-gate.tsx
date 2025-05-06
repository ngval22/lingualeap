// src/components/auth-gate.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signOut, UserCredential, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // Persist auth state locally
  React.useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      console.error("Error signing in: ", error);
      toast({
        title: 'Login Failed',
        description: error.message || 'An error occurred during sign in.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error: any) {
      console.error("Error signing out: ", error);
      toast({
        title: 'Logout Failed',
        description: error.message || 'An error occurred during sign out.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
       <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-background to-secondary p-8">
         <div className="text-center mb-12">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-primary mx-auto mb-4">
                 <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
                 <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.133 2.845a.75.75 0 011.06 0l1.72 1.72 1.72-1.72a.75.75 0 111.06 1.06l-1.72 1.72 1.72 1.72a.75.75 0 11-1.06 1.06L12 15.685l-1.72 1.72a.75.75 0 11-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
               </svg>
           <h1 className="text-4xl font-bold text-primary mb-2">Welcome to LinguaLeap</h1>
           <p className="text-lg text-muted-foreground">Your AI-powered vocabulary builder.</p>
         </div>
         <div className="bg-card p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-2xl font-semibold mb-6">Please Sign In</h2>
            <p className="text-muted-foreground mb-6">Sign in with Google to continue.</p>
           <Button onClick={handleSignIn} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg">
             <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691c-1.464 2.828-2.306 6.01-2.306 9.309s.842 6.481 2.306 9.309l-5.657 5.657C1.047 34.046 0 29.268 0 24s1.047-10.046 2.649-14.97L8.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083L48 17.419C47.011 14.597 45.206 12.093 42.803 10.118l-5.491 6.861C40.022 17.697 42.171 18.25 43.611 20.083z"/></svg>
             Sign In with Google
           </Button>
         </div>
         <p className="text-center text-muted-foreground mt-8 text-sm">
             Build your vocabulary faster with AI and spaced repetition.
           </p>
       </div>
    );
  }

  return (
      <div className="relative">
           <div className="absolute top-4 right-4 z-50">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                     <Avatar className="h-10 w-10 border border-primary/50">
                       <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
                       <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                     </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName ?? "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
           </div>
        {children}
      </div>
    );
}
