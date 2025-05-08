import { useAuth } from "@/hooks/use-auth";
import CategoryCard from "@/components/dashboard/category-card";
import RecentTipCard from "@/components/dashboard/recent-tip-card";
import { categories, recentTips } from "@/data/adhd-data";

export default function HomePage() {
  const { user } = useAuth();

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
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard 
                key={category.id}
                id={category.id}
                title={category.title}
                description={category.description}
                icon={category.icon}
                color={category.color}
              />
            ))}
          </div>
        </div>
        
        {/* Recent Tips Section */}
        <div className="mt-8 px-4 sm:px-0">
          <h2 className="text-2xl font-semibold mb-6">Recently Added Tips</h2>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {recentTips.map((tip) => (
                <RecentTipCard
                  key={tip.id}
                  id={tip.id}
                  title={tip.title}
                  category={tip.category}
                  categoryColor={tip.categoryColor}
                  description={tip.description}
                  daysAgo={tip.daysAgo}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
