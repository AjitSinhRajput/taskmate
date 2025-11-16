export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  category: "Work" | "Personal" | "School" | "Other";
  createdAt: string;
  modifiedAt: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  notificationId?: string | null;
}
