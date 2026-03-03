// Load environment variables before tests
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

console.log("Loaded TEST DB:", process.env.MONGO_URI);
