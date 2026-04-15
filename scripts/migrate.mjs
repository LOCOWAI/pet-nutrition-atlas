import { readFileSync } from "fs";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

const sqlFile = readFileSync(join(__dirname, "../drizzle/0001_dazzling_wasp.sql"), "utf8");
const statements = sqlFile
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of statements) {
  try {
    await connection.execute(stmt);
    console.log("✓ Executed:", stmt.slice(0, 60).replace(/\n/g, " ") + "...");
  } catch (err) {
    if (err.code === "ER_TABLE_EXISTS_ERROR" || err.message.includes("already exists")) {
      console.log("⚠ Already exists, skipping:", stmt.slice(0, 60).replace(/\n/g, " "));
    } else {
      console.error("✗ Error:", err.message);
      console.error("  SQL:", stmt.slice(0, 120));
    }
  }
}

await connection.end();
console.log("Migration complete.");
