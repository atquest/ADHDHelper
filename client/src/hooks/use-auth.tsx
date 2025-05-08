import { createContext, ReactNode, useContext, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

// Create a default context value to prevent the "useAuth must be used within an AuthProvider" error
const defaultContextValue: AuthContextType = {
  user: null,
  isLoading: false,
  error: null,
  loginMutation: {
    mutate: () => {},
    mutateAsync: async () => { throw new Error("Not implemented"); },
    isPending: false,
    isError: false,
    isSuccess: false,
    isIdle: true,
    error: null,
    data: undefined,
    failureCount: 0,
    failureReason: null,
    status: "idle",
    reset: () => {},
    variables: undefined,
  } as any,
  logoutMutation: {
    mutate: () => {},
    mutateAsync: async () => { throw new Error("Not implemented"); },
    isPending: false,
    isError: false,
    isSuccess: false,
    isIdle: true,
    error: null,
    data: undefined,
    failureCount: 0,
    failureReason: null,
    status: "idle",
    reset: () => {},
    variables: undefined,
  } as any,
  registerMutation: {
    mutate: () => {},
    mutateAsync: async () => { throw new Error("Not implemented"); },
    isPending: false,
    isError: false,
    isSuccess: false,
    isIdle: true,
    error: null,
    data: undefined,
    failureCount: 0,
    failureReason: null,
    status: "idle",
    reset: () => {},
    variables: undefined,
  } as any,
};

export const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes to keep session alive
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      refetch(); // Explicitly refetch to ensure we get the latest data
      
      // Programmatically navigate to homepage after successful login
      window.location.href = "/";
      
      toast({
        title: "Ingelogd",
        description: `Welkom terug, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      refetch(); // Explicitly refetch to ensure we get the latest data
      
      // Programmatically navigate to homepage after successful registration
      window.location.href = "/";
      
      toast({
        title: "Account aangemaakt",
        description: `Welkom bij ADHD Support, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registratie mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Uitgelogd",
        description: "Je bent succesvol uitgelogd.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Uitloggen mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
