import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
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
  const isProduction = process.env.NODE_ENV === 'production';
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'adhd-support-session-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      // In production, secure zou true moeten zijn
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    },
    name: 'adhd-support.sid',
    rolling: true // Forceer verlenging van sessie bij elke request
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    if (!user) {
      return done(new Error("User not found"), null);
    }
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    console.log("Registration attempt for user:", req.body.username);
    console.log("Session before registration:", req.session);
    
    try {
      // Check for existing user
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("Registration failed: username already exists");
        return res.status(400).json({ message: "Gebruikersnaam bestaat al" });
      }
    
      // Create the user with hashed password
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      console.log("User created successfully:", user.username);
      console.log("Session ID before login:", req.sessionID);
      
      // Log user in to the session
      req.login(user, (err) => {
        if (err) {
          console.error("Error logging in after register:", err);
          return res.status(500).json({ message: "Fout bij inloggen na registratie" });
        }

        console.log("User logged in after registration");
        console.log("Session ID after login:", req.sessionID);
        
        // Save the session explicitly
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session after register:", err);
            return res.status(500).json({ message: "Fout bij opslaan sessie" });
          }
          
          console.log("Session saved successfully after registration");
          console.log("Final session state:", req.session);
          return res.status(201).json(user);
        });
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Fout bij registreren" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for user:", req.body.username);
    console.log("Session before auth:", req.session);
    
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Login failed: Invalid credentials");
        return res.status(400).json({ message: "Ongeldige inloggegevens" });
      }
      
      console.log("Authentication successful for user:", user.username);
      
      req.login(user, (err) => {
        if (err) {
          console.error("Login session error:", err);
          return next(err);
        }
        
        console.log("Session ID after login:", req.sessionID);
        console.log("User in session:", req.user);
        
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session after login:", err);
            return res.status(500).json({ error: "Session save error" });
          }
          
          console.log("Session saved successfully");
          console.log("Final session state:", req.session);
          return res.status(200).json(user);
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("Session ID:", req.sessionID);
    console.log("Authenticated:", req.isAuthenticated());
    console.log("Session:", req.session);
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}