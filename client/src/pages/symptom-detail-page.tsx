import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import TechniqueAccordion from "@/components/techniques/technique-accordion";
import { symptoms, techniques, relatedSymptomsByCategory } from "@/data/adhd-data";

export default function SymptomDetailPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [symptom, setSymptom] = useState<any | null>(null);
  const [relatedSymptoms, setRelatedSymptoms] = useState<any[]>([]);
  const [symptomTechniques, setSymptomTechniques] = useState<any[]>([]);

  useEffect(() => {
    if (!params.id) {
      navigate("/symptoms");
      return;
    }

    // Find the selected symptom
    const id = parseInt(params.id);
    const foundSymptom = symptoms.find(s => s.id === id);
    
    if (!foundSymptom) {
      navigate("/symptoms");
      return;
    }
    
    setSymptom(foundSymptom);
    
    // Get related symptoms
    const related = relatedSymptomsByCategory(foundSymptom.categoryId).filter(s => s.id !== id);
    setRelatedSymptoms(related.slice(0, 3));
    
    // Get techniques for this symptom
    const relatedTechniques = techniques.filter(t => 
      t.categories.includes(foundSymptom.categoryId)
    );
    setSymptomTechniques(relatedTechniques);
  }, [params.id, navigate]);

  if (!symptom) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-[#6D28D9]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20" 
              size="sm"
              onClick={() => navigate("/symptoms")}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to overview
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{symptom.title}</h1>
              <p className="mt-2 text-xl text-white opacity-90">{symptom.category}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge variant="outline" className="bg-white/20 text-white border-0 px-4 py-2 text-sm font-medium">
                Difficulty: {symptom.difficulty || "Moderate"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Details & Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {symptom.fullDescription || symptom.description}
            </p>
            
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Recognition Points</h3>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              {symptom.recognitionPoints.map((point: string, index: number) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
            
            {symptom.brainExplanation && (
              <>
                <h3 className="text-lg font-medium text-foreground mt-6 mb-3">What happens in the brain?</h3>
                <p className="text-muted-foreground mb-4">
                  {symptom.brainExplanation}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Techniques and Tips Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">Techniques & Tips</h2>
          
          <Card>
            {symptomTechniques.map((technique, index) => (
              <TechniqueAccordion
                key={technique.id}
                technique={technique}
                isFirst={index === 0}
              />
            ))}
          </Card>
        </div>
        
        {/* Related Symptoms */}
        {relatedSymptoms.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6">Related Symptoms</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSymptoms.map((related) => (
                <Card 
                  key={related.id} 
                  className="hover:shadow-md transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/symptoms/${related.id}`)}
                >
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-foreground">{related.title}</h3>
                    <p className="mt-1 text-sm text-primary">{related.category}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
