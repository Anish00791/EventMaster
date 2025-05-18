import type {
    User,
    Event,
    Team,
    Registration,
    InsertUser
  } from "@shared/schema";
  import session from "express-session";
  import createMemoryStore from "memorystore";
  import { IStorage } from "./storage.interface";
  
  const MemoryStore = createMemoryStore(session);
  
  export class MemStorage implements IStorage {
    private users: Map<number, User>;
    private events: Map<number, Event>;
    private teams: Map<number, Team>;
    private registrations: Map<number, Registration>;
    private currentId: number;
    sessionStore: session.Store;
  
    constructor() {
      this.users = new Map();
      this.events = new Map();
      this.teams = new Map();
      this.registrations = new Map();
      this.currentId = 1;
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // 24 hours
      });
    }
  
    async getUser(id: number): Promise<User | undefined> {
      return this.users.get(id);
    }
  
    async getUserByUsername(username: string): Promise<User | undefined> {
      return Array.from(this.users.values()).find(
        (user) => user.username === username
      );
    }
  
    async createUser(insertUser: InsertUser): Promise<User> {
      const id = this.currentId++;
      const user = { ...insertUser, id };
      this.users.set(id, user);
      return user;
    }
  
    async getAllEvents(): Promise<Event[]> {
      return Array.from(this.events.values());
    }
  
    async getAllRegistrations(): Promise<Registration[]> {
      return Array.from(this.registrations.values());
    }
  
    async createEvent(event: Omit<Event, "id">): Promise<Event> {
      const id = this.currentId++;
      const newEvent = { ...event, id };
      this.events.set(id, newEvent);
      return newEvent;
    }
  
    async createTeam(team: Omit<Team, "id">): Promise<Team> {
      const id = this.currentId++;
      const newTeam = { ...team, id };
      this.teams.set(id, newTeam);
      return newTeam;
    }
  
    async getTeamsByEventId(eventId: number): Promise<Team[]> {
      return Array.from(this.teams.values()).filter(
        (team) => team.eventId === eventId
      );
    }
  
    async createRegistration(
      registration: Omit<Registration, "id">
    ): Promise<Registration> {
      const id = this.currentId++;
      const newRegistration = { ...registration, id };
      this.registrations.set(id, newRegistration);
      return newRegistration;
    }
  }
  