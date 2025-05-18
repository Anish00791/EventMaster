import { IStorage } from "./storage.interface";
import type {
  User,
  Event,
  Team,
  Registration,
  InsertUser
} from "@shared/schema";

import { MemStorage } from "./mem-storage";
import { PgStorage } from "./pg-storage";

// Dynamically select storage backend based on environment
export const storage: IStorage =
  process.env.USE_MEM_STORAGE === "true"
    ? new MemStorage()
    : new PgStorage();
