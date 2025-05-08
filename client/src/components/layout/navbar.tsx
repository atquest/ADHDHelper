import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Searching for: ${searchQuery}`);
    setIsSearchOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // logout functie handelt al de redirect naar /auth
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span 
                className="font-bold text-xl text-primary cursor-pointer"
                onClick={() => navigate("/")}
              >
                ADHD Support
              </span>
            </div>
            
            {/* Navigation Links - Desktop */}
            {user && (
              <div className="hidden sm:ml-6 sm:flex space-x-8">
                <Button
                  asChild
                  variant="link"
                  className={cn(
                    "text-sm font-medium px-1 py-2 border-b-2",
                    isActive("/") 
                      ? "text-primary border-primary" 
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground"
                  )}
                >
                  <a href="/">Dashboard</a>
                </Button>
                
                <Button
                  asChild
                  variant="link"
                  className={cn(
                    "text-sm font-medium px-1 py-2 border-b-2",
                    isActive("/symptoms") || location.startsWith("/symptoms/")
                      ? "text-primary border-primary" 
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground"
                  )}
                >
                  <a href="/symptoms">Symptoms</a>
                </Button>
                
                <Button
                  asChild
                  variant="link"
                  className={cn(
                    "text-sm font-medium px-1 py-2 border-b-2",
                    isActive("/techniques") 
                      ? "text-primary border-primary" 
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground"
                  )}
                >
                  <a href="/techniques">Techniques</a>
                </Button>
                
                <Button
                  asChild
                  variant="link"
                  className={cn(
                    "text-sm font-medium px-1 py-2 border-b-2",
                    isActive("/profile") 
                      ? "text-primary border-primary" 
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground"
                  )}
                >
                  <a href="/profile">My Profile</a>
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {/* Search Box - Desktop */}
            {user && (
              <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search"
                    placeholder="Search..." 
                    className="bg-muted/40 w-60 pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>
            )}
            
            {/* User Menu - When Logged In */}
            {user ? (
              <div className="ml-4 relative flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.username}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate("/auth")}
                >
                  Register
                </Button>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            {user && (
              <div className="flex items-center sm:hidden ml-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>ADHD Support</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      <form onSubmit={handleSearch} className="relative mb-6">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="search"
                          placeholder="Search..." 
                          className="bg-muted/40 w-full pl-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </form>
                      <div className="space-y-3">
                        <Button
                          asChild
                          variant="ghost"
                          className={cn(
                            "w-full justify-start",
                            isActive("/") && "bg-muted"
                          )}
                        >
                          <a href="/">Dashboard</a>
                        </Button>
                        
                        <Button
                          asChild
                          variant="ghost"
                          className={cn(
                            "w-full justify-start",
                            (isActive("/symptoms") || location.startsWith("/symptoms/")) && "bg-muted"
                          )}
                        >
                          <a href="/symptoms">Symptoms</a>
                        </Button>
                        
                        <Button
                          asChild
                          variant="ghost"
                          className={cn(
                            "w-full justify-start",
                            isActive("/techniques") && "bg-muted"
                          )}
                        >
                          <a href="/techniques">Techniques</a>
                        </Button>
                        
                        <Button
                          asChild
                          variant="ghost"
                          className={cn(
                            "w-full justify-start",
                            isActive("/profile") && "bg-muted"
                          )}
                        >
                          <a href="/profile">My Profile</a>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}