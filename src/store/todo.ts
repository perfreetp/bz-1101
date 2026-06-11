import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TodoItem } from "@/types";
import { generateId, todayStr } from "@/utils/date";

interface TodoState {
  todos: TodoItem[];

  addTodo: (item: Omit<TodoItem, "id" | "completed" | "date"> & { date?: string; completed?: boolean }) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  getBabyTodos: (babyId: string) => TodoItem[];
  getTodayTodos: (babyId: string) => TodoItem[];
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [
        {
          id: "sample-t1",
          babyId: "default",
          title: "给宝宝洗澡",
          completed: false,
          date: todayStr(),
          category: "other",
        },
        {
          id: "sample-t2",
          babyId: "default",
          title: "接种乙肝疫苗第三针",
          completed: false,
          date: todayStr(),
          category: "vaccine",
        },
      ],

      addTodo: (item) =>
        set((state) => ({
          todos: [
            {
              ...item,
              id: generateId(),
              date: item.date || todayStr(),
              completed: item.completed || false,
            },
            ...state.todos,
          ],
        })),

      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        })),

      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        })),

      getBabyTodos: (babyId) => get().todos.filter((t) => t.babyId === babyId),

      getTodayTodos: (babyId) =>
        get()
          .todos.filter((t) => t.babyId === babyId && t.date === todayStr())
          .sort((a, b) => Number(a.completed) - Number(b.completed)),
    }),
    { name: "todo-store" }
  )
);
