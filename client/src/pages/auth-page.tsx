import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Type voor login formulier
const loginSchema = z.object({
  username: z.string().min(1, "Gebruikersnaam is verplicht"),
  password: z.string().min(1, "Wachtwoord is verplicht"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Type voor registratie formulier
const registerSchema = z.object({
  username: z.string().min(3, "Gebruikersnaam moet minimaal 3 tekens bevatten"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten"),
  confirmPassword: z.string().min(1, "Bevestig je wachtwoord"),
  terms: z.boolean().refine(val => val === true, {
    message: "Je moet akkoord gaan met de voorwaarden",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, isLoading, login, register } = useAuth();
  const [isPendingLogin, setIsPendingLogin] = useState(false);
  const [isPendingRegister, setIsPendingRegister] = useState(false);

  // Als gebruiker al is ingelogd, doorsturen naar homepage
  useEffect(() => {
    if (user && !isLoading) {
      window.location.href = "/";
    }
  }, [user, isLoading]);

  // Login formulier
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Registratie formulier
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  // Login verwerken
  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      setIsPendingLogin(true);
      await login(values.username, values.password);
      // Na succesvol inloggen wordt redirect gedaan in useAuth
    } catch (error) {
      console.error("Login formulier fout:", error);
    } finally {
      setIsPendingLogin(false);
    }
  };

  // Registratie verwerken
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      setIsPendingRegister(true);
      await register(values.username, values.password);
      // Na succesvolle registratie wordt redirect gedaan in useAuth
    } catch (error) {
      console.error("Registratie formulier fout:", error);
    } finally {
      setIsPendingRegister(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Inloggen</TabsTrigger>
              <TabsTrigger value="register">Registreren</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Log in bij ADHD Support</CardTitle>
                <CardDescription>Voer je gegevens in om toegang te krijgen tot je account</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gebruikersnaam</FormLabel>
                          <FormControl>
                            <Input placeholder="Jouw gebruikersnaam" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wachtwoord</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Jouw wachtwoord" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">Onthoud mij</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <Button variant="link" className="p-0 h-auto text-sm">
                        Wachtwoord vergeten?
                      </Button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isPendingLogin}
                    >
                      {isPendingLogin ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Inloggen...
                        </>
                      ) : (
                        "Inloggen"
                      )}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-background text-muted-foreground">
                        Heb je nog geen account?
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-6"
                    onClick={() => setActiveTab("register")}
                  >
                    Maak een account aan
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Maak een account aan</CardTitle>
                <CardDescription>Voer je gegevens in om te registreren</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gebruikersnaam</FormLabel>
                          <FormControl>
                            <Input placeholder="Kies een gebruikersnaam" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wachtwoord</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Maak een wachtwoord" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bevestig Wachtwoord</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Bevestig je wachtwoord" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              Ik ga akkoord met de <Button variant="link" className="p-0 h-auto">voorwaarden</Button> en <Button variant="link" className="p-0 h-auto">privacy policy</Button>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isPendingRegister}
                    >
                      {isPendingRegister ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Account aanmaken...
                        </>
                      ) : (
                        "Account aanmaken"
                      )}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-background text-muted-foreground">
                        Heb je al een account?
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-6"
                    onClick={() => setActiveTab("login")}
                  >
                    Inloggen
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <div className="w-full lg:w-1/2 p-8 bg-gradient-to-r from-primary to-[#6D28D9] text-white flex items-center justify-center hidden lg:flex">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-6">Welkom bij ADHD Support</h1>
          <p className="text-xl mb-8">
            Een uitgebreid platform met informatie, technieken en tips om
            ADHD-symptomen beter te begrijpen en te beheren.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6 text-[#FBBF24]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium">Symptoom Informatie</h3>
                <p className="mt-1 text-base text-white text-opacity-80">
                  Gedetailleerde uitleg over ADHD-symptomen en hoe deze het dagelijks leven beïnvloeden.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6 text-[#FBBF24]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium">Beheertechnieken</h3>
                <p className="mt-1 text-base text-white text-opacity-80">
                  Bewezen technieken om ADHD-symptomen in verschillende situaties te beheren.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6 text-[#FBBF24]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium">Regelmatige Nuttige Tips</h3>
                <p className="mt-1 text-base text-white text-opacity-80">
                  Ontvang bruikbare tips en herinneringen om focus en organisatie te behouden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}