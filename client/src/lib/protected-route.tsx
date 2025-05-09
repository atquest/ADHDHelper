import { useTokenAuth } from "@/hooks/use-token-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useTokenAuth();

  return (
    <Route path={path}>
      {isLoading ? (
        // Toont een laadscherm terwijl we controleren of de gebruiker is ingelogd
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : user ? (
        // Toont de component als de gebruiker is ingelogd
        <Component />
      ) : (
        // Stuurt door naar de inlogpagina als de gebruiker niet is ingelogd
        <Redirect to="/auth" />
      )}
    </Route>
  );
}