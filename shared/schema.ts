import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum, foreignKey, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define enum for category types
export const categoryEnum = pgEnum('category_type', [
  'focus',
  'organization',
  'impulse',
  'hyperactivity',
  'emotional',
  'social',
]);

// Define enum for difficulty levels
export const difficultyEnum = pgEnum('difficulty_level', [
  'easy',
  'medium',
  'hard',
]);

// Categories table
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories);
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Symptoms table
export const symptoms = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  categoryId: text("category_id").notNull().references(() => categories.id),
  description: text("description").notNull(),
  recognitionPoints: json("recognition_points").$type<string[]>().notNull(),
  brainExplanation: text("brain_explanation"),
  difficulty: text("difficulty").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSymptomSchema = createInsertSchema(symptoms);
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Symptom = typeof symptoms.$inferSelect;

// Techniques table
export const techniques = pgTable("techniques", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  difficulty: text("difficulty").notNull(),
  mainCategory: text("main_category").notNull(),
  categoryColor: text("category_color").notNull(),
  description: text("description").notNull(),
  benefits: json("benefits").$type<string[]>().notNull(),
  howTo: json("how_to").$type<string[]>().notNull(),
  whyItWorks: text("why_it_works").notNull(),
  proTip: text("pro_tip"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTechniqueSchema = createInsertSchema(techniques);
export type InsertTechnique = z.infer<typeof insertTechniqueSchema>;
export type Technique = typeof techniques.$inferSelect;

// Junction table for technique-category relationship
export const techniquesCategories = pgTable("techniques_categories", {
  techniqueId: integer("technique_id").notNull().references(() => techniques.id),
  categoryId: text("category_id").notNull().references(() => categories.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.techniqueId, t.categoryId] }),
}));

// Junction table for technique-symptom relationship
export const techniquesSymptoms = pgTable("techniques_symptoms", {
  techniqueId: integer("technique_id").notNull().references(() => techniques.id),
  symptomId: integer("symptom_id").notNull().references(() => symptoms.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.techniqueId, t.symptomId] }),
}));

// Saved techniques for users
export const savedTechniques = pgTable("saved_techniques", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  techniqueId: integer("technique_id").notNull().references(() => techniques.id),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Recent tips table
export const recentTips = pgTable("recent_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  categoryColor: text("category_color").notNull(),
  description: text("description").notNull(),
  techniqueId: integer("technique_id").references(() => techniques.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  savedTechniques: many(savedTechniques),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  symptoms: many(symptoms),
  techniqueCategories: many(techniquesCategories),
}));

export const symptomsRelations = relations(symptoms, ({ one, many }) => ({
  category: one(categories, {
    fields: [symptoms.categoryId],
    references: [categories.id],
  }),
  techniqueSymptoms: many(techniquesSymptoms),
}));

export const techniquesRelations = relations(techniques, ({ many }) => ({
  techniqueCategories: many(techniquesCategories),
  techniqueSymptoms: many(techniquesSymptoms),
  savedByUsers: many(savedTechniques),
  recentTips: many(recentTips),
}));

export const techniquesCategoriesRelations = relations(techniquesCategories, ({ one }) => ({
  technique: one(techniques, {
    fields: [techniquesCategories.techniqueId],
    references: [techniques.id],
  }),
  category: one(categories, {
    fields: [techniquesCategories.categoryId],
    references: [categories.id],
  }),
}));

export const techniquesSymptomsRelations = relations(techniquesSymptoms, ({ one }) => ({
  technique: one(techniques, {
    fields: [techniquesSymptoms.techniqueId],
    references: [techniques.id],
  }),
  symptom: one(symptoms, {
    fields: [techniquesSymptoms.symptomId],
    references: [symptoms.id],
  }),
}));

export const savedTechniquesRelations = relations(savedTechniques, ({ one }) => ({
  user: one(users, {
    fields: [savedTechniques.userId],
    references: [users.id],
  }),
  technique: one(techniques, {
    fields: [savedTechniques.techniqueId],
    references: [techniques.id],
  }),
}));

export const recentTipsRelations = relations(recentTips, ({ one }) => ({
  technique: one(techniques, {
    fields: [recentTips.techniqueId],
    references: [techniques.id],
  }),
}));
