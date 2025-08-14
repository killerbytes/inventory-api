const env = process.env.NODE_ENV || "development";
const envPath = `.env.${env}`;
require("dotenv").config({ path: envPath });

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { Sequelize } = require("sequelize");

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, BACKUP_DIR } = process.env;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(stderr || error.message);
      resolve(stdout);
    });
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

// 1️⃣ Backup
async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const compressedFile = path.join(
    BACKUP_DIR,
    `${DB_NAME}-${timestamp}.sql.gz`
  );

  const dumpCmd = `mysqldump -h ${DB_HOST} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_NAME}`;
  console.log("Creating backup...");

  try {
    const dumpProcess = exec(dumpCmd);
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

// 2️⃣ Restore
async function restore(filePath) {
  console.log(`Restoring from ${filePath}...`);
  try {
    let sqlFilePath = filePath;

    // If compressed, decompress
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

    // Run mysql restore
    const restoreCmd = `mysql -h ${DB_HOST} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_NAME} < "${sqlFilePath}"`;
    await runCommand(restoreCmd);
    console.log("Restore complete!");

    // Delete temp file if decompressed
    if (sqlFilePath !== filePath) {
      fs.unlinkSync(sqlFilePath);
    }
  } catch (err) {
    console.error("Restore failed:", err);
  }
}

// 3️⃣ Import to Sequelize (optional)
async function importToSequelize(filePath) {
  console.log(`Importing into Sequelize from ${filePath}...`);

  const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: "mysql",
    logging: false,
  });

  try {
    let sql = fs.readFileSync(filePath, "utf8");
    await sequelize.query(sql);
    console.log("Import complete via Sequelize!");
  } catch (err) {
    console.error("Sequelize import failed:", err);
  } finally {
    await sequelize.close();
  }
}

// CLI
const [, , command, file] = process.argv;

if (command === "backup") {
  backup();
} else if (command === "restore") {
  const restoreFile = file || getLatestBackup();
  if (!restoreFile) {
    console.error("No backup file found!");
    process.exit(1);
  }
  restore(restoreFile);
} else if (command === "restore-and-dev") {
  const restoreFile = file || getLatestBackup();
  if (!restoreFile) {
    console.error("No backup file found!");
    process.exit(1);
  }
  restore(restoreFile).then(() => {
    console.log("Starting dev server...");
    runCommand("npm run dev");
  });
} else if (command === "import-sequelize") {
  if (!file)
    return console.error("Usage: node backup.js import-sequelize <file.sql>");
  importToSequelize(file);
} else {
  console.log("Commands:");
  console.log("  node backup.js backup");
  console.log("  node backup.js restore [file]");
  console.log("  node backup.js restore-and-dev [file]");
  console.log("  node backup.js import-sequelize <file.sql>");
}
