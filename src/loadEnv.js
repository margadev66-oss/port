const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");

if (typeof process.loadEnvFile === "function" && fs.existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Could not load .env file: ${error.message}`);
    }
  }
}
