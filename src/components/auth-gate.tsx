// src/components/auth-gate.tsx
'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signUpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'], // Path to field to display the error
});


export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = React.useState('');
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);


  // Persist auth state locally
  React.useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
  }, []);

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      console.error("Error signing in with Google: ", error);
      toast({
        title: 'Google Login Failed',
        description: error.message || 'An error occurred during Google sign in.',
        variant: 'destructive',
      });
    }
  };

  const handleEmailSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsEmailLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      signInForm.reset();
    } catch (error: any) {
      console.error("Error signing in with email: ", error);
      toast({
        title: 'Email Login Failed',
        description: error.message || 'Incorrect email or password.',
        variant: 'destructive',
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleEmailSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setIsEmailLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Sign Up Successful',
        description: 'Welcome to LinguaLeap! You are now logged in.',
      });
      signUpForm.reset();
    } catch (error: any) {
      console.error("Error signing up with email: ", error);
      toast({
        title: 'Sign Up Failed',
        description: error.message || 'An error occurred during sign up.',
        variant: 'destructive',
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!forgotPasswordEmail) {
        toast({ title: 'Email required', description: 'Please enter your email address.', variant: 'destructive'});
        return;
    }
    setIsEmailLoading(true);
    try {
        await sendPasswordResetEmail(auth, forgotPasswordEmail);
        toast({
            title: 'Password Reset Email Sent',
            description: 'Check your inbox for instructions to reset your password.',
        });
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
    } catch (error: any) {
        console.error("Error sending password reset email: ", error);
        toast({
            title: 'Password Reset Failed',
            description: error.message || 'Could not send password reset email.',
            variant: 'destructive',
        });
    } finally {
        setIsEmailLoading(false);
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
       <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-background to-secondary p-4 sm:p-8">
         <div className="text-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-3 sm:mb-4">
                 <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
                 <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.133 2.845a.75.75 0 011.06 0l1.72 1.72 1.72-1.72a.75.75 0 111.06 1.06l-1.72 1.72 1.72 1.72a.75.75 0 11-1.06 1.06L12 15.685l-1.72 1.72a.75.75 0 11-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
           <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-1 sm:mb-2">Welcome to LinguaLeap</h1>
           <p className="text-md sm:text-lg text-muted-foreground">Your AI-powered vocabulary builder.</p>
         </div>

         <Card className="w-full max-w-md shadow-xl rounded-lg">
            <CardContent className="p-6">
              {showForgotPassword ? (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-center">Reset Password</h2>
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div>
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        disabled={isEmailLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isEmailLoading}>
                      {isEmailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Email'}
                    </Button>
                  </form>
                  <Button variant="link" onClick={() => setShowForgotPassword(false)} className="mt-2 w-full text-primary">
                    Back to Sign In
                  </Button>
                </>
              ) : (
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin">
                    <Form {...signInForm}>
                      <form onSubmit={signInForm.handleSubmit(handleEmailSignIn)} className="space-y-4 mt-4">
                        <FormField
                          control={signInForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="m@example.com" {...field} disabled={isEmailLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signInForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} disabled={isEmailLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isEmailLoading}>
                          {isEmailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
                        </Button>
                      </form>
                    </Form>
                    <Button variant="link" onClick={() => setShowForgotPassword(true)} className="mt-2 text-sm text-primary w-full">
                      Forgot password?
                    </Button>
                  </TabsContent>
                  <TabsContent value="signup">
                     <Form {...signUpForm}>
                      <form onSubmit={signUpForm.handleSubmit(handleEmailSignUp)} className="space-y-4 mt-4">
                        <FormField
                          control={signUpForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="m@example.com" {...field} disabled={isEmailLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signUpForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} disabled={isEmailLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signUpForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} disabled={isEmailLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isEmailLoading}>
                          {isEmailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              )}

              {!showForgotPassword && (
                <>
                    <Separator className="my-6" />
                    <Button onClick={handleGoogleSignIn} variant="outline" className="w-full py-3 text-md">
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691c-1.464 2.828-2.306 6.01-2.306 9.309s.842 6.481 2.306 9.309l-5.657 5.657C1.047 34.046 0 29.268 0 24s1.047-10.046 2.649-14.97L8.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083L48 17.419C47.011 14.597 45.206 12.093 42.803 10.118l-5.491 6.861C40.022 17.697 42.171 18.25 43.611 20.083z"/></svg>
                        Sign In with Google
                    </Button>
                </>
              )}
            </CardContent>
         </Card>
         <p className="text-center text-muted-foreground mt-6 text-sm">
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
                      <p className="text-sm font-medium leading-none">{user.displayName ?? user.email ?? "User"}</p>
                      {user.displayName && user.email && <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>}
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
