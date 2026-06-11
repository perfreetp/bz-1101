import React, { useState } from "react";
import { Heart, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Card from "@/components/common/Card";
import { useBabyStore } from "@/store/baby";
import { useKnowledgeStore } from "@/store/knowledge";
import { knowledgeCards } from "@/data/knowledgeCards";
import { cn } from "@/lib/utils";
import { getAgeMonths } from "@/utils/date";
import type { KnowledgeCard as KCT, KnowledgeCard } from "@/types";

const categoryLabels: Record<KCT["category"], { label: string; emoji: string }> = {
  feeding: { label: "喂养", emoji: "🍼" },
  sleep: { label: "睡眠", emoji: "😴" },
  health: { label: "健康", emoji: "💊" },
  development: { label: "发育", emoji: "🌱" },
  safety: { label: "安全", emoji: "🛡️" },
};

type FilterType = "age" | "all" | "favorites" | KCT["category"];

export default function KnowledgeCards() {
  const { currentBabyId, getCurrentBaby } = useBabyStore();
  const { isFavorite, toggleFavorite, getFavoriteCards } = useKnowledgeStore();

  const baby = getCurrentBaby();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FilterType>("age");

  let filteredCards: KCT[] = [];
  if (filter === "all") {
    filteredCards = knowledgeCards;
  } else if (filter === "favorites") {
    filteredCards = currentBabyId ? getFavoriteCards(currentBabyId) : [];
  } else if (filter === "age") {
    if (baby) {
      const age = getAgeMonths(baby.birthday);
      filteredCards = knowledgeCards.filter((c) => age >= c.minAgeMonths && age <= c.maxAgeMonths);
      if (filteredCards.length === 0) filteredCards = knowledgeCards.slice(0, 5);
    } else {
      filteredCards = knowledgeCards;
    }
  } else {
    filteredCards = knowledgeCards.filter((c) => c.category === filter);
  }

  const total = filteredCards.length;
  const card = total > 0 ? filteredCards[currentIndex % total] : null;

  function next() {
    if (total > 0) setCurrentIndex((i) => (i + 1) % total);
  }
  function prev() {
    if (total > 0) setCurrentIndex((i) => (i - 1 + total) % total);
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">
            <Filter size={20} className="text-primary-500" /> 知识卡片
          </h3>
          {baby && (
            <span className="text-xs text-gray-400">
              宝宝 {getAgeMonths(baby.birthday)} 个月
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <FilterChip active={filter === "age"} onClick={() => { setFilter("age"); setCurrentIndex(0); }}>
            🌱 适合月龄
          </FilterChip>
          <FilterChip active={filter === "favorites"} onClick={() => { setFilter("favorites"); setCurrentIndex(0); }}>
            ❤️ 收藏
          </FilterChip>
          <FilterChip active={filter === "all"} onClick={() => { setFilter("all"); setCurrentIndex(0); }}>
            📚 全部
          </FilterChip>
          {(Object.keys(categoryLabels) as KCT["category"][]).map((cat) => (
            <FilterChip
              key={cat}
              active={filter === cat}
              onClick={() => { setFilter(cat); setCurrentIndex(0); }}
            >
              {categoryLabels[cat].emoji} {categoryLabels[cat].label}
            </FilterChip>
          ))}
        </div>

        {total === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-400 text-sm">
              {filter === "favorites" ? "还没有收藏的卡片" : "暂无相关卡片"}
            </p>
          </div>
        ) : card && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[92%] h-full bg-primary-50 dark:bg-night-200/10 rounded-3xl -mt-4" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[96%] h-full bg-primary-100/50 dark:bg-night-200/5 rounded-3xl -mt-2" />
            </div>

            <div
              className="relative bg-gradient-to-br from-white to-cream-100 dark:from-night-800 dark:to-night-900 rounded-3xl p-6 shadow-card dark:shadow-card-dark border border-primary-50 dark:border-night-200/10 min-h-[320px] animate-fade-in"
              key={card.id}
            >
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <span className="text-xs text-gray-400 bg-white/80 dark:bg-night-800/80 px-2 py-1 rounded-full">
                  {currentIndex + 1}/{total}
                </span>
                <button
                  onClick={() => currentBabyId && toggleFavorite(currentBabyId, card.id)}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    currentBabyId && isFavorite(currentBabyId, card.id)
                      ? "bg-red-50 text-red-500"
                      : "bg-gray-50 dark:bg-night-200/10 text-gray-400 hover:text-red-400"
                  )}
                >
                  <Heart
                    size={18}
                    fill={currentBabyId && isFavorite(currentBabyId, card.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>

              <div className="mb-4">
                <div className="text-5xl mb-3 animate-float">{card.emoji}</div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-night-50 mb-1">
                  {card.title}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-400/20 text-primary-600 dark:text-primary-300">
                    {categoryLabels[card.category].emoji} {categoryLabels[card.category].label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {card.minAgeMonths === 0 ? "0" : card.minAgeMonths}-{card.maxAgeMonths}个月
                  </span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-night-100 leading-relaxed text-[15px]">
                {card.content}
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full bg-white dark:bg-night-800 shadow-card dark:shadow-card-dark flex items-center justify-center text-gray-500 hover:text-primary-500 hover:shadow-soft transition-all active:scale-95"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="flex gap-1.5">
                {filteredCards.slice(0, 10).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 rounded-full transition-all",
                      i === currentIndex % 10 ? "h-6 bg-primary-400" : "h-2 bg-primary-100 dark:bg-night-200/30"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-12 h-12 rounded-full bg-white dark:bg-night-800 shadow-card dark:shadow-card-dark flex items-center justify-center text-gray-500 hover:text-primary-500 hover:shadow-soft transition-all active:scale-95"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
        active
          ? "bg-primary-400 text-white shadow-soft"
          : "bg-white dark:bg-night-800 text-gray-500 dark:text-night-100 hover:bg-primary-50 dark:hover:bg-night-200/10 border border-gray-100 dark:border-night-200/20"
      )}
    >
      {children}
    </button>
  );
}
