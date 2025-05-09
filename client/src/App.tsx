import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import SymptomsPage from "@/pages/symptoms-page";
import SymptomDetailPage from "@/pages/symptom-detail-page";
import TechniquesPage from "@/pages/techniques-page";
import ProfilePage from "@/pages/profile-page";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "next-themes";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import { AuthProvider } from "./hooks/use-auth";
import { TokenAuthProvider } from "./hooks/use-token-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/symptoms" component={SymptomsPage} />
      <ProtectedRoute path="/symptoms/:id" component={SymptomDetailPage} />
      <ProtectedRoute path="/techniques" component={TechniquesPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TokenAuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Router />
            </main>
            <Footer />
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </TokenAuthProvider>
  );
}

export default App;
