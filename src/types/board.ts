import type { Task } from './task'

export interface Column {
  id: string;
  title: string;
  archivedCount?: number;
  wipLimit?: number | null;
  tasks: Task[];
}

export interface Group {
  id: string;
  title: string;
  columns: Column[];
}
