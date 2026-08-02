import express from "express";
import authRoutes from "./auth";
import categoryRoutes from "./category";
import taskRoutes from "./tasks";
import testRoutes from "./test";

// Grouping v1 routes
const v1Routes = express.Router();

v1Routes.use("/auth", authRoutes);
v1Routes.use("/categories", categoryRoutes);
v1Routes.use("/tasks", taskRoutes);
v1Routes.use("/test", testRoutes);

export default v1Routes;
