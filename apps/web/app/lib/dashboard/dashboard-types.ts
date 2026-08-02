export type SelectedView = "all" | "todo" | "overdue";
export type FireworkBurst = {
  id: string;
  x: number;
  y: number;
  hue: number;
};

export type ViewMode = "list" | "grid";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface PageMetaData {
  total_pages: number;
  limit: number;
  current_page: number;
  is_prev: boolean;
  is_next: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  category_id: string | null;
  text: string;
  description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  end_date: string | null;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  status: string;
  data: Task[];
  meta_data: PageMetaData;
}

export interface TaskItemResponse {
  status: string;
  data: Task;
}

export interface CategoryListResponse {
  status: string;
  data: Category[];
  meta_data: PageMetaData;
}

export type CategoryItemResponse = Category;
