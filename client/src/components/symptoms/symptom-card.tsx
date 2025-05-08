import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SymptomCardProps {
  id: number;
  title: string;
  category: string;
  description: string;
  recognitionPoints: string[];
  onClick?: () => void;
}

export default function SymptomCard({
  id,
  title,
  category,
  description,
  recognitionPoints,
  onClick,
}: SymptomCardProps) {
  return (
    <Card className="overflow-hidden shadow hover:shadow-md transition-shadow duration-300">
      <div className="px-4 py-5 sm:px-6 border-b">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <p className="mt-1 max-w-2xl text-sm text-primary">{category}</p>
      </div>
      <CardContent className="px-4 py-5 sm:p-6">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        <h4 className="mt-4 text-md font-medium text-foreground">Recognition points:</h4>
        <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
          {recognitionPoints.slice(0, 4).map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="px-4 py-4 sm:px-6 bg-muted/40">
        <Button 
          variant="ghost" 
          className="text-sm text-primary hover:text-primary/90 p-0 h-auto"
          onClick={onClick}
        >
          View techniques and tips
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
