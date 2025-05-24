import express from "express";
import helmet, { contentSecurityPolicy } from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import { sql } from "./config/db.js";
import { aj } from "./lib/arcjet.js";

import productRoutes from "./routes/product.routes.js"; // Importing the product routes

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve(); // Get the current directory name

app.use(express.json()); // express.json() is a built-in middleware function in Express. It parses incoming requests with JSON payloads and is based on body-parser
app.use(cors()); // cors is a middleware that helps you enable CORS (Cross-Origin Resource Sharing) in your app
app.use(helmet({ contentSecurityPolicy: false })); // helmet is a security middleware that helps you protext your app by setting various HTTP headers
app.use(morgan("dev")); // morgan is a logging middleware that helps you log requests to your app

// Apply arcjet middleware
app.use(async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1, // specifies that each request consumes 1 token
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        res.status(429).send("Too many requests");
      } else if (decision.reason.isBot()) {
        res.status(403).send("Bot detected");
      } else {
        res.status(403).send("Forbidden");
      }
      return;
    }

    // Check for spoofed bots
    if (
      decision.results.some(
        (result) => result.reason.isBot() && result.reason.isSpoofed()
      )
    ) {
      res.status(403).send("Spoofed bot detected");
      return;
    }

    next();
  } catch (error) {
    console.log("Error in arcjet middleware:", error);
    next(error);
  }
});

app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === "production") {
  // Serve static files from the React app
  // __dirname is root not frontend nor backend
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
}

// A function to initialize the database connection
async function initializeDatabase() {
  try {
    await sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
    console.log("Database connection initialized .");
  } catch (error) {
    console.error("Error initializing database connection:", error);
  }
}

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on: http://localhost:" + PORT);
  });
});
