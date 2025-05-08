import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Type definities
type UserWithoutPassword = Omit<SelectUser, "password">;

type AuthContextType = {
  user: UserWithoutPassword | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Creëer de context
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Functie om de huidige gebruiker op te halen
  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      
      // Voor debugging, eerst de sessie-check aanroepen om te zien wat er in sessie zit
      const debugResponse = await fetch('/api/session-check', { 
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        }
      });
      
      const debugData = await debugResponse.json();
      console.log('Sessie-status bij startup:', debugData);
      
      // Nu de gebruiker ophalen
      const response = await fetch('/api/user', { 
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('Gebruiker ophalen status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Gebruiker succesvol opgehaald:', userData);
        setUser(userData);
      } else {
        console.log('Geen gebruiker gevonden in sessie');
        setUser(null);
      }
    } catch (err) {
      console.error('Fout bij ophalen gebruiker:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Haal de huidige gebruiker op bij het laden
  useEffect(() => {
    fetchCurrentUser();
    
    // Ping de sessie elke 5 minuten om deze actief te houden
    const interval = setInterval(() => {
      if (user) {
        fetch('/api/session-check', { credentials: 'include' })
          .catch(err => console.error('Sessie ping mislukt:', err));
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Login functie
  const login = async (username: string, password: string) => {
    try {
      console.log("Login poging voor:", username);
      setError(null);
      
      // We gebruiken een eenvoudigere aanpak zonder extra verificaties om foutbronnen te minimaliseren
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      // Controleer respons
      console.log("Login response status:", response.status);
      console.log("Login response cookies:", document.cookie);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login mislukt met foutbericht:", errorData);
        throw new Error(errorData.message || 'Inloggen mislukt');
      }
      
      const userData = await response.json();
      console.log("Login gegevens ontvangen, gebruiker:", userData);
      
      // Stel de gebruiker direct in
      setUser(userData);
      
      toast({
        title: 'Ingelogd',
        description: `Welkom terug, ${userData.username}!`,
      });
      
      console.log("Navigatie naar homepage voorbereiden...");
      
      // Een vertraging toevoegen zodat de sessie-cookie kan worden opgeslagen
      setTimeout(() => {
        console.log("Nu navigeren naar homepage...");
        // Alternatieve methode om naar de homepage te navigeren
        document.location.href = '/';
      }, 1000);
    } catch (err) {
      console.error('Login fout:', err);
      setError(err instanceof Error ? err : new Error('Onbekende fout bij inloggen'));
      toast({
        title: 'Login mislukt',
        description: err instanceof Error ? err.message : 'Onbekende fout bij inloggen',
        variant: 'destructive',
      });
    }
  };

  // Registratie functie
  const register = async (username: string, password: string) => {
    try {
      console.log("Registratie poging voor:", username);
      setError(null);
      
      // We gebruiken een eenvoudigere aanpak zonder extra verificaties
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      // Controleer respons
      console.log("Registratie response status:", response.status);
      console.log("Registratie response cookies:", document.cookie);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Registratie mislukt met foutbericht:", errorData);
        throw new Error(errorData.message || 'Registreren mislukt');
      }
      
      const userData = await response.json();
      console.log("Registratie gegevens ontvangen, gebruiker:", userData);
      
      // Stel de gebruiker direct in
      setUser(userData);
      
      toast({
        title: 'Account aangemaakt',
        description: `Welkom bij ADHD Support, ${userData.username}!`,
      });
      
      console.log("Navigatie naar homepage voorbereiden na registratie...");
      
      // Een langere vertraging voor registratie om te verzekeren dat de sessie is ingesteld
      setTimeout(() => {
        console.log("Nu navigeren naar homepage (na registratie)...");
        document.location.href = '/';
      }, 1000);
    } catch (err) {
      console.error('Registratie fout:', err);
      setError(err instanceof Error ? err : new Error('Onbekende fout bij registreren'));
      toast({
        title: 'Registratie mislukt',
        description: err instanceof Error ? err.message : 'Onbekende fout bij registreren',
        variant: 'destructive',
      });
    }
  };

  // Logout functie
  const logout = async () => {
    try {
      console.log("Uitloggen...");
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Uitloggen mislukt');
      }
      
      console.log("Logout succesvol, verwerkende status...");
      setUser(null);
      
      toast({
        title: 'Uitgelogd',
        description: 'Je bent succesvol uitgelogd.',
      });
      
      // Navigeer naar de login pagina met een korte vertraging
      setTimeout(() => {
        console.log("Navigeren naar login pagina...");
        window.location.href = '/auth';
      }, 300);
    } catch (err) {
      console.error('Logout fout:', err);
      toast({
        title: 'Uitloggen mislukt',
        description: err instanceof Error ? err.message : 'Onbekende fout bij uitloggen',
        variant: 'destructive',
      });
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook om de auth context te gebruiken
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth moet binnen een AuthProvider worden gebruikt');
  }
  return context;
}