import { db } from './db';
import { categories, symptoms, techniques, techniquesCategories, techniquesSymptoms, recentTips } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Import categoriesData from client data
import { categories as categoriesData, symptoms as symptomsData, techniques as techniquesData, recentTips as recentTipsData } from '../client/src/data/adhd-data';

async function seed() {
  console.log('Seeding database...');
  
  try {
    // Clear existing data
    await db.delete(recentTips);
    await db.delete(techniquesSymptoms);
    await db.delete(techniquesCategories);
    await db.delete(techniques);
    await db.delete(symptoms);
    await db.delete(categories);
    
    console.log('Existing data cleared.');

    // Insert categories
    for (const category of categoriesData) {
      await db.insert(categories).values({
        id: category.id,
        title: category.title,
        description: category.description,
        color: category.color,
      });
    }
    console.log('Categories seeded.');
    
    // Insert symptoms
    for (const symptom of symptomsData) {
      await db.insert(symptoms).values({
        id: symptom.id,
        title: symptom.title,
        category: symptom.category,
        categoryId: symptom.categoryId,
        description: symptom.description,
        recognitionPoints: symptom.recognitionPoints,
        brainExplanation: symptom.brainExplanation,
        difficulty: symptom.difficulty,
      });
    }
    console.log('Symptoms seeded.');
    
    // Insert techniques
    for (const technique of techniquesData) {
      await db.insert(techniques).values({
        id: technique.id,
        title: technique.title,
        difficulty: technique.difficulty,
        mainCategory: technique.mainCategory,
        categoryColor: technique.categoryColor,
        description: technique.description,
        benefits: technique.benefits,
        howTo: technique.howTo,
        whyItWorks: technique.whyItWorks,
        proTip: technique.proTip,
      });
      
      // Insert technique-category relationships
      for (const categoryId of technique.categories) {
        await db.insert(techniquesCategories).values({
          techniqueId: technique.id,
          categoryId: categoryId,
        });
      }
      
      // Insert technique-symptom relationships
      if (technique.relatedSymptoms) {
        for (const symptomId of technique.relatedSymptoms) {
          await db.insert(techniquesSymptoms).values({
            techniqueId: technique.id,
            symptomId: symptomId,
          });
        }
      }
    }
    console.log('Techniques seeded.');
    
    // Insert recent tips
    for (const tip of recentTipsData) {
      await db.insert(recentTips).values({
        id: tip.id,
        title: tip.title,
        category: tip.category,
        categoryColor: tip.categoryColor,
        description: tip.description,
        techniqueId: tip.id, // Assuming tip id corresponds to technique id
      });
    }
    console.log('Recent tips seeded.');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seed().catch(console.error);