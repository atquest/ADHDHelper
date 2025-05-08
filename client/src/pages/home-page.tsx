import { useAuth } from "@/hooks/use-auth";
import CategoryCard from "@/components/dashboard/category-card";
import RecentTipCard from "@/components/dashboard/recent-tip-card";
import { useQuery } from "@tanstack/react-query";
import { 
  BrainCircuit, 
  ListTodo, 
  Zap, 
  RefreshCw, 
  HeartPulse, 
  Users,
  Loader2
} from "lucide-react";
import { type Category, type Technique } from "@shared/schema";

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  "focus": BrainCircuit,
  "organization": ListTodo,
  "impulse": Zap,
  "hyperactivity": RefreshCw,
  "emotional": HeartPulse,
  "social": Users
};

export default function HomePage() {
  const { user } = useAuth();

  // Fetch categories
  const { 
    data: categories, 
    isLoading: isLoadingCategories, 
    error: categoriesError 
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch recent tips
  const { 
    data: recentTips,
    isLoading: isLoadingTips,
    error: tipsError
  } = useQuery<any[]>({
    queryKey: ["/api/recent-tips"],
  });

  const isLoading = isLoadingCategories || isLoadingTips;
  const hasError = categoriesError || tipsError;

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-[#6D28D9]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Welcome to ADHD Support</h1>
          <p className="mt-2 text-xl text-white opacity-90">
            Discover information, techniques and tips to live with ADHD
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Categories Section */}
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-semibold mb-6">Categories</h2>
          
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : categoriesError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              An error occurred while loading categories. Please try again later.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories?.map((category) => (
                <CategoryCard 
                  key={category.id}
                  id={category.id}
                  title={category.title}
                  description={category.description}
                  icon={categoryIcons[category.id] || BrainCircuit}
                  color={category.color}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Tips Section */}
        <div className="mt-8 px-4 sm:px-0">
          <h2 className="text-2xl font-semibold mb-6">Recently Added Tips</h2>
          
          {isLoadingTips ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : tipsError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              An error occurred while loading recent tips. Please try again later.
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {recentTips && recentTips.length > 0 ? (
                <ul role="list" className="divide-y divide-gray-200">
                  {recentTips.map((tip) => (
                    <RecentTipCard
                      key={tip.id}
                      id={tip.id}
                      title={tip.title}
                      category={tip.category}
                      categoryColor={tip.categoryColor}
                      description={tip.description}
                      daysAgo={3} // We'll use a default value for now since we store createdAt instead of daysAgo
                    />
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No recent tips available. Check back soon!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
