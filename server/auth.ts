import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./pg-storage.js";
import { User as SelectUser, insertUserSchema } from "../shared/schema.js";

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
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET ?? 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log('Attempting login for username:', username);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log('User not found:', username);
          return done(null, false);
        }
        const passwordMatch = await comparePasswords(password, user.password);
        if (!passwordMatch) {
          console.log('Password mismatch for user:', username);
          return done(null, false);
        }
        console.log('Login successful for user:', username);
        return done(null, user);
      } catch (error) {
        console.error('Login error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log('Registration attempt with data:', {
        ...req.body,
        password: '[REDACTED]'
      });
      
      // Log the raw request body
      console.log('Raw request body:', JSON.stringify(req.body));
      
      // Validate request body against schema
      try {
        const validatedData = insertUserSchema.safeParse(req.body);
        console.log('Data validated successfully:', {
          ...validatedData,
          password: '[REDACTED]'
        });        if (!validatedData.success) {
          return res.status(400).json({ message: "Invalid input" });
        }

        const existingUser = await storage.getUserByUsername(validatedData.data.username);
        if (existingUser) {
          console.log('Username already exists:', validatedData.data.username);
          return res.status(409).json({ message: "Username already exists" });
        }

        const user = await storage.createUser({
          ...validatedData.data,
          password: await hashPassword(validatedData.data.password),
        });
        console.log('User created successfully:', {
          ...user,
          password: '[REDACTED]'
        });

        req.login(user, (err) => {
          if (err) {
            console.error('Login after registration failed:', err);
            return next(err);
          }
          res.status(201).json(user);
        });
      } catch (validationError) {
        console.error('Validation error:', validationError);
        return res.status(400).json({ 
          message: "Invalid data",
          details: validationError instanceof Error ? validationError.message : 'Unknown error'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        next(error);
      }
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string }) => {
      if (err) {
        console.error('Authentication error:', err);
        return next(err);
      }
      if (!user) {
        console.log('Authentication failed:', info);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      req.login(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return next(err);
        }
        res.status(200).json(user);
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
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}