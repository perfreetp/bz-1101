import React, { useState, useMemo } from "react";
import { Users, Link2, Copy, Check, Share2, QrCode, Eye } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useBabyStore } from "@/store/baby";
import { useTodoStore } from "@/store/todo";
import { useFeedingStore } from "@/store/feeding";
import { useSleepStore } from "@/store/sleep";
import { useGrowthStore } from "@/store/growth";
import { useVaccineStore } from "@/store/vaccine";
import { cn } from "@/lib/utils";
import { formatAge, todayStr, isOverlappingDate } from "@/utils/date";
import { encodeShareData } from "@/utils/share";
import type { SleepRecord } from "@/types";

export default function FamilyShare() {
  const { currentBabyId, getCurrentBaby } = useBabyStore();
  const { getTodayTodos } = useTodoStore();
  const { getTodayFeedings, getTodayDiapers } = useFeedingStore();
  const { getBabySleeps, getTodayTotalMinutes } = useSleepStore();
  const { getLatestGrowth } = useGrowthStore();
  const { getBabyVaccines } = useVaccineStore();

  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const baby = getCurrentBaby();
  const today = todayStr();
  const todos = currentBabyId ? getTodayTodos(currentBabyId) : [];
  const feedings = currentBabyId ? getTodayFeedings(currentBabyId) : [];
  const diapers = currentBabyId ? getTodayDiapers(currentBabyId) : [];
  const allSleeps = currentBabyId ? getBabySleeps(currentBabyId) : [];
  const sleeps = allSleeps.filter(
    (s) => isOverlappingDate(s.startTime, s.endTime, today)
  );
  const sleepMinutes = currentBabyId ? getTodayTotalMinutes(currentBabyId) : 0;
  const growth = currentBabyId ? getLatestGrowth(currentBabyId) : null;
  const vaccines = currentBabyId
    ? getBabyVaccines(currentBabyId).filter((v) => !v.completedDate).slice(0, 3)
    : [];

  const shareUrl = useMemo(() => {
    if (!baby) return "";
    const payload = {
      baby,
      date: today,
      feedings,
      diapers,
      sleeps: sleeps as SleepRecord[],
      totalSleepMin: sleepMinutes,
      todos,
      latestGrowth: growth,
      vaccines,
    };
    const encoded = encodeShareData(payload);
    return `${window.location.origin}${window.location.pathname.replace(/\/$/, "")}/share#${encoded}`;
  }, [baby, today, feedings, diapers, sleeps, sleepMinutes, todos, growth, vaccines]);

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
              生成只读链接，让家人在任意设备查看宝宝的最新状态
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="section-title">
          <Share2 size={20} className="text-primary-500" /> 分享链接
        </h3>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-night-200/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <QrCode size={16} className="text-primary-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-night-100">
                链接说明
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-night-100 leading-relaxed">
              ✨ 宝宝数据已直接编码到链接中，家人在任意设备或浏览器打开即可查看，无需登录，不依赖本地缓存
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
                {copied ? <Check size={18} className="mr-1" /> : <Copy size={18} className="mr-1" />}
                {copied ? "已复制" : "复制"}
              </Button>
            </div>
          </div>

          <button
            onClick={() => setShowPreview(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-primary-200 dark:border-night-200/30 text-primary-500 hover:bg-primary-50 dark:hover:bg-night-200/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Eye size={18} />
            预览家人看到的只读页面
          </button>
        </div>
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
              {growth && (
                <div className="ml-auto text-right text-xs text-gray-500">
                  <div>身高 {growth.height}cm</div>
                  <div>体重 {growth.weight}kg</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="今日喂奶" value={feedings.filter((f) => f.type === "milk").length + "次"} />
              <MiniStat label="换尿布" value={diapers.length + "次"} />
              <MiniStat label="睡眠" value={Math.round(sleepMinutes / 60) + "h"} />
            </div>

            {todos.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">今日待办：</p>
                <div className="space-y-1.5">
                  {todos.slice(0, 3).map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-sm">
                      <span
                        className={cn(
                          "w-4 h-4 rounded-full flex-shrink-0",
                          t.completed ? "bg-emerald-400" : "border-2 border-gray-300"
                        )}
                      />
                      <span
                        className={cn(
                          t.completed ? "text-gray-400 line-through" : "text-gray-600 dark:text-night-100"
                        )}
                      >
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100 dark:border-night-200/10">
              🔒 只读模式 · 家人无法修改任何数据
            </p>
          </div>
        )}
      </Card>

      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="🔍 家人看到的只读页面（新窗口预览）"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            点击下方按钮可在新标签页打开只读页面，验证家人看到的效果：
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowPreview(false)}>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-night-200/5 rounded-xl p-3 text-center">
      <p className="text-lg font-bold text-gray-800 dark:text-night-50">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
