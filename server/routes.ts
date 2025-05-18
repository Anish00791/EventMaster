import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth.js";
import { PgStorage } from "./pg-storage.js";
import { insertEventSchema } from "../shared/schema.js";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const storage = new PgStorage();
  setupAuth(app);

  app.get("/api/events", async (req, res) => {
    const events = await storage.getAllEvents();
    res.json(events);
  });

  app.get("/api/events/:id", async (req, res) => {
    const eventId = parseInt(req.params.id);
    const events = await storage.getAllEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  });

  app.get("/api/registrations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const registrations = await storage.getAllRegistrations();
    res.json(registrations);
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'organizer') return res.status(403).json({ message: "Only organizers can create events" });

    const parsed = insertEventSchema.parse(req.body);
    const event = await storage.createEvent({
      ...parsed,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
      creatorId: req.user.id
    });
    res.json(event);
  });

  app.post("/api/events/:eventId/register", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role === 'organizer') return res.status(403).json({ message: "Organizers cannot register for events" });

    const eventId = parseInt(req.params.eventId);
    const registration = await storage.createRegistration({
      eventId,
      userId: req.user.id,
      teamId: null,
      status: "pending"
    });
    res.json(registration);
  });

  app.post("/api/events/:eventId/teams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role === 'organizer') return res.status(403).json({ message: "Organizers cannot create teams" });

    const schema = z.object({
      name: z.string().min(1)
    });

    const eventId = parseInt(req.params.eventId);
    const { name } = schema.parse(req.body);

    const team = await storage.createTeam({
      name,
      eventId,
      leaderId: req.user.id
    });
    res.json(team);
  });

  app.get("/api/events/:eventId/teams", async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    const teams = await storage.getTeamsByEventId(eventId);
    res.json(teams);
  });

  const httpServer = createServer(app);
  return httpServer;
}