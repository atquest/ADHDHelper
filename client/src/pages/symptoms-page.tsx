import { useState } from "react";
import { useLocation } from "wouter";
import SymptomCard from "@/components/symptoms/symptom-card";
import { symptoms } from "@/data/adhd-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type Category = "all" | "focus" | "organization" | "impulse" | "hyperactivity" | "emotional" | "social";

export default function SymptomsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [, navigate] = useLocation();

  const filteredSymptoms = symptoms.filter((symptom) => {
    // Filter by category
    const categoryMatch = activeCategory === "all" || symptom.categoryId === activeCategory;
    
    // Filter by search query
    const searchMatch = symptom.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        symptom.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-[#6D28D9]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">ADHD Symptoms</h1>
          <p className="mt-2 text-xl text-white opacity-90">
            Information about common ADHD symptoms and how to manage them
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filter/Category Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 md:pb-0">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              <button 
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeCategory === "all" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
                onClick={() => setActiveCategory("all")}
              >
                All Symptoms
              </button>
              <button 
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeCategory === "focus" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
                onClick={() => setActiveCategory("focus")}
              >
                Focus & Concentration
              </button>
              <button 
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeCategory === "organization" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
                onClick={() => setActiveCategory("organization")}
              >
                Organization & Planning
              </button>
              <button 
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeCategory === "impulse" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
                onClick={() => setActiveCategory("impulse")}
              >
                Impulsivity
              </button>
              
              {/* More dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm">
                    More
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setActiveCategory("hyperactivity")}>
                    Hyperactivity
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveCategory("emotional")}>
                    Emotional Regulation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveCategory("social")}>
                    Social Skills
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
            
            <div className="w-full md:w-auto mt-4 md:mt-0">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search"
                  placeholder="Search symptoms..."
                  className="w-full pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Symptoms Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSymptoms.length > 0 ? (
            filteredSymptoms.map((symptom) => (
              <SymptomCard
                key={symptom.id}
                id={symptom.id}
                title={symptom.title}
                category={symptom.category}
                description={symptom.description}
                recognitionPoints={symptom.recognitionPoints}
                onClick={() => navigate(`/symptoms/${symptom.id}`)}
              />
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">No symptoms found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
