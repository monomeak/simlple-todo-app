import express from "express";
import authRoutes from "./auth";
import categoryRoutes from "./category";
import taskRoutes from "./tasks";
import testRoutes from "./test";

// grouping v2 routes
const v2Routes = express.Router();

v2Routes.use("/auth", authRoutes);
v2Routes.use("/categories", categoryRoutes);
v2Routes.use("/tasks", taskRoutes);
v2Routes.use("/test", testRoutes);

export default v2Routes;
