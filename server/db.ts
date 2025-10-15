import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Test database connection
export async function testConnection() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}
