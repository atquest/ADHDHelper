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
    name: 'adhdsupport',
    secret: process.env.SESSION_SECRET || 'adhd-support-secret-key',
    resave: true, 
    saveUninitialized: true,
    cookie: {
      path: '/',
      httpOnly: true,
      secure: false, // Geen HTTPS in Replit development
      maxAge: 2 * 60 * 60 * 1000, // 2 uur
      sameSite: 'lax'
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
      
      res.clearCookie('adhdsupport');
      return res.status(200).json({ message: "Succesvol uitgelogd" });
    });
  });

  app.get("/api/user", async (req: Request, res: Response) => {
    console.log("GET /api/user - Session ID:", req.sessionID);
    console.log("GET /api/user - isAuthenticated:", req.isAuthenticated());
    console.log("GET /api/user - Session:", req.session);
    console.log("GET /api/user - User:", req.user);
    
    // Eerst controleren op session auth
    if (req.isAuthenticated() && req.user) {
      console.log("GET /api/user - Gebruiker ingelogd via session");
      const { password, ...userWithoutPassword } = req.user as SelectUser;
      console.log("GET /api/user - Succesvol, stuur gebruiker terug:", userWithoutPassword);
      return res.status(200).json(userWithoutPassword);
    }
    
    // Als session auth faalt, probeer token auth
    const token = req.headers.authorization?.split(' ')[1];
    console.log("GET /api/user - Token in headers:", token ? "ja" : "nee");
    
    if (token) {
      try {
        // Importeer verifyToken als het nodig is
        const verifyToken = (global as any).verifyTokenFn;
        if (typeof verifyToken === 'function') {
          const user = await verifyToken(token);
          if (user) {
            console.log("GET /api/user - Gebruiker ingelogd via token");
            const { password, ...userWithoutPassword } = user;
            return res.status(200).json(userWithoutPassword);
          }
        } else {
          console.log("GET /api/user - verifyTokenFn niet beschikbaar als globale functie");
        }
      } catch (error) {
        console.error("Token verificatie error:", error);
      }
    }
    
    console.log("GET /api/user - Gebruiker niet ingelogd");
    return res.status(401).json({ message: "Niet ingelogd" });
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