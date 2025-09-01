const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "../dist");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const content = `// Auto-generated file
export const BUILD_TIME = "${new Date().toISOString()}";
`;

fs.writeFileSync(path.join(outDir, "build-info.js"), content);
console.log("✅ build-info.js generated");
