import { IStorage } from "./storage.interface.js";
import type {
  User,
  Event,
  Team,
  Registration,
  InsertUser
} from "../shared/schema.js";

import { MemStorage } from "./mem-storage.js";
import { PgStorage } from "./pg-storage.js";

// Dynamically select storage backend based on environment
export const storage: IStorage =
  process.env.USE_MEM_STORAGE === "true"
    ? new MemStorage()
    : new PgStorage();
