import {
  CalendarCheck2,
  Milk,
  Moon,
  Package,
  BookOpen,
  Users,
  BarChart3,
  Clock,
} from "lucide-react";
import { useUiStore } from "@/store/ui";
import type { ActiveTab } from "@/types";
import { cn } from "@/lib/utils";

const tabs: { id: ActiveTab; label: string; icon: typeof CalendarCheck2 }[] = [
  { id: "today", label: "今日计划", icon: CalendarCheck2 },
  { id: "feeding", label: "喂养记录", icon: Milk },
  { id: "sleep", label: "睡眠记录", icon: Moon },
  { id: "supply", label: "用品清单", icon: Package },
  { id: "knowledge", label: "知识卡片", icon: BookOpen },
  { id: "share", label: "家庭共享", icon: Users },
  { id: "summary", label: "数据汇总", icon: BarChart3 },
  { id: "history", label: "历史记录", icon: Clock },
];

export default function TabNav() {
  const { activeTab, setActiveTab } = useUiStore();

  return (
    <div className="container px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                active
                  ? "bg-primary-400 text-white shadow-soft"
                  : "bg-white/70 dark:bg-night-800/70 text-gray-600 dark:text-night-100 hover:bg-primary-50 dark:hover:bg-night-200/10"
              )}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
