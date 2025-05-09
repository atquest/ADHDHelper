import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupTokenAuth } from "./token-auth";
import { storage } from "./storage";
import { db } from "./db";
import { 
  categories, 
  symptoms, 
  techniques, 
  techniquesCategories, 
  techniquesSymptoms,
  savedTechniques,
  recentTips
} from "@shared/schema";
import { eq, inArray, and } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes - beide methoden
  setupAuth(app);
  setupTokenAuth(app);

  // Categories endpoints
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categoriesData = await db.select().from(categories);
      res.json(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Symptoms endpoints
  app.get("/api/symptoms", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      
      let symptomsData;
      if (categoryId) {
        symptomsData = await db
          .select()
          .from(symptoms)
          .where(eq(symptoms.categoryId, categoryId));
      } else {
        symptomsData = await db.select().from(symptoms);
      }
      
      res.json(symptomsData);
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      res.status(500).json({ error: "Failed to fetch symptoms" });
    }
  });

  app.get("/api/symptoms/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const [symptom] = await db
        .select()
        .from(symptoms)
        .where(eq(symptoms.id, id));
        
      if (!symptom) {
        return res.status(404).json({ error: "Symptom not found" });
      }
      
      res.json(symptom);
    } catch (error) {
      console.error("Error fetching symptom:", error);
      res.status(500).json({ error: "Failed to fetch symptom" });
    }
  });

  // Techniques endpoints
  app.get("/api/techniques", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const difficulty = req.query.difficulty as string | undefined;
      
      // Start with selecting all techniques
      let techniquesData = await db.select().from(techniques);
      
      // Filter by category if provided
      if (categoryId) {
        const techCategoryRelations = await db
          .select()
          .from(techniquesCategories)
          .where(eq(techniquesCategories.categoryId, categoryId));
        
        const techniqueIds = techCategoryRelations.map(rel => rel.techniqueId);
        techniquesData = techniquesData.filter(tech => techniqueIds.includes(tech.id));
      }
      
      // Filter by difficulty if provided
      if (difficulty) {
        techniquesData = techniquesData.filter(tech => tech.difficulty === difficulty);
      }
      
      res.json(techniquesData);
    } catch (error) {
      console.error("Error fetching techniques:", error);
      res.status(500).json({ error: "Failed to fetch techniques" });
    }
  });

  app.get("/api/techniques/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const [technique] = await db
        .select()
        .from(techniques)
        .where(eq(techniques.id, id));
        
      if (!technique) {
        return res.status(404).json({ error: "Technique not found" });
      }
      
      // Get related categories
      const relatedCategories = await db
        .select({
          categoryId: techniquesCategories.categoryId
        })
        .from(techniquesCategories)
        .where(eq(techniquesCategories.techniqueId, id));
      
      // Get related symptoms
      const relatedSymptoms = await db
        .select({
          symptomId: techniquesSymptoms.symptomId
        })
        .from(techniquesSymptoms)
        .where(eq(techniquesSymptoms.techniqueId, id));
      
      const result = {
        ...technique,
        categories: relatedCategories.map(cat => cat.categoryId),
        relatedSymptoms: relatedSymptoms.map(sym => sym.symptomId)
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching technique:", error);
      res.status(500).json({ error: "Failed to fetch technique" });
    }
  });

  // Saved techniques endpoints (requires authentication)
  app.get("/api/saved-techniques", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      
      const savedTechniquesList = await db
        .select({
          techniqueId: savedTechniques.techniqueId
        })
        .from(savedTechniques)
        .where(eq(savedTechniques.userId, userId));
      
      const techniqueIds = savedTechniquesList.map(st => st.techniqueId);
      
      if (techniqueIds.length === 0) {
        return res.json([]);
      }
      
      const techniquesData = await db
        .select()
        .from(techniques)
        .where(inArray(techniques.id, techniqueIds));
      
      res.json(techniquesData);
    } catch (error) {
      console.error("Error fetching saved techniques:", error);
      res.status(500).json({ error: "Failed to fetch saved techniques" });
    }
  });

  app.post("/api/save-technique", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to save techniques" });
    }
    
    try {
      const { techniqueId } = req.body;
      if (!techniqueId) {
        return res.status(400).json({ message: "Technique ID is required" });
      }
      
      const userId = req.user!.id;
      
      // Check if technique exists
      const [technique] = await db
        .select()
        .from(techniques)
        .where(eq(techniques.id, techniqueId));
      
      if (!technique) {
        return res.status(404).json({ error: "Technique not found" });
      }
      
      // Check if already saved
      const [existing] = await db
        .select()
        .from(savedTechniques)
        .where(
          and(
            eq(savedTechniques.techniqueId, techniqueId),
            eq(savedTechniques.userId, userId)
          )
        );
      
      if (existing) {
        return res.status(409).json({ error: "Technique already saved" });
      }
      
      // Save technique
      await db.insert(savedTechniques).values({
        techniqueId,
        userId
      });
      
      res.status(201).json({ success: true, message: "Technique saved successfully" });
    } catch (error) {
      console.error("Error saving technique:", error);
      res.status(500).json({ error: "Failed to save technique" });
    }
  });

  app.delete("/api/remove-technique", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to remove techniques" });
    }
    
    try {
      const { techniqueId } = req.body;
      if (!techniqueId) {
        return res.status(400).json({ message: "Technique ID is required" });
      }
      
      const userId = req.user!.id;
      
      await db
        .delete(savedTechniques)
        .where(
          and(
            eq(savedTechniques.techniqueId, techniqueId),
            eq(savedTechniques.userId, userId)
          )
        );
      
      res.status(200).json({ success: true, message: "Technique removed successfully" });
    } catch (error) {
      console.error("Error removing saved technique:", error);
      res.status(500).json({ error: "Failed to remove saved technique" });
    }
  });

  // Recent tips endpoint
  app.get("/api/recent-tips", async (_req: Request, res: Response) => {
    try {
      const tips = await db
        .select()
        .from(recentTips)
        .orderBy(recentTips.createdAt);
      
      res.json(tips);
    } catch (error) {
      console.error("Error fetching recent tips:", error);
      res.status(500).json({ error: "Failed to fetch recent tips" });
    }
  });
  
  const httpServer = createServer(app);

  return httpServer;
}
