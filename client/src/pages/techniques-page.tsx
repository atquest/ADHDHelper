import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import TechniqueCard from "@/components/techniques/technique-card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Technique } from "@shared/schema";

type CategoryFilter = "" | "focus" | "organization" | "impulse" | "hyperactivity" | "emotional" | "social";
type DifficultyFilter = "" | "easy" | "medium" | "hard";
type SortOption = "newest" | "oldest" | "az" | "za";

export default function TechniquesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [, navigate] = useLocation();

  // Fetch techniques from API
  const { 
    data: techniques, 
    isLoading,
    error,
    refetch
  } = useQuery<Technique[]>({
    queryKey: ["/api/techniques", categoryFilter, difficultyFilter],
    queryFn: async ({ queryKey }) => {
      const categoryId = queryKey[1] as string;
      const difficulty = queryKey[2] as string;
      
      let url = '/api/techniques';
      const params = new URLSearchParams();
      
      if (categoryId) {
        params.append('categoryId', categoryId);
      }
      
      if (difficulty) {
        params.append('difficulty', difficulty);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch techniques");
      }
      return response.json();
    }
  });

  // Re-fetch when filters change
  useEffect(() => {
    refetch();
  }, [categoryFilter, difficultyFilter, refetch]);

  // Apply client-side search and sorting
  const filteredAndSortedTechniques = techniques
    ? techniques
        .filter(technique => {
          // Only apply search filter client-side since others are handled by API
          return (
            searchQuery === "" || 
            technique.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            technique.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
        .sort((a, b) => {
          // Apply sorting
          switch (sortOption) {
            case "newest":
              return b.id - a.id;
            case "oldest":
              return a.id - b.id;
            case "az":
              return a.title.localeCompare(b.title);
            case "za":
              return b.title.localeCompare(a.title);
            default:
              return 0;
          }
        })
    : [];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-[#6D28D9]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Techniques & Strategies</h1>
          <p className="mt-2 text-xl text-white opacity-90">Practical methods to manage ADHD symptoms in daily life</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-8">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search techniques..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="focus">Focus & Concentration</SelectItem>
                <SelectItem value="organization">Organization & Planning</SelectItem>
                <SelectItem value="impulse">Impulsivity</SelectItem>
                <SelectItem value="hyperactivity">Hyperactivity</SelectItem>
                <SelectItem value="emotional">Emotional Regulation</SelectItem>
                <SelectItem value="social">Social Skills</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={difficultyFilter} onValueChange={(value) => setDifficultyFilter(value as DifficultyFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Newest first" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
                <SelectItem value="za">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Techniques Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-md">
            An error occurred while loading techniques. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedTechniques.length > 0 ? (
              filteredAndSortedTechniques.map((technique) => (
                <TechniqueCard
                  key={technique.id}
                  technique={{
                    id: technique.id,
                    title: technique.title,
                    difficulty: technique.difficulty,
                    mainCategory: technique.mainCategory,
                    categoryColor: technique.categoryColor,
                    description: technique.description,
                    benefits: technique.benefits as string[],
                  }}
                  onClick={() => navigate(`/techniques/${technique.id}`)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <h3 className="text-lg font-medium mb-2">No techniques found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
