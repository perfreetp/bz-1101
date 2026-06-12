import React, { useState, useMemo } from "react";
import {
  Users,
  Link2,
  Copy,
  Check,
  Share2,
  Eye,
  Baby,
  TrendingUp,
  Calendar,
  FileText,
  MessageCircle,
} from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useBabyStore } from "@/store/baby";
import { useTodoStore } from "@/store/todo";
import { useFeedingStore } from "@/store/feeding";
import { useSleepStore } from "@/store/sleep";
import { useGrowthStore } from "@/store/growth";
import { useVaccineStore } from "@/store/vaccine";
import { useFeedbackStore } from "@/store/feedback";
import { cn } from "@/lib/utils";
import { formatAge, todayStr, isOverlappingDate, formatDate } from "@/utils/date";
import { encodeShareData, type ShareMode } from "@/utils/share";
import { getPeriodSummary } from "@/utils/stats";

type ShareModeInfo = {
  value: ShareMode;
  label: string;
  desc: string;
  icon: React.ReactNode;
};

const shareModes: ShareModeInfo[] = [
  { value: "today", label: "今日概况", desc: "今日记录+待办+概览", icon: <Calendar size={18} /> },
  { value: "growth", label: "成长数据", desc: "身高体重生长趋势", icon: <TrendingUp size={18} /> },
  { value: "week7", label: "最近7天", desc: "7天喂养睡眠汇总", icon: <FileText size={18} /> },
  { value: "full", label: "完整今日", desc: "完整今日+疫苗提醒", icon: <Baby size={18} /> },
];

export default function FamilyShare() {
  const { currentBabyId, getCurrentBaby } = useBabyStore();
  const { getBabyFeedbacks } = useFeedbackStore();
  const { getTodayTodos, todos } = useTodoStore();
  const { getTodayFeedings, getTodayDiapers, feedingRecords, diaperRecords } = useFeedingStore();
  const { getBabySleeps, getTodayTotalMinutes, sleepRecords } = useSleepStore();
  const { getLatestGrowth, getBabyGrowth } = useGrowthStore();
  const { getBabyVaccines } = useVaccineStore();

  const [mode, setMode] = useState<ShareMode>("today");
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const baby = getCurrentBaby();
  const today = todayStr();

  const feedbackGrouped = useMemo(() => {
    if (!currentBabyId) return { dates: [], totalViewed: 0, totalNotes: 0 };
    const all = getBabyFeedbacks(currentBabyId);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = all.filter((f) => new Date(f.createdAt) >= sevenDaysAgo);
    const viewedSet = new Set(recent.filter((f) => f.type === "viewed").map((f) => f.visitorName));
    const notes = recent.filter((f) => f.type === "note");
    const dateMap = new Map<string, typeof recent>();
    recent.forEach((f) => {
      const d = f.shareDate;
      if (!dateMap.has(d)) dateMap.set(d, []);
      dateMap.get(d)!.push(f);
    });
    const dates = Array.from(dateMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        viewed: items.filter((i) => i.type === "viewed"),
        notes: items.filter((i) => i.type === "note"),
      }));
    return { dates, totalViewed: viewedSet.size, totalNotes: notes.length };
  }, [currentBabyId, getBabyFeedbacks]);

  const shareUrl = useMemo(() => {
    if (!baby || !currentBabyId) return "";

    const payload: any = {
      mode,
      baby,
      date: today,
    };

    const dayFeedings = getTodayFeedings(currentBabyId);
    const dayDiapers = getTodayDiapers(currentBabyId);
    const allSleeps = getBabySleeps(currentBabyId);
    const daySleeps = allSleeps.filter((s) =>
      isOverlappingDate(s.startTime, s.endTime, today)
    );
    const dayTodos = getTodayTodos(currentBabyId);
    const sleepMin = getTodayTotalMinutes(currentBabyId);
    const growth = getLatestGrowth(currentBabyId);
    const vaccines = getBabyVaccines(currentBabyId)
      .filter((v) => !v.completedDate)
      .slice(0, 3);

    if (mode === "today" || mode === "full") {
      payload.feedings = dayFeedings;
      payload.diapers = dayDiapers;
      payload.sleeps = daySleeps;
      payload.totalSleepMin = sleepMin;
      payload.todos = dayTodos;
      payload.latestGrowth = growth;
      if (mode === "full") {
        payload.vaccines = vaccines;
      }
    }

    if (mode === "growth") {
      payload.growthRecords = getBabyGrowth(currentBabyId);
      payload.latestGrowth = growth;
    }

    if (mode === "week7") {
      const summary = getPeriodSummary(
        7,
        today,
        feedingRecords.filter((f) => f.babyId === currentBabyId),
        diaperRecords.filter((d) => d.babyId === currentBabyId),
        sleepRecords.filter((s) => s.babyId === currentBabyId),
        todos.filter((t) => t.babyId === currentBabyId),
        getBabyGrowth(currentBabyId)
      );
      payload.dailyStats = summary.daily;
      payload.weekStartDate = summary.startDate;
      payload.weekEndDate = summary.endDate;
      payload.latestGrowth = growth;
    }

    const encoded = encodeShareData(payload);
    return `${window.location.origin}${window.location.pathname.replace(/\/$/, "")}/share#${encoded}`;
  }, [mode, baby, currentBabyId, today, feedingRecords, diaperRecords, sleepRecords, todos, getTodayFeedings, getTodayDiapers, getBabySleeps, getTodayTodos, getTodayTotalMinutes, getLatestGrowth, getBabyGrowth, getBabyVaccines]);

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("复制失败，请手动复制：" + shareUrl);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-900/20 dark:to-violet-900/20 border-0">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/70 dark:bg-night-800/50 flex items-center justify-center">
            <Users size={28} className="text-primary-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 dark:text-night-50">家庭共享</h3>
            <p className="text-sm text-gray-500 dark:text-night-100 mt-1">
              选择分享内容，生成只读链接发给家人查看
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="section-title">
          <Share2 size={20} className="text-primary-500" /> 分享内容
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {shareModes.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={cn(
                "p-3 rounded-xl text-left transition-all border-2",
                mode === m.value
                  ? "border-primary-400 bg-primary-50 dark:bg-primary-400/10"
                  : "border-transparent bg-gray-50 dark:bg-night-200/5 hover:border-gray-200"
              )}
            >
              <div
                className={cn("mb-1", mode === m.value ? "text-primary-500" : "text-gray-400")}
              >
                {m.icon}
              </div>
              <p
                className={cn(
                  "text-sm font-medium",
                  mode === m.value
                    ? "text-primary-700 dark:text-primary-300"
                    : "text-gray-700 dark:text-night-100"
                )}
              >
                {m.label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-night-200/10 rounded-2xl p-4 mb-4">
          <p className="text-xs text-gray-500 dark:text-night-100 leading-relaxed">
            ✨ 数据已直接编码到链接中，家人在任意设备或浏览器打开即可查看，无需登录，不依赖本地缓存
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">
            分享链接
          </label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-night-200/10 rounded-xl text-xs text-gray-500 dark:text-night-100 break-all font-mono min-h-[44px] max-h-[100px] overflow-y-auto">
              {shareUrl || "请先添加宝宝档案"}
            </div>
            <Button
              onClick={copyLink}
              disabled={!shareUrl}
              className={cn("flex-shrink-0", copied && "bg-emerald-500 hover:bg-emerald-500")}
            >
              {copied ? (
                <Check size={18} className="mr-1" />
              ) : (
                <Copy size={18} className="mr-1" />
              )}
              {copied ? "已复制" : "复制"}
            </Button>
          </div>
        </div>

        <button
          onClick={() => setShowPreview(true)}
          className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-primary-200 dark:border-night-200/30 text-primary-500 hover:bg-primary-50 dark:hover:bg-night-200/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Eye size={18} />
          预览家人看到的只读页面
        </button>
      </Card>

      <Card>
        <h3 className="section-title">
          <Link2 size={20} className="text-primary-500" /> 家人将看到
        </h3>

        {baby && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-primary-50/50 dark:bg-night-200/5 rounded-xl">
              <span className="text-3xl">{baby.avatar}</span>
              <div>
                <p className="font-medium text-gray-800 dark:text-night-50">{baby.name}</p>
                <p className="text-xs text-gray-400">{formatAge(baby.birthday)}</p>
              </div>
            </div>

            <p className="text-xs text-gray-400">当前模式：{shareModes.find((m) => m.value === mode)?.label}</p>

            <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100 dark:border-night-200/10">
              🔒 只读模式 · 家人无法修改任何数据
            </p>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="section-title">
          <MessageCircle size={20} className="text-primary-500" /> 家人反馈
        </h3>

        {feedbackGrouped.dates.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">暂无家人反馈，分享链接后家人可以在此留言</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-night-100">
              <span className="flex items-center gap-1">
                <Eye size={14} className="text-emerald-500" />
                {feedbackGrouped.totalViewed}人已查看
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} className="text-primary-500" />
                {feedbackGrouped.totalNotes}条留言
              </span>
            </div>

            {feedbackGrouped.dates.map((group) => (
              <div key={group.date} className="rounded-xl bg-gray-50 dark:bg-night-200/10 p-3">
                <p className="text-xs font-medium text-gray-500 dark:text-night-100 mb-2">
                  {formatDate(group.date)}
                </p>
                {group.viewed.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {group.viewed.map((v) => (
                      <span
                        key={v.id}
                        className="inline-flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full"
                      >
                        <Eye size={12} />
                        {v.visitorName}
                      </span>
                    ))}
                  </div>
                )}
                {group.notes.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-2 mb-1.5 last:mb-0"
                  >
                    <MessageCircle size={14} className="text-primary-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                        {n.visitorName}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-night-100 truncate">
                        {n.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="🔍 预览只读页面"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            点击下方按钮可在新标签页打开只读页面，验证家人看到的效果：
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowPreview(false)}
            >
              关闭
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (shareUrl) window.open(shareUrl, "_blank");
              }}
              disabled={!shareUrl}
            >
              🚀 在新窗口打开
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
