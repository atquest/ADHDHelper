import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TechniqueCardProps {
  technique: {
    id: number;
    title: string;
    difficulty: string;
    mainCategory: string;
    categoryColor: string;
    description: string;
    benefits: string[];
  };
  onClick?: () => void;
}

export default function TechniqueCard({ technique, onClick }: TechniqueCardProps) {
  // Determine badge variant based on difficulty
  const getBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Capitalize first letter of difficulty
  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <Card className="overflow-hidden shadow hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-foreground">{technique.title}</h3>
          <Badge variant={getBadgeVariant(technique.difficulty)}>
            {formatDifficulty(technique.difficulty)}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-primary">{technique.mainCategory}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {technique.description}
        </p>
        
        <div className="mt-4 flex items-center">
          <div className="flex -space-x-1 overflow-hidden">
            {technique.benefits.slice(0, 2).map((benefit, index) => (
              <div 
                key={index}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-background text-white flex items-center justify-center text-xs"
                style={{ backgroundColor: index === 0 ? '#3B82F6' : '#6D28D9' }}
              >
                {index === 0 ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
              </div>
            ))}
          </div>
          <span className="ml-2 text-xs text-muted-foreground">
            Good for {technique.benefits.join(' and ')}
          </span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="text-sm text-primary hover:text-primary/90 p-0 h-auto"
            onClick={onClick}
          >
            Detailed instructions
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
