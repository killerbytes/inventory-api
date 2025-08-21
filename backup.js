/**
 * backup.js (Postgres version)
 *
 * Backup and restore PostgreSQL database with options:
 *  - full (schema + data)
 *  - data-only (no DROP/CREATE TABLE, safe for schema changes)
 *  - restore-and-dev (restore then start dev server)
 */

const env = process.env.NODE_ENV || "development";
const envPath = `.env.${env}`;
require("dotenv").config({ path: envPath });

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const {
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT = 5432,
} = process.env;
const BACKUP_DIR = process.env.BACKUP_DIR || "./backups";

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function runCommand(cmd, envOverrides = {}) {
  return new Promise((resolve, reject) => {
    exec(
      cmd,
      { env: { ...process.env, PGPASSWORD: DB_PASSWORD, ...envOverrides } },
      (error, stdout, stderr) => {
        if (error) return reject(stderr || error.message);
        resolve(stdout);
      }
    );
  });
}

function getLatestBackup() {
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".sql") || f.endsWith(".sql.gz"))
    .map((f) => ({
      name: f,
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  return files.length ? path.join(BACKUP_DIR, files[0].name) : null;
}

// 1️⃣ Backup (full or data-only)
async function backup({ dataOnly = false } = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const suffix = dataOnly ? "data-only" : "full";
  const compressedFile = path.join(
    BACKUP_DIR,
    `${DB_NAME}-${suffix}-${timestamp}.sql.gz`
  );

  const dumpCmd = dataOnly
    ? `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USERNAME} --data-only ${DB_NAME}`
    : `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USERNAME} ${DB_NAME}`;

  console.log(`Creating ${dataOnly ? "data-only" : "full"} backup...`);

  try {
    const dumpProcess = exec(dumpCmd, {
      env: { ...process.env, PGPASSWORD: DB_PASSWORD },
    });
    const gzip = zlib.createGzip();
    const outStream = fs.createWriteStream(compressedFile);
    dumpProcess.stdout.pipe(gzip).pipe(outStream);

    outStream.on("finish", () => {
      console.log(`Backup saved: ${compressedFile}`);
    });
  } catch (err) {
    console.error("Backup failed:", err);
  }
}

// 2️⃣ Restore (works with .sql or .sql.gz)
async function restore(filePath) {
  console.log(`Restoring from ${filePath}...`);
  try {
    let sqlFilePath = filePath;

    // If compressed, decompress first
    if (filePath.endsWith(".gz")) {
      const decompressedFile = filePath.replace(/\.gz$/, "");
      const input = fs.createReadStream(filePath);
      const output = fs.createWriteStream(decompressedFile);
      const gunzip = zlib.createGunzip();

      await new Promise((resolve, reject) => {
        input
          .pipe(gunzip)
          .pipe(output)
          .on("finish", resolve)
          .on("error", reject);
      });

      sqlFilePath = decompressedFile;
    }

    // Run Postgres restore
    const restoreCmd = `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USERNAME} -d ${DB_NAME} -f "${sqlFilePath}"`;
    await runCommand(restoreCmd);
    console.log("Restore complete!");

    // Delete temp decompressed file
    if (sqlFilePath !== filePath) {
      fs.unlinkSync(sqlFilePath);
    }
  } catch (err) {
    console.error("Restore failed:", err);
  }
}

// 3️⃣ Restore and start dev server
async function restoreAndDev(filePath) {
  await restore(filePath);
  console.log("Starting dev server...");
  runCommand("npm run dev");
}

// CLI entry
const [, , command, file] = process.argv;

(async () => {
  try {
    if (command === "backup") {
      await backup();
    } else if (command === "backup-data") {
      await backup({ dataOnly: true });
    } else if (command === "restore") {
      const restoreFile = file || getLatestBackup();
      if (!restoreFile) {
        console.error("No backup file found!");
        process.exit(1);
      }
      await restore(restoreFile);
    } else if (command === "restore-and-dev") {
      const restoreFile = file || getLatestBackup();
      if (!restoreFile) {
        console.error("No backup file found!");
        process.exit(1);
      }
      await restoreAndDev(restoreFile);
    } else {
      console.log("Commands:");
      console.log(
        "  node backup.js backup          # Full backup (schema+data)"
      );
      console.log("  node backup.js backup-data     # Data-only backup");
      console.log(
        "  node backup.js restore [file]  # Restore full/data backup"
      );
      console.log(
        "  node backup.js restore-and-dev [file] # Restore then start dev"
      );
    }
  } catch (err) {
    console.error("Error:", err);
  }
})();
