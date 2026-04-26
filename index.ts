import express from "express";
import { Request, Response } from "express";
import { AppDataSource } from "./src/db/data-source";
import cookieParser from "cookie-parser";
import v1Routes from "./src/routes/v1";
import v2Routes from "./src/routes/v2";
import cors from "cors";

import { swaggerV1Spec, swaggerV2Spec } from "./src/swagger";

import swaggerUi from "swagger-ui-express";

const app = express();

const parseAllowedOrigins = (): string[] => {
  const configuredOrigins = process.env.CORS_ORIGINS;
  if (!configuredOrigins) {
    return ["http://localhost:4000"];
  }

  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

app.use(
  cors({
    origin: parseAllowedOrigins(),
    credentials: true,
  }),
);
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(loggerMiddleware); // Apply the logger middleware globally

// map the routes
app.use(
  "/api-docs/v1",
  swaggerUi.serveFiles(swaggerV1Spec),
  swaggerUi.setup(swaggerV1Spec),
);
app.use(
  "/api-docs/v2",
  swaggerUi.serveFiles(swaggerV2Spec),
  swaggerUi.setup(swaggerV2Spec),
);
app.use("/api/v1", v1Routes);
app.use("/api/v2", v2Routes);

// the entry point of the application!

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Connect to PostgreSQL database
// Create Model and Controller for Todo
// Create Routes for Todo

// Module: User, Todo

// Initialize database connection
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully!");

    app.listen(port, () => {
      console.log(`Server is running on port:${port} `);
    });
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

// setup global middleware that act as logger for all routes

function loggerMiddleware(req: Request, res: Response, next: Function) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}

startServer();
