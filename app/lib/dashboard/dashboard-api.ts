import { getApiUrl } from "../runtime-config";
import type {
  Category,
  CategoryItemResponse,
  CategoryListResponse,
  TaskItemResponse,
  TaskListResponse,
  User,
} from "./dashboard-types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiRequestOptions = RequestInit & {
  retryOnUnauthorized?: boolean;
};

async function parseApiError(response: Response) {
  const data = (await response.json().catch(() => null)) as
    | { error?: string; message?: string; details?: Array<{ message?: string }> }
    | null;
  const details = data?.details
    ?.map((detail) => detail.message)
    .filter(Boolean)
    .join(", ");

  return new ApiError(
    data?.error ?? data?.message ?? details ?? `Request failed (${response.status})`,
    response.status,
  );
}

async function requestOnce(path: string, options: RequestInit = {}) {
  const url = await getApiUrl(`/api/v1${path}`);

  return fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });
}

async function refreshSession() {
  const response = await requestOnce("/auth/refresh", { method: "POST" });
  return response.ok;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { retryOnUnauthorized = true, ...requestOptions } = options;
  let response = await requestOnce(path, requestOptions);

  if (response.status === 401 && retryOnUnauthorized && path !== "/auth/refresh") {
    const refreshed = await refreshSession();
    if (refreshed) {
      response = await requestOnce(path, requestOptions);
    }
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const dashboardApi = {
  getCurrentUser: () => apiRequest<{ user: User }>("/auth/me"),
  logout: () => apiRequest<{ success: boolean }>("/auth/logout", { method: "POST" }),
  updateProfile: (payload: { name?: string; email?: string }) =>
    apiRequest<{ user: User }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  updatePassword: (payload: {
    current_password: string;
    new_password: string;
  }) =>
    apiRequest<{ success: boolean }>("/auth/me/password", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  listTasks: (params: { page?: number; limit?: number; categoryId?: string | null }) => {
    const query = new URLSearchParams({
      current_page: String(params.page ?? 1),
      limit: String(params.limit ?? 50),
    });

    if (params.categoryId) {
      query.set("category_id", params.categoryId);
    }

    return apiRequest<TaskListResponse>(`/tasks?${query.toString()}`);
  },
  createTask: (payload: {
    text: string;
    description?: string | null;
    category_id?: string;
    end_date?: string | null;
  }) =>
    apiRequest<TaskItemResponse>("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTask: (
    taskId: string,
      payload: {
        text?: string;
        description?: string | null;
        is_completed?: boolean;
        category_id?: string | null;
        end_date?: string | null;
    },
  ) =>
    apiRequest<TaskItemResponse>(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteTask: (taskId: string) =>
    apiRequest<{ status: string; message: string }>(`/tasks/${taskId}`, {
      method: "DELETE",
    }),
  reorderTasks: (taskIds: string[]) =>
    apiRequest<{ status: string; message: string }>("/tasks/reorder", {
      method: "POST",
      body: JSON.stringify({ task_ids: taskIds }),
    }),
  listCategories: (page = 1, limit = 50) =>
    apiRequest<CategoryListResponse>(
      `/categories?current_page=${page}&limit=${limit}`,
    ),
  createCategory: (payload: {
    name: string;
    icon?: string;
    description?: string;
  }) =>
    apiRequest<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCategory: (
    categoryId: string,
    payload: { name: string; icon?: string; description?: string },
  ) =>
    apiRequest<CategoryItemResponse>(`/categories/${categoryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteCategory: (categoryId: string) =>
    apiRequest<{ status: string; message: string }>(`/categories/${categoryId}`, {
      method: "DELETE",
    }),
};
