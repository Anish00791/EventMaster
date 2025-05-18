import type { User, Event, Team, Registration, InsertUser } from "../shared/schema.js";
import session from "express-session";

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getAllEvents(): Promise<Event[]>;
  getAllRegistrations(): Promise<Registration[]>;
  createEvent(event: Omit<Event, "id">): Promise<Event>;
  createTeam(team: Omit<Team, "id">): Promise<Team>;
  getTeamsByEventId(eventId: number): Promise<Team[]>;
  createRegistration(registration: Omit<Registration, "id">): Promise<Registration>;
} 