import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export default function CategoryCard({ id, title, description, icon: Icon, color }: CategoryCardProps) {
  const [, navigate] = useLocation();

  return (
    <Card 
      className="overflow-hidden shadow hover:shadow-md transition-shadow duration-300 cursor-pointer"
      onClick={() => navigate(`/symptoms?category=${id}`)}
    >
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div
              className={`flex-shrink-0 rounded-md p-3`}
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className={`h-6 w-6`} style={{ color }} />
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
