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
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
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
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    try {
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      console.log("User created:", user);
      console.log("Session ID before register:", req.sessionID);
      
      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error("Error regenerating session after register:", err);
          return res.status(500).json({ error: "Session error" });
        }
        
        // Log user in to the new session with stored user data
        req.login(user as SelectUser, (err) => {
          if (err) {
            console.error("Error logging in after register:", err);
            return res.status(500).json({ error: "Login error" });
          }
  
          console.log("New session ID after register:", req.sessionID);
          console.log("Session after register:", req.session);
          
          // Save the regenerated session
          req.session.save((err) => {
            if (err) {
              console.error("Error saving session after register:", err);
              return res.status(500).json({ error: "Session save error" });
            }
            
            res.status(201).json(user);
          });
        });
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    console.log("Login successful, user:", req.user);
    console.log("Session ID before regenerate:", req.sessionID);
    
    // Store user data before regenerating session
    const userData = req.user as SelectUser;
    
    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error("Error regenerating session:", err);
        return res.status(500).json({ error: "Session error" });
      }
      
      // Log user in to the new session
      req.login(userData, (err) => {
        if (err) {
          console.error("Error logging in to new session:", err);
          return res.status(500).json({ error: "Login error" });
        }

        console.log("New session ID after regenerate:", req.sessionID);
        console.log("Session after regenerate:", req.session);
        
        // Save the regenerated session
        req.session.save((err) => {
          if (err) {
            console.error("Error saving regenerated session:", err);
            return res.status(500).json({ error: "Session save error" });
          }
          
          res.status(200).json(userData);
        });
      });
    });
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
