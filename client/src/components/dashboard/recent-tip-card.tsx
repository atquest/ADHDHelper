import { useLocation } from "wouter";
import { Clock, Info } from "lucide-react";

interface RecentTipCardProps {
  id: number;
  title: string;
  category: string;
  categoryColor: string;
  description: string;
  daysAgo: number;
}

export default function RecentTipCard({ 
  id, 
  title, 
  category, 
  categoryColor, 
  description, 
  daysAgo 
}: RecentTipCardProps) {
  const [, navigate] = useLocation();

  return (
    <li>
      <a 
        className="block hover:bg-muted/40 cursor-pointer"
        onClick={() => navigate(`/techniques/${id}`)}
      >
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary truncate">{title}</p>
            <div className="ml-2 flex-shrink-0 flex">
              <p 
                className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                style={{ 
                  backgroundColor: `${categoryColor}20`, 
                  color: categoryColor 
                }}
              >
                {category}
              </p>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="flex items-center text-sm text-muted-foreground">
                <Info className="flex-shrink-0 mr-1.5 h-5 w-5 text-muted-foreground" />
                {description}
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground sm:mt-0">
              <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-muted-foreground" />
              <p>{daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}</p>
            </div>
          </div>
        </div>
      </a>
    </li>
  );
}
