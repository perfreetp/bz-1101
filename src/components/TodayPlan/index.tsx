import React, { useState } from "react";
import { Plus, Check, Trash2, Syringe, Stethoscope, ShoppingBag, Sparkles, CalendarCheck2 } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import VaccineManager from "@/components/VaccineManager";
import { useBabyStore } from "@/store/baby";
import { useTodoStore } from "@/store/todo";
import { useFeedingStore } from "@/store/feeding";
import { useSleepStore } from "@/store/sleep";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/date";
import type { TodoItem } from "@/types";

const categoryIcons: Record<TodoItem["category"], typeof Sparkles> = {
  vaccine: Syringe,
  checkup: Stethoscope,
  shopping: ShoppingBag,
  other: Sparkles,
};

const categoryLabels: Record<TodoItem["category"], string> = {
  vaccine: "疫苗",
  checkup: "体检",
  shopping: "购物",
  other: "其他",
};

export default function TodayPlan() {
  const { currentBabyId, getCurrentBaby } = useBabyStore();
  const { getTodayTodos, toggleTodo, addTodo, deleteTodo } = useTodoStore();
  const { getTodayFeedings, getTodayDiapers } = useFeedingStore();
  const { getTodaySleeps } = useSleepStore();

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TodoItem["category"]>("other");

  const todos = currentBabyId ? getTodayTodos(currentBabyId) : [];
  const feedings = currentBabyId ? getTodayFeedings(currentBabyId) : [];
  const diapers = currentBabyId ? getTodayDiapers(currentBabyId) : [];
  const sleeps = currentBabyId ? getTodaySleeps(currentBabyId) : [];
  const baby = getCurrentBaby();

  function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !currentBabyId) return;
    addTodo({ babyId: currentBabyId, title: newTitle.trim(), category: newCategory });
    setNewTitle("");
    setNewCategory("other");
    setShowAdd(false);
  }

  const timeline = [
    ...feedings.map((f) => ({ time: f.time, type: "喂养", desc: `${f.type === "milk" ? "喂奶" : "辅食"} ${f.amount}${f.unit}` })),
    ...diapers.map((d) => ({ time: d.time, type: "换尿布", desc: d.type === "pee" ? "小便" : d.type === "poop" ? "大便" : "大小便" })),
    ...sleeps.filter((s) => s.endTime).map((s) => ({ time: s.startTime, type: "睡眠", desc: `睡了${Math.round(s.duration / 60)}小时${s.duration % 60}分` })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="space-y-5">
      <VaccineManager />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="今日喂奶" value={feedings.filter((f) => f.type === "milk").length.toString()} unit="次" color="pink" />
        <StatCard label="今日辅食" value={feedings.filter((f) => f.type === "solids").length.toString()} unit="次" color="mint" />
        <StatCard label="换尿布" value={diapers.length.toString()} unit="次" color="peach" />
        <StatCard label="已完成待办" value={`${todos.filter((t) => t.completed).length}/${todos.length}`} unit="" color="lavender" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">
            <CalendarIcon /> 今日待办
          </h3>
          <Button size="sm" variant="secondary" onClick={() => setShowAdd(true)}>
            <Plus size={16} className="mr-1" /> 添加
          </Button>
        </div>

        {todos.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm">暂无待办，点击上方按钮添加</p>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => {
              const CatIcon = categoryIcons[todo.category];
              return (
                <div
                  key={todo.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    todo.completed ? "bg-gray-50 dark:bg-night-200/5" : "bg-primary-50/50 dark:bg-night-200/5"
                  )}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                      todo.completed
                        ? "bg-mint-400 border-mint-400 text-white"
                        : "border-gray-300 dark:border-night-200 hover:border-primary-400"
                    )}
                  >
                    {todo.completed && <Check size={14} strokeWidth={3} />}
                  </button>
                  <CatIcon size={16} className={cn("flex-shrink-0", todo.completed ? "text-gray-400" : "text-primary-400")} />
                  <span className={cn("flex-1 text-sm", todo.completed ? "text-gray-400 line-through" : "text-gray-700 dark:text-night-50")}>
                    {todo.title}
                  </span>
                  <span className="text-xs text-gray-400 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-night-200/10">
                    {categoryLabels[todo.category]}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="section-title">
          <ClockIcon /> 今日时间轴
        </h3>
        {timeline.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm">今日暂无记录</p>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-primary-100 dark:bg-night-200/30" />
            <div className="space-y-4">
              {timeline.map((evt, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-primary-400 ring-4 ring-white dark:ring-night-800" />
                  <div className="bg-gray-50 dark:bg-night-200/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-night-50">{evt.type}</span>
                      <span className="text-xs text-gray-400">{formatDateTime(evt.time, "HH:mm")}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-night-100">{evt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="添加待办">
        <form onSubmit={handleAddTodo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">待办内容</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input-base"
              placeholder="例如：给宝宝洗澡"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">分类</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(categoryLabels) as TodoItem["category"][]).map((cat) => {
                const CatIcon = categoryIcons[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-colors",
                      newCategory === cat
                        ? "bg-primary-100 dark:bg-primary-400/20 text-primary-600 dark:text-primary-300"
                        : "bg-gray-50 dark:bg-night-200/5 text-gray-500"
                    )}
                  >
                    <CatIcon size={16} />
                    {categoryLabels[cat]}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">取消</Button>
            <Button type="submit" className="flex-1">保存</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function CalendarIcon() {
  return <CalendarCheck2 size={20} className="text-primary-500" />;
}
function ClockIcon() {
  return <Sparkles size={20} className="text-primary-500" />;
}

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  color: "pink" | "mint" | "peach" | "lavender";
}

function StatCard({ label, value, unit, color }: StatCardProps) {
  const colorMap = {
    pink: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 text-pink-600 dark:text-pink-300",
    mint: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 text-emerald-600 dark:text-emerald-300",
    peach: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-600 dark:text-orange-300",
    lavender: "from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 text-violet-600 dark:text-violet-300",
  };

  return (
    <div className={cn("rounded-2xl p-4 bg-gradient-to-br", colorMap[color])}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">
        {value}
        <span className="text-sm font-normal ml-0.5 opacity-70">{unit}</span>
      </p>
    </div>
  );
}
