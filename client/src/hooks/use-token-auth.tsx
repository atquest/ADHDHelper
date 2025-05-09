import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User as SelectUser } from "@shared/schema";

// Type definities
type UserWithoutPassword = Omit<SelectUser, "password">;

// Interface voor token respons
interface TokenResponse {
  token: string;
  user: UserWithoutPassword;
}

type AuthContextType = {
  user: UserWithoutPassword | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Creëer de context
const TokenAuthContext = createContext<AuthContextType | null>(null);

// Helper functies voor lokale opslag
const getStoredAuth = () => {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  
  if (!token || !userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return { token, user };
  } catch (e) {
    console.error('Fout bij parsen van opgeslagen gebruiker:', e);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return null;
  }
};

const storeAuth = (token: string, user: UserWithoutPassword) => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

export function TokenAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Laad opgeslagen auth bij initialisatie
  useEffect(() => {
    setIsLoading(true);
    const storedAuth = getStoredAuth();
    
    if (storedAuth) {
      setUser(storedAuth.user);
      setToken(storedAuth.token);
      console.log('Gebruiker geladen uit lokale opslag:', storedAuth.user.username);
    }
    
    setIsLoading(false);
  }, []);

  // Login functie
  const login = async (username: string, password: string) => {
    try {
      console.log("Token login poging voor:", username);
      setError(null);
      
      const response = await fetch('/api/token-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      console.log("Token login response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Token login mislukt:", errorData);
        throw new Error(errorData.message || 'Inloggen mislukt');
      }
      
      const data: TokenResponse = await response.json();
      console.log("Token login succesvol, token ontvangen voor:", data.user.username);
      
      // Sla gegevens op in state en localStorage
      setUser(data.user);
      setToken(data.token);
      storeAuth(data.token, data.user);
      
      toast({
        title: 'Ingelogd',
        description: `Welkom terug, ${data.user.username}!`,
      });
      
      console.log("Token login voltooid, navigatie naar homepage...");
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err) {
      console.error('Token login fout:', err);
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
      console.log("Token registratie poging voor:", username);
      setError(null);
      
      const response = await fetch('/api/token-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      console.log("Token registratie response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Token registratie mislukt:", errorData);
        throw new Error(errorData.message || 'Registreren mislukt');
      }
      
      const data: TokenResponse = await response.json();
      console.log("Token registratie succesvol, token ontvangen voor:", data.user.username);
      
      // Sla gegevens op in state en localStorage
      setUser(data.user);
      setToken(data.token);
      storeAuth(data.token, data.user);
      
      toast({
        title: 'Account aangemaakt',
        description: `Welkom bij ADHD Support, ${data.user.username}!`,
      });
      
      console.log("Token registratie voltooid, navigatie naar homepage...");
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err) {
      console.error('Token registratie fout:', err);
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
      console.log("Token uitloggen...");
      
      if (token) {
        const response = await fetch('/api/token-logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          console.warn('Token logout API aanroep mislukt, ga door met lokaal uitloggen');
        }
      }
      
      // Verwijder token en user uit state en localStorage
      setUser(null);
      setToken(null);
      clearAuth();
      
      toast({
        title: 'Uitgelogd',
        description: 'Je bent succesvol uitgelogd.',
      });
      
      console.log("Token logout voltooid, navigatie naar login pagina...");
      setTimeout(() => {
        window.location.href = '/auth';
      }, 300);
    } catch (err) {
      console.error('Token logout fout:', err);
      
      // Zelfs bij fouten, verwijder lokale data
      setUser(null);
      setToken(null);
      clearAuth();
      
      toast({
        title: 'Uitloggen',
        description: 'Je bent uitgelogd, maar er was een probleem met de server.',
      });
      
      setTimeout(() => {
        window.location.href = '/auth';
      }, 300);
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
    <TokenAuthContext.Provider value={contextValue}>
      {children}
    </TokenAuthContext.Provider>
  );
}

// Hook om de auth context te gebruiken
export function useTokenAuth() {
  const context = useContext(TokenAuthContext);
  if (!context) {
    throw new Error('useTokenAuth moet binnen een TokenAuthProvider worden gebruikt');
  }
  return context;
}