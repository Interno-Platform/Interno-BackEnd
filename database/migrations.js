const fs = require("fs").promises;
const path = require("path");
const db = require("../src/config/database");
require("dotenv").config();

async function runMigrations() {
  console.log("✅ Connected to database\n");

  await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

  const [executedMigrations] = await db.query("SELECT name FROM migrations");

  const executed = executedMigrations.map((m) => m.name);

  const migrationsDir = path.join(__dirname, "Migrations_Files");
  const files = await fs.readdir(migrationsDir);
  const sqlFiles = files.filter((file) => file.endsWith(".sql")).sort();

  console.log(`Found ${sqlFiles.length} migration files`);
  console.log(`Already executed: ${executed.length}\n`);

  for (const file of sqlFiles) {
    if (executed.includes(file)) {
      console.log(`⏭️  Skipping: ${file} (already executed)`);
      continue;
    }

    console.log(`Running: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = await fs.readFile(filePath, "utf8");

    try {
      await db.query(sql);

      await db.query("INSERT INTO migrations (name) VALUES (?)", [file]);

      console.log(`Completed: ${file}\n`);
    } catch (error) {
      console.error(`Failed: ${file}`);
      console.error(`Error: ${error.message}\n`);
      throw error;
    }
  }

  console.log("All migrations completed successfully!");
}

runMigrations();
