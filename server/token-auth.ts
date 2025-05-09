// Simpele token-based auth ipv cookie-based
import { Express, Request, Response, NextFunction } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

// Een in-memory token store - in productie zou je dit in een database opslaan
interface TokenData {
  userId: number;
  expires: number;
}

// Maak tokens en verificatie functie global beschikbaar
(global as any).tokens = (global as any).tokens || {};
const tokens: Record<string, TokenData> = (global as any).tokens;

// Zet de verifyToken functie globaal, zodat andere modules (zoals auth.ts) er ook bij kunnen
(global as any).verifyTokenFn = async (token: string): Promise<SelectUser | null> => {
  const tokenData = tokens[token];
  
  if (!tokenData) {
    return null;
  }
  
  if (tokenData.expires < Date.now()) {
    delete tokens[token]; // Verwijder verlopen tokens
    return null;
  }
  
  const user = await storage.getUser(tokenData.userId);
  return user || null;
};

// Promisify scrypt
const scryptAsync = promisify(scrypt);

// Wachtwoord hashen
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Wachtwoorden vergelijken
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Token genereren
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// Helper functie om een token te maken
function createToken(userId: number, expiresIn: number = 7 * 24 * 60 * 60 * 1000): string {
  const token = generateToken();
  tokens[token] = {
    userId,
    expires: Date.now() + expiresIn
  };
  return token;
}

// Helper functie om een token te valideren
export async function verifyToken(token: string): Promise<SelectUser | null> {
  const tokenData = tokens[token];
  
  if (!tokenData) {
    return null;
  }
  
  if (tokenData.expires < Date.now()) {
    delete tokens[token]; // Verwijder verlopen tokens
    return null;
  }
  
  const user = await storage.getUser(tokenData.userId);
  return user || null;
}

// Token routes instellen
export function setupTokenAuth(app: Express) {
  // Login route
  app.post("/api/token-login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Gebruikersnaam en wachtwoord zijn verplicht" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Ongeldige inloggegevens" });
      }
      
      const token = createToken(user.id);
      
      // Stuur het token en de gebruiker (zonder wachtwoord) terug
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error("Token login error:", error);
      return res.status(500).json({ message: "Er is een fout opgetreden bij het inloggen" });
    }
  });
  
  // Registratie route
  app.post("/api/token-register", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Gebruikersnaam en wachtwoord zijn verplicht" });
      }
      
      // Controleer of gebruiker al bestaat
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Gebruikersnaam bestaat al" });
      }
      
      // Maak de gebruiker aan
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword
      });
      
      // Genereer een token
      const token = createToken(user.id);
      
      // Stuur het token en de gebruiker (zonder wachtwoord) terug
      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error("Token registratie error:", error);
      return res.status(500).json({ message: "Er is een fout opgetreden bij het registreren" });
    }
  });
  
  // Gebruiker ophalen met token
  app.get("/api/token-user", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // Formaat: "Bearer TOKEN"
      
      if (!token) {
        return res.status(401).json({ message: "Geen token gevonden" });
      }
      
      const user = await verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ message: "Ongeldig of verlopen token" });
      }
      
      // Stuur de gebruiker (zonder wachtwoord) terug
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Token verificatie error:", error);
      return res.status(500).json({ message: "Er is een fout opgetreden bij het verifiëren van het token" });
    }
  });
  
  // Uitloggen (token verwijderen)
  app.post("/api/token-logout", (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // Formaat: "Bearer TOKEN"
      
      if (token && tokens[token]) {
        delete tokens[token];
      }
      
      return res.status(200).json({ message: "Succesvol uitgelogd" });
    } catch (error) {
      console.error("Token logout error:", error);
      return res.status(500).json({ message: "Er is een fout opgetreden bij het uitloggen" });
    }
  });
}