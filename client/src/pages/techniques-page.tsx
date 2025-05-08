import { useState } from "react";
import { useLocation } from "wouter";
import TechniqueCard from "@/components/techniques/technique-card";
import { techniques } from "@/data/adhd-data";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type CategoryFilter = "" | "focus" | "organization" | "impulse" | "hyperactivity" | "emotional" | "social";
type DifficultyFilter = "" | "easy" | "medium" | "hard";
type SortOption = "newest" | "oldest" | "az" | "za";

export default function TechniquesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [, navigate] = useLocation();

  const filteredAndSortedTechniques = techniques
    .filter(technique => {
      // Apply category filter
      const categoryMatch = categoryFilter === "" || technique.categories.includes(categoryFilter);
      
      // Apply difficulty filter
      const difficultyMatch = difficultyFilter === "" || technique.difficulty === difficultyFilter;
      
      // Apply search query
      const searchMatch = technique.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          technique.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && difficultyMatch && searchMatch;
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
    });

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedTechniques.length > 0 ? (
            filteredAndSortedTechniques.map((technique) => (
              <TechniqueCard
                key={technique.id}
                technique={technique}
                onClick={() => navigate(`/symptoms/${technique.relatedSymptoms[0]}`)}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <h3 className="text-lg font-medium mb-2">No techniques found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
