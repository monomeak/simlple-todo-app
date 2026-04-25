import { NextFunction } from "express";
import express from "express";
import { Request, Response } from "express";
const taskRoutes = express.Router();
import { TaskService } from "../../services/task.service";
import { requireAuth } from "../../middleware/auth.middleware";
import { ResponseStatus } from "../../lib/ResponseStatus";
import { validateBody } from "../../middleware/validate.middleware";
import {
  createTaskSchema,
  reorderTasksSchema,
  updateTaskSchema,
} from "../../schema/task.schema";
const taskService = new TaskService();
import { UpdateTaskDto } from "../../schema/task.schema";

// list all tasks that belongs to a given user id
/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
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
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *         example: uuid-value
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
taskRoutes.get(
  "/",
  requireAuth,
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      // from user also need : current_page: default is 1
      // limit: default 10

      const { current_page, limit, category_id } = req.query;
      const page = Number(current_page) || 1;
      const take = Number(limit) || 10;
      const categoryId =
        typeof category_id === "string" && category_id.trim().length > 0
          ? category_id
          : undefined;

      console.log(`current page ${page} -- limit ${take}`);

      const tasksResponse = await taskService.listTasksByUser(
        req.authUser!.id,
        page,
        take,
        categoryId,
      );
      // implement pagination and filtering here later

      // prepare response by using DataRespons Interface

      res.json(tasksResponse);
    } catch (error) {
      next(error);
    }
  },
);

// create a new task for a given user id

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Create a task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: Buy groceries
 *               category_id:
 *                 type: string
 *                 example: uuid-value
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-01T10:00:00.000Z
 *               order_number:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
taskRoutes.post(
  "/",
  requireAuth,
  validateBody(createTaskSchema),
  async (req: Request, res: Response) => {
    try {
      const taskData = req.body;
      const user_id = req.authUser!.id;
      const newTask = await taskService.createTask(user_id, taskData);

      res.status(201).json({
        status: "success",
        data: newTask,
      });
    } catch (error: any) {
      if (error.message === "Category not found or not owned by user") {
        return res.status(400).json({
          status: ResponseStatus.FAILED,
          message: error.message,
        });
      }
      if (error.message === "Invalid end_date") {
        return res.status(400).json({
          status: ResponseStatus.FAILED,
          message: error.message,
        });
      }

      res.status(500).json({
        status: ResponseStatus.FAILED,
        message: "Failed to create task",
      });
    }
  },
);

// Remove task
/**
 * @openapi
 * /tasks/reorder:
 *   post:
 *     summary: Reorder tasks
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task_ids
 *             properties:
 *               task_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - uuid-value-1
 *                   - uuid-value-2
 *     responses:
 *       200:
 *         description: Tasks reordered
 *       400:
 *         description: Invalid task list
 *       401:
 *         description: Unauthorized
 */
taskRoutes.post(
  "/reorder",
  requireAuth,
  validateBody(reorderTasksSchema),
  async (req: Request, res: Response) => {
    try {
      const user_id = req.authUser.id;
      const { task_ids } = req.body as { task_ids: string[] };
      await taskService.reorderTasks(user_id, task_ids);

      res.status(200).json({
        status: ResponseStatus.SUCCESS,
        message: "Tasks reordered",
      });
    } catch (error: any) {
      if (error.message === "Some tasks were not found or not owned by user") {
        return res.status(400).json({
          status: ResponseStatus.FAILED,
          message: error.message,
        });
      }

      res.status(500).json({
        status: ResponseStatus.FAILED,
        message: "Failed to reorder tasks",
      });
    }
  },
);

// Remove task
/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: uuid-value
 *     responses:
 *       200:
 *         description: Task deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
taskRoutes.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user_id = req.authUser.id;
    const task_id = String(req.params.id);

    const task = await taskService.deleteTask(user_id, task_id);
    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      message: "task Deleted!",
    });
  } catch (error) {
    res.status(404).json({
      status: ResponseStatus.FAILED,
      message: error instanceof Error ? error.message : "Failed to delete task",
    });
  }
});

// update task

/**
 * @openapi
 * /tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
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
 *               text:
 *                 type: string
 *                 example: Buy groceries and cook dinner
 *               is_completed:
 *                 type: boolean
 *                 example: false
 *               category_id:
 *                 type: string
 *                 nullable: true
 *                 example: uuid-value
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: 2026-05-01T10:00:00.000Z
 *               order_number:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
taskRoutes.patch(
  "/:id",
  requireAuth,
  validateBody(updateTaskSchema),

  async (req: Request, res: Response) => {
    try {
      const user_id = req.authUser.id;
      const task_id = String(req.params.id);

      const updateTaskDto: UpdateTaskDto = req.body; // map data from body to updateTask Dto

      const updatedTask = await taskService.updateTask(
        user_id,
        task_id,
        updateTaskDto,
      );

      res.status(200).json({
        status: ResponseStatus.SUCCESS,
        data: updatedTask,
      });
    } catch (error: any) {
      if (error.message === "Category not found or not owned by user") {
        return res.status(400).json({
          status: ResponseStatus.FAILED,
          message: error.message,
        });
      }
      if (error.message === "Invalid end_date") {
        return res.status(400).json({
          status: ResponseStatus.FAILED,
          message: error.message,
        });
      }

      if (error.message === "Task not found or not owned by user") {
        return res.status(404).json({
          status: ResponseStatus.FAILED,
          message: error.message,
        });
      }

      res.status(500).json({
        status: ResponseStatus.FAILED,
        message: "Failed to update task",
      });
    }
  },
);

export default taskRoutes;
