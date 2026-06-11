import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Baby,
  Milk,
  Moon,
  Ruler,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Syringe,
  Stethoscope,
} from "lucide-react";
import Card from "@/components/common/Card";
import { useBabyStore } from "@/store/baby";
import { useFeedingStore } from "@/store/feeding";
import { useSleepStore } from "@/store/sleep";
import { useTodoStore } from "@/store/todo";
import { useGrowthStore } from "@/store/growth";
import { useVaccineStore } from "@/store/vaccine";
import { useUiStore } from "@/store/ui";
import { formatAge, formatDateTime, formatDuration, formatDate, todayStr } from "@/utils/date";
import { cn } from "@/lib/utils";
import type { TodoItem } from "@/types";

const categoryIcons: Record<TodoItem["category"], typeof Baby> = {
  vaccine: Syringe,
  checkup: Stethoscope,
  shopping: Baby,
  other: Baby,
};

const categoryLabels: Record<TodoItem["category"], string> = {
  vaccine: "疫苗",
  checkup: "体检",
  shopping: "购物",
  other: "其他",
};

export default function ShareView() {
  const { code } = useParams<{ code: string }>();
  const shareCode = useUiStore((s) => s.shareCode);
  const { babies, currentBabyId } = useBabyStore.getState();
  const validCode = shareCode && code && code.toUpperCase() === shareCode;

  const baby = useBabyStore((s) => s.babies.find((b) => b.id === s.currentBabyId));
  const today = todayStr();

  const feedings = useFeedingStore((s) =>
    s.feedingRecords.filter(
      (r) => r.babyId === currentBabyId && new Date(r.time).toISOString().split("T")[0] === today
    ).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  );
  const diapers = useFeedingStore((s) =>
    s.diaperRecords.filter(
      (r) => r.babyId === currentBabyId && new Date(r.time).toISOString().split("T")[0] === today
    ).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  );
  const sleeps = useSleepStore((s) =>
    s.sleepRecords.filter((r) => r.babyId === currentBabyId && r.endTime)
  );
  const todaySleeps = sleeps.filter(
    (s) => new Date(s.startTime).toISOString().split("T")[0] === today
  );
  const totalSleepMin = todaySleeps.reduce((sum, s) => sum + s.duration, 0);

  const todos = useTodoStore((s) =>
    s.todos.filter((t) => t.babyId === currentBabyId && t.date === today)
      .sort((a, b) => Number(a.completed) - Number(b.completed))
  );

  const latestGrowth = useGrowthStore((s) => s.getLatestGrowth(currentBabyId || ""));
  const vaccines = useVaccineStore((s) =>
    s.getBabyVaccines(currentBabyId || "").filter((v) => !v.completedDate).slice(0, 3)
  );

  const stats = useMemo(() => ({
    milkCount: feedings.filter((f) => f.type === "milk").length,
    milkAmount: feedings.filter((f) => f.type === "milk").reduce((s, f) => s + f.amount, 0),
    solidsCount: feedings.filter((f) => f.type === "solids").length,
    diaperCount: diapers.length,
    sleepCount: todaySleeps.length,
  }), [feedings, diapers, todaySleeps]);

  if (!validCode || !baby) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-night-50 mb-2">
            分享链接无效或已过期
          </h2>
          <p className="text-sm text-gray-500 dark:text-night-100 mb-6">
            请让分享者重新生成最新的分享链接
          </p>
          <Link to="/" className="btn-primary inline-flex">
            <ArrowLeft size={16} className="mr-1" />
            返回首页
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-night-800/70 border-b border-primary-100/50 dark:border-night-200/10">
        <div className="container flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <span className="font-cute text-2xl text-primary-500 dark:text-primary-300">🌸 宝妈育儿助手</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-400/20 text-blue-600 dark:text-blue-300">
              只读模式
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{baby.avatar}</span>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700 dark:text-night-50">{baby.name}</p>
              <p className="text-xs text-gray-400">{formatAge(baby.birthday)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-5 max-w-2xl">
        <div className="bg-gradient-to-br from-primary-50 to-mint-50 dark:from-primary-900/20 dark:to-mint-900/20 rounded-2xl p-5">
          <h3 className="text-base font-bold text-gray-800 dark:text-night-50 mb-3 flex items-center gap-2">
            <Ruler size={18} className="text-primary-500" /> 宝宝概览
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <StatMini label="生日" value={formatDate(baby.birthday, "MM-dd")} />
            {latestGrowth ? (
              <>
                <StatMini label="身高" value={`${latestGrowth.height}cm`} />
                <StatMini label="体重" value={`${latestGrowth.weight}kg`} />
              </>
            ) : (
              <>
                <StatMini label="身高" value="--" />
                <StatMini label="体重" value="--" />
              </>
            )}
          </div>
        </div>

        {vaccines.length > 0 && (
          <Card>
            <h3 className="section-title">
              <Syringe size={18} className="text-primary-500" /> 近期安排
            </h3>
            <div className="space-y-2">
              {vaccines.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-orange-50 dark:bg-orange-400/10">
                  {v.type === "vaccine" ? (
                    <Syringe size={16} className="text-orange-500" />
                  ) : (
                    <Stethoscope size={16} className="text-orange-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-night-50">{v.name}</p>
                    <p className="text-xs text-gray-400">{v.plannedDate}</p>
                  </div>
                  <span className="text-xs text-orange-500">
                    {v.type === "vaccine" ? "疫苗" : "体检"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <h3 className="section-title">
            <Milk size={18} className="text-primary-500" /> 今日记录 · {formatDate(today, "MM月dd日")}
          </h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <StatMini label="喂奶" value={`${stats.milkCount}次`} hint={stats.milkAmount > 0 ? `${stats.milkAmount}ml` : undefined} />
            <StatMini label="辅食" value={`${stats.solidsCount}次`} />
            <StatMini label="换尿布" value={`${stats.diaperCount}次`} />
            <StatMini label="睡眠" value={formatDuration(totalSleepMin)} />
          </div>

          {feedings.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">🍼 喂养记录</p>
              <div className="space-y-1.5">
                {feedings.slice(0, 5).map((f) => (
                  <div key={f.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 text-xs w-10">{formatDateTime(f.time, "HH:mm")}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-xs",
                      f.type === "milk" ? "bg-pink-100 text-pink-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {f.type === "milk" ? "奶" : "辅食"}
                    </span>
                    <span className="text-gray-700 dark:text-night-50 flex-1">
                      {f.amount}{f.unit}{f.note && ` · ${f.note}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {diapers.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">👶 换尿布记录</p>
              <div className="space-y-1.5">
                {diapers.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 text-xs w-10">{formatDateTime(d.time, "HH:mm")}</span>
                    <span className="px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-600">
                      {d.type === "pee" ? "小便" : d.type === "poop" ? "大便" : "大小便"}
                    </span>
                    {d.note && <span className="text-gray-500">{d.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {todaySleeps.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">😴 睡眠记录</p>
              <div className="space-y-1.5">
                {todaySleeps.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 text-xs w-28">
                      {formatDateTime(s.startTime, "HH:mm")} - {s.endTime ? formatDateTime(s.endTime, "HH:mm") : "进行中"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-xs bg-violet-100 text-violet-600">
                      {formatDuration(s.duration)}
                    </span>
                    {s.note && <span className="text-gray-500">{s.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {feedings.length === 0 && diapers.length === 0 && todaySleeps.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">今日暂无记录</p>
          )}
        </Card>

        <Card>
          <h3 className="section-title">
            <CheckCircle2 size={18} className="text-primary-500" /> 今日待办
          </h3>
          {todos.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm">今日暂无待办</p>
          ) : (
            <div className="space-y-2">
              {todos.map((t) => {
                const CatIcon = categoryIcons[t.category];
                return (
                  <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl">
                    {t.completed ? (
                      <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle size={18} className="text-gray-300 flex-shrink-0" />
                    )}
                    <CatIcon size={14} className={cn("flex-shrink-0", t.completed ? "text-gray-400" : "text-primary-400")} />
                    <span className={cn(
                      "text-sm flex-1",
                      t.completed ? "text-gray-400 line-through" : "text-gray-700 dark:text-night-50"
                    )}>
                      {t.title}
                    </span>
                    <span className="text-xs text-gray-400 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-night-200/10">
                      {categoryLabels[t.category]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="section-title">
            <Ruler size={18} className="text-primary-500" /> 生长数据
          </h3>
          {latestGrowth ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-400/10">
                <p className="text-xs text-gray-400">最新身高</p>
                <p className="text-2xl font-bold text-sky-600 dark:text-sky-300">{latestGrowth.height}cm</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(latestGrowth.date, "MM/dd")}</p>
              </div>
              <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-400/10">
                <p className="text-xs text-gray-400">最新体重</p>
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-300">{latestGrowth.weight}kg</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(latestGrowth.date, "MM/dd")}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-6 text-sm">暂无生长记录</p>
          )}
        </Card>

        <p className="text-center text-xs text-gray-300 dark:text-night-200 pt-2">
          🔒 只读模式 · 此内容由 {baby.name} 的家长分享
        </p>
      </main>
    </div>
  );
}

function StatMini({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/70 dark:bg-night-800/50 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-base font-bold text-gray-800 dark:text-night-50 mt-0.5">{value}</p>
      {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}
