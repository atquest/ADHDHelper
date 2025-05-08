import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Productie detectie
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = isProduction ? 'your-domain.com' : undefined;
  
  // Session configuratie
  const sessionConfig: session.SessionOptions = {
    name: 'adhd.sid',
    secret: process.env.SESSION_SECRET || 'adhd-support-secret-key',
    resave: true, // Belangrijk: voorkomt sessie expiratie tussen requesten
    saveUninitialized: true, // Belangrijk voor het instellen van cookie bij eerste request
    cookie: {
      path: '/',
      httpOnly: true,
      // Geen secure of domain attributen zodat de cookie werkt met Replit URL's
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      sameSite: 'lax' // Veiliger standaardoptie
    },
    rolling: true, // Verlengt de sessie bij elke request
    store: storage.sessionStore
  };

  app.set('trust proxy', 1);
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuratie
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });

  // API Routes
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      // Controleer of gebruiker al bestaat
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Gebruikersnaam bestaat al" });
      }

      // Maak de gebruiker aan
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      // Log de gebruiker in
      req.login(user, (err) => {
        if (err) {
          console.error("Login na registratie mislukt:", err);
          return res.status(500).json({ message: "Inloggen na registratie mislukt" });
        }
        
        // Stuur respons met gebruiker (zonder wachtwoord)
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registratie fout:", error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het registreren" });
    }
  });

  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /api/login - Begin auth poging - Session ID:", req.sessionID);
    console.log("POST /api/login - Request cookies:", req.headers.cookie);
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("POST /api/login - Ongeldige inloggegevens");
        return res.status(400).json({ message: "Ongeldige inloggegevens" });
      }
      
      console.log("POST /api/login - Authenticatie succesvol, login gebruiker:", user.username);
      
      req.login(user, (err) => {
        if (err) {
          console.error("Login sessiefout:", err);
          return next(err);
        }
        
        // Controleer req.session na login
        console.log("POST /api/login - Login voltooid - Session ID:", req.sessionID);
        console.log("POST /api/login - Session na login:", req.session);
        console.log("POST /api/login - isAuthenticated na login:", req.isAuthenticated());
        
        // Stuur respons met gebruiker (zonder wachtwoord)
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error("Uitloggen mislukt:", err);
        return res.status(500).json({ message: "Uitloggen mislukt" });
      }
      
      res.clearCookie('adhd.sid');
      return res.status(200).json({ message: "Succesvol uitgelogd" });
    });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    console.log("GET /api/user - Session ID:", req.sessionID);
    console.log("GET /api/user - isAuthenticated:", req.isAuthenticated());
    console.log("GET /api/user - Session:", req.session);
    console.log("GET /api/user - User:", req.user);
    
    if (!req.isAuthenticated()) {
      console.log("GET /api/user - Gebruiker niet ingelogd");
      return res.status(401).json({ message: "Niet ingelogd" });
    }
    
    // Retourneer de gebruiker zonder wachtwoord
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    console.log("GET /api/user - Succesvol, stuur gebruiker terug:", userWithoutPassword);
    res.status(200).json(userWithoutPassword);
  });

  // Helper route voor debug doeleinden
  app.get("/api/session-check", (req: Request, res: Response) => {
    res.json({
      authenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      session: req.session,
      user: req.user
    });
  });
}