import React, { useState, useMemo } from "react";
import { Trash2, Milk, UtensilsCrossed, Baby, Moon, CheckSquare, Square, Syringe, Stethoscope, ShoppingBag, Sparkles, History } from "lucide-react";
import Card from "@/components/common/Card";
import { useBabyStore } from "@/store/baby";
import { useFeedingStore } from "@/store/feeding";
import { useSleepStore } from "@/store/sleep";
import { useTodoStore } from "@/store/todo";
import { formatDate, formatDateTime, formatDuration } from "@/utils/date";
import { cn } from "@/lib/utils";
import type { TodoItem } from "@/types";

type RecordTab = "all" | "feeding" | "diaper" | "sleep" | "todo";

const tabs: { key: RecordTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "feeding", label: "喂养" },
  { key: "diaper", label: "尿布" },
  { key: "sleep", label: "睡眠" },
  { key: "todo", label: "待办" },
];

const todoCategoryIcons: Record<TodoItem["category"], typeof Sparkles> = {
  vaccine: Syringe,
  checkup: Stethoscope,
  shopping: ShoppingBag,
  other: Sparkles,
};

const todoCategoryLabels: Record<TodoItem["category"], string> = {
  vaccine: "疫苗",
  checkup: "体检",
  shopping: "购物",
  other: "其他",
};

interface UnifiedRecord {
  id: string;
  type: RecordTab;
  time: string;
  sortTime: number;
  node: React.ReactNode;
}

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return {
    startDate: formatDate(start, "yyyy-MM-dd"),
    endDate: formatDate(end, "yyyy-MM-dd"),
  };
}

export default function HistoryCenter() {
  const { currentBabyId } = useBabyStore();
  const { feedingRecords, diaperRecords, deleteFeeding, deleteDiaper } = useFeedingStore();
  const { sleepRecords, deleteSleep } = useSleepStore();
  const { todos, deleteTodo } = useTodoStore();

  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [activeTab, setActiveTab] = useState<RecordTab>("all");

  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate + "T23:59:59.999").getTime();

  const babyFeedings = currentBabyId
    ? feedingRecords.filter((r) => r.babyId === currentBabyId)
    : [];
  const babyDiapers = currentBabyId
    ? diaperRecords.filter((r) => r.babyId === currentBabyId)
    : [];
  const babySleepes = currentBabyId
    ? sleepRecords.filter((r) => r.babyId === currentBabyId)
    : [];
  const babyTodos = currentBabyId
    ? todos.filter((r) => r.babyId === currentBabyId)
    : [];

  const records = useMemo<UnifiedRecord[]>(() => {
    const result: UnifiedRecord[] = [];

    if (activeTab === "all" || activeTab === "feeding") {
      babyFeedings
        .filter((f) => {
          const t = new Date(f.time).getTime();
          return t >= startMs && t <= endMs;
        })
        .forEach((f) => {
          result.push({
            id: f.id,
            type: "feeding",
            time: f.time,
            sortTime: new Date(f.time).getTime(),
            node: (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50/50 dark:bg-night-200/5">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    f.type === "milk"
                      ? "bg-pink-100 dark:bg-pink-400/20"
                      : "bg-emerald-100 dark:bg-emerald-400/20"
                  )}
                >
                  {f.type === "milk" ? (
                    <Milk size={18} className="text-pink-500" />
                  ) : (
                    <UtensilsCrossed size={18} className="text-emerald-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-night-50">
                      {f.type === "milk" ? "喂奶" : "辅食"}
                    </span>
                    <span className="text-sm text-primary-500 font-semibold">
                      {f.amount}{f.unit}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {formatDateTime(f.time, "MM-dd HH:mm")}
                    {f.note && ` · ${f.note}`}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("确定删除这条喂养记录吗？")) deleteFeeding(f.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          });
        });
    }

    if (activeTab === "all" || activeTab === "diaper") {
      babyDiapers
        .filter((d) => {
          const t = new Date(d.time).getTime();
          return t >= startMs && t <= endMs;
        })
        .forEach((d) => {
          result.push({
            id: d.id,
            type: "diaper",
            time: d.time,
            sortTime: new Date(d.time).getTime(),
            node: (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50/50 dark:bg-night-200/5">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-400/20 flex items-center justify-center">
                  <Baby size={18} className="text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 dark:text-night-50">
                    {d.type === "pee" ? "小便" : d.type === "poop" ? "大便" : "大小便"}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {formatDateTime(d.time, "MM-dd HH:mm")}
                    {d.note && ` · ${d.note}`}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("确定删除这条尿布记录吗？")) deleteDiaper(d.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          });
        });
    }

    if (activeTab === "all" || activeTab === "sleep") {
      babySleepes
        .filter((s) => {
          const t = new Date(s.startTime).getTime();
          return t >= startMs && t <= endMs;
        })
        .forEach((s) => {
          result.push({
            id: s.id,
            type: "sleep",
            time: s.startTime,
            sortTime: new Date(s.startTime).getTime(),
            node: (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 dark:bg-night-200/5">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-400/20 flex items-center justify-center">
                  <Moon size={18} className="text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-night-50">
                      {formatDateTime(s.startTime, "MM-dd HH:mm")} -{" "}
                      {s.endTime ? formatDateTime(s.endTime, "HH:mm") : "进行中"}
                    </span>
                    <span className="text-sm text-violet-500 font-semibold bg-violet-100 dark:bg-violet-400/20 px-2 py-0.5 rounded-full">
                      {formatDuration(s.duration)}
                    </span>
                  </div>
                  {s.note && <p className="text-xs text-gray-400 mt-0.5">{s.note}</p>}
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("确定删除这条睡眠记录吗？")) deleteSleep(s.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          });
        });
    }

    if (activeTab === "all" || activeTab === "todo") {
      babyTodos
        .filter((t) => {
          const todoDate = new Date(t.date).getTime();
          return todoDate >= startMs && todoDate <= endMs;
        })
        .forEach((t) => {
          const CatIcon = todoCategoryIcons[t.category];
          result.push({
            id: t.id,
            type: "todo",
            time: t.date,
            sortTime: new Date(t.date).getTime(),
            node: (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50/50 dark:bg-night-200/5">
                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-400/20 flex items-center justify-center">
                  <CatIcon size={18} className="text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", t.completed ? "text-gray-400 line-through" : "text-gray-700 dark:text-night-50")}>
                      {t.title}
                    </span>
                    <span className="text-xs text-gray-400 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-night-200/10">
                      {todoCategoryLabels[t.category]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span>{formatDate(t.date)}</span>
                    {t.completed ? (
                      <span className="text-mint-500 flex items-center gap-0.5"><CheckSquare size={10} /> 已完成</span>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-0.5"><Square size={10} /> 未完成</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("确定删除这条待办记录吗？")) deleteTodo(t.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          });
        });
    }

    return result.sort((a, b) => b.sortTime - a.sortTime);
  }, [activeTab, babyFeedings, babyDiapers, babySleepes, babyTodos, startMs, endMs, deleteFeeding, deleteDiaper, deleteSleep, deleteTodo]);

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-400/20 flex items-center justify-center">
            <History size={16} className="text-pink-500" />
          </div>
          <h3 className="section-title mb-0">历史记录中心</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-night-100 mb-1">
              开始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-base text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-night-100 mb-1">
              结束日期
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-base text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.key
                  ? "bg-primary-400 text-white"
                  : "bg-gray-50 dark:bg-night-200/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-night-200/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {records.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">该范围内暂无记录</p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {records.map((r) => (
              <div key={`${r.type}-${r.id}`}>{r.node}</div>
            ))}
          </div>
        )}

        <div className="mt-3 text-center text-xs text-gray-400">
          共 {records.length} 条记录
        </div>
      </Card>
    </div>
  );
}
