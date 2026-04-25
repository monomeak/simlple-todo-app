import express, { Request, Response } from "express";
const testRoutes = express.Router();

testRoutes.get("/", (req: Request, res: Response) => {
  res.send("Hello from v2 api!");
});

export default testRoutes;
