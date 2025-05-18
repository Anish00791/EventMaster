import { IStorage } from "./storage.interface.js";
import type { User, Event, Team, Registration, InsertUser } from "../shared/schema.js";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { db, pool } from "./db.js";
import { eq } from "drizzle-orm";
import { users, events, teams, registrations } from "../shared/schema.js";

const PgSessionStore = connectPgSimple(session);

export class PgStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PgSessionStore({
      pool,
      tableName: 'session', // You can customize the table name
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.query.events.findMany();
  }

  async getAllRegistrations(): Promise<Registration[]> {
    return await db.query.registrations.findMany();
  }

  async createEvent(event: Omit<Event, "id">): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async createTeam(team: Omit<Team, "id">): Promise<Team> {
    const result = await db.insert(teams).values(team).returning();
    return result[0];
  }

  async getTeamsByEventId(eventId: number): Promise<Team[]> {
    return await db.query.teams.findMany({
      where: eq(teams.eventId, eventId),
    });
  }

  async createRegistration(registration: Omit<Registration, "id">): Promise<Registration> {
    const result = await db.insert(registrations).values(registration).returning();
    return result[0];
  }
}

export const storage = new PgStorage(); 