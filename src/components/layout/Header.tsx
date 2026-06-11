import React, { useEffect } from "react";
import { Moon, Sun, Baby, ChevronDown, Plus } from "lucide-react";
import { useBabyStore } from "@/store/baby";
import { useUiStore } from "@/store/ui";
import { formatAge, formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";
import AddBabyModal from "./AddBabyModal";
import { useState } from "react";

export default function Header() {
  const { babies, currentBabyId, setCurrentBaby } = useBabyStore();
  const { darkMode, toggleDarkMode } = useUiStore();
  const [showBabyDropdown, setShowBabyDropdown] = useState(false);
  const [showAddBaby, setShowAddBaby] = useState(false);
  const currentBaby = babies.find((b) => b.id === currentBabyId);

  useEffect(() => {
    function handleClick() {
      setShowBabyDropdown(false);
    }
    if (showBabyDropdown) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [showBabyDropdown]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-night-800/70 border-b border-primary-100/50 dark:border-night-200/10">
      <div className="container flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3">
          <span className="title-cute">🌸 宝妈育儿助手</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-sm text-gray-500 dark:text-night-100">
            {formatDate(new Date(), "yyyy年MM月dd日 EEEE")}
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBabyDropdown((v) => !v);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-night-800 hover:bg-primary-100 dark:hover:bg-night-200/10 transition-colors"
              )}
            >
              <span className="text-xl">{currentBaby?.avatar || "👶"}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-night-50 max-w-[100px] truncate">
                {currentBaby?.name || "小宝贝"}
              </span>
              <span className="text-xs text-gray-400 dark:text-night-200">
                {currentBaby ? formatAge(currentBaby.birthday) : ""}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {showBabyDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-night-800 rounded-2xl shadow-card dark:shadow-card-dark border border-primary-100/50 dark:border-night-200/10 overflow-hidden animate-fade-in">
              <div className="p-1">
                {babies.map((baby) => (
                  <button
                    key={baby.id}
                    onClick={() => {
                      setCurrentBaby(baby.id);
                      setShowBabyDropdown(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left",
                      baby.id === currentBabyId
                        ? "bg-primary-50 dark:bg-night-200/10"
                        : "hover:bg-gray-50 dark:hover:bg-night-200/5"
                    )}
                  >
                    <span className="text-xl">{baby.avatar}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800 dark:text-night-50">
                        {baby.name}
                      </div>
                      <div className="text-xs text-gray-400">{formatAge(baby.birthday)}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-night-200/10 p-2">
                <button
                  onClick={() => {
                    setShowAddBaby(true);
                    setShowBabyDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-primary-500 hover:bg-primary-50 dark:hover:bg-night-200/10 transition-colors"
                >
                  <Plus size={16} />
                  添加宝宝
                </button>
              </div>
            </div>
            )}
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-primary-50 dark:hover:bg-night-200/10 transition-colors"
            aria-label="切换主题"
          >
            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-500" />}
          </button>
        </div>
      </div>

      <AddBabyModal open={showAddBaby} onClose={() => setShowAddBaby(false)} />
    </header>
  );
}
