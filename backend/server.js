// Server.js

import dotenv from "dotenv";

// Loads variables from .env into process.env
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

await connectDB();

// PORT
// We read from environment variables first, otherwise default to 3501.
const PORT = process.env.PORT || 3501;

// START SERVER
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});