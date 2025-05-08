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
      const response = await fetch('/api/user', { 
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
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
      setError(null);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Inloggen mislukt');
      }
      
      const userData = await response.json();
      setUser(userData);
      
      toast({
        title: 'Ingelogd',
        description: `Welkom terug, ${userData.username}!`,
      });
      
      // Navigeer naar de homepage
      window.location.href = '/';
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
      setError(null);
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registreren mislukt');
      }
      
      const userData = await response.json();
      setUser(userData);
      
      toast({
        title: 'Account aangemaakt',
        description: `Welkom bij ADHD Support, ${userData.username}!`,
      });
      
      // Navigeer naar de homepage
      window.location.href = '/';
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
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Uitloggen mislukt');
      }
      
      setUser(null);
      
      toast({
        title: 'Uitgelogd',
        description: 'Je bent succesvol uitgelogd.',
      });
      
      // Navigeer naar de login pagina
      window.location.href = '/auth';
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