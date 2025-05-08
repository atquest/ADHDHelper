import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TechniqueAccordionProps {
  technique: {
    id: number;
    title: string;
    description: string;
    howTo: string[];
    whyItWorks: string;
    proTip?: string;
  };
  isFirst: boolean;
}

export default function TechniqueAccordion({ technique, isFirst }: TechniqueAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-t border-border ${isFirst ? 'border-t-0' : ''}`}>
      <div 
        className="px-4 py-5 sm:px-6 hover:bg-muted/40 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">{technique.title}</h3>
          <Button variant="ghost" size="icon">
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
      {isOpen && (
        <div className="px-4 py-5 sm:p-6 border-t border-border bg-muted/20">
          <p className="text-muted-foreground mb-4">
            {technique.description}
          </p>
          
          <h4 className="text-md font-medium text-foreground mt-4 mb-2">How to apply this:</h4>
          <ol className="list-decimal pl-5 text-muted-foreground space-y-2">
            {technique.howTo.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          
          <h4 className="text-md font-medium text-foreground mt-4 mb-2">Why this works:</h4>
          <p className="text-muted-foreground">
            {technique.whyItWorks}
          </p>
          
          {technique.proTip && (
            <div className="mt-4 p-4 bg-primary/10 rounded-md">
              <h4 className="text-md font-medium text-primary mb-2">Pro tip:</h4>
              <p className="text-muted-foreground">
                {technique.proTip}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
