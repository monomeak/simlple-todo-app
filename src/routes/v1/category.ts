import express from "express";
import { Request, Response } from "express";
import { validateBody } from "../../middleware/validate.middleware";
import {
  CreateCategoryDto,
  createCategorySchema,
  UpdateCategoryDto,
} from "../../schema/category.schema";
import { requireAuth } from "../../middleware/auth.middleware";
import { CategoryService } from "../../services/category.service";
import { updateTaskSchema } from "../../schema/task.schema";
import { ResponseStatus } from "../../lib/ResponseStatus";
const categoryRoutes = express.Router();

const categoryService = new CategoryService();

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags:
 *       - Categories
 *     security:
 *       - accessCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: current_page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: List of categories
 *       401:
 *         description: Unauthorized
 */
categoryRoutes.get("/", requireAuth, async (req: Request, res: Response) => {
  // get user_id from middleware

  const user_id = req.authUser.id;
  // const limit = req.query.limit || 10;
  // const current_page = req.query.page || 1;

  const { limit, current_page } = req.query;
  const result = await categoryService.listCategories(
    user_id,
    Number(current_page),
    Number(limit),
  );

  res.status(200).json(result);
});

/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Create a category
 *     tags:
 *       - Categories
 *     security:
 *       - accessCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Personal
 *               icon:
 *                 type: string
 *                 example: home
 *               description:
 *                 type: string
 *                 example: Personal tasks and errands
 *     responses:
 *       200:
 *         description: Category created
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
categoryRoutes.post(
  "/",
  requireAuth,
  validateBody(createCategorySchema),
  async (req: Request, res: Response) => {
    try {
      const user_id = req.authUser.id;
      const categoryData: CreateCategoryDto = req.body;
      //   console.log(">>> category data", categoryData);
      const category = await categoryService.createCategory(
        user_id,
        categoryData,
      );

      res.status(200).json(category);
    } catch (error: any) {
      error.message = "Something went wrong during create category!";

      res.status(500).json({ messager: error });
    }
  },
);

/**
 * @openapi
 * /categories/{id}:
 *   patch:
 *     summary: Update a category
 *     tags:
 *       - Categories
 *     security:
 *       - accessCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: uuid-value
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Work
 *               icon:
 *                 type: string
 *                 example: briefcase
 *               description:
 *                 type: string
 *                 example: Work tasks and projects
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
categoryRoutes.patch(
  "/:id",
  requireAuth,
  validateBody(updateTaskSchema),
  async (req: Request, res: Response) => {
    try {
      const user_id = req.authUser.id;
      const category_id = String(req.params.id);
      const categoryData: UpdateCategoryDto = req.body;
      //   console.log(">>> category data", categoryData);
      const category = await categoryService.updateCategory(
        user_id,
        category_id,
        categoryData,
      );

      res.status(200).json(category);
    } catch (error: any) {
      error.message = "Something went wrong during update category!";

      res.status(500).json({ messager: error });
    }
  },
);

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags:
 *       - Categories
 *     security:
 *       - accessCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: uuid-value
 *     responses:
 *       200:
 *         description: Category deleted
 *       401:
 *         description: Unauthorized
 */
categoryRoutes.delete(
  "/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user_id = req.authUser.id;
      const category_id = String(req.params.id);
      //   console.log(">>> category data", categoryData);
      const message = await categoryService.deleteCategory(
        user_id,
        category_id,
      );

      res.status(200).json({
        status: ResponseStatus.SUCCESS,
        message: message,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     summary: Get a category by id
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: uuid-value
 *     responses:
 *       200:
 *         description: Category found
 */
categoryRoutes.get("/:id", async (req: Request, res: Response) => {
  res.json({ message: "List of categories" });
});

export default categoryRoutes;
