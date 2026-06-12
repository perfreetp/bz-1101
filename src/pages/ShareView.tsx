import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Calendar,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/common/Card";
import {
  formatAge,
  formatDateTime,
  formatDuration,
  formatDate,
} from "@/utils/date";
import { decodeShareData, type SharePayload } from "@/utils/share";
import type { DailyStats } from "@/utils/stats";
import { cn } from "@/lib/utils";
import type { TodoItem, GrowthRecord } from "@/types";
import { useFeedbackStore } from "@/store/feedback";

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
  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) {
      setError("缺少分享数据");
      return;
    }
    const data = decodeShareData(hash);
    if (!data) {
      setError("分享链接已损坏或格式不正确");
      return;
    }
    setPayload(data);
  }, []);

  if (error || !payload) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-night-50 mb-2">
            {error || "分享链接无效"}
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

  const { baby, mode } = payload;

  return (
    <div className="min-h-screen pb-10">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-night-800/70 border-b border-primary-100/50 dark:border-night-200/10">
        <div className="container flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <span className="font-cute text-2xl text-primary-500 dark:text-primary-300">
              🌸 宝妈育儿助手
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-400/20 text-blue-600 dark:text-blue-300">
              只读模式
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{baby.avatar}</span>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700 dark:text-night-50">
                {baby.name}
              </p>
              <p className="text-xs text-gray-400">{formatAge(baby.birthday)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-5 max-w-2xl">
        <BabyOverview payload={payload} />

        {mode === "today" && <TodayContent payload={payload} />}
        {mode === "full" && <FullContent payload={payload} />}
        {mode === "growth" && <GrowthContent payload={payload} />}
        {mode === "week7" && <Week7Content payload={payload} />}

        <FamilyFeedbackSection babyId={baby.id} shareDate={payload.date} />

        <p className="text-center text-xs text-gray-300 dark:text-night-200 pt-2">
          🔒 只读模式 · 此内容由 {baby.name} 的家长分享 · 无法修改任何数据
        </p>
      </main>
    </div>
  );
}

function BabyOverview({ payload }: { payload: SharePayload }) {
  const { baby, latestGrowth } = payload;

  return (
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
  );
}

function TodayContent({ payload }: { payload: SharePayload }) {
  const { date, feedings = [], diapers = [], sleeps = [], totalSleepMin = 0, todos = [], latestGrowth } = payload;

  const stats = useMemo(() => {
    return {
      milkCount: feedings.filter((f) => f.type === "milk").length,
      milkAmount: feedings.filter((f) => f.type === "milk").reduce((s, f) => s + f.amount, 0),
      solidsCount: feedings.filter((f) => f.type === "solids").length,
      diaperCount: diapers.length,
      sleepCount: sleeps.length,
    };
  }, [feedings, diapers, sleeps]);

  return (
    <>
      <Card>
        <h3 className="section-title">
          <Milk size={18} className="text-primary-500" /> 今日记录 ·{" "}
          {formatDate(date, "MM月dd日")}
        </h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <StatMini
            label="喂奶"
            value={`${stats.milkCount}次`}
            hint={stats.milkAmount > 0 ? `${stats.milkAmount}ml` : undefined}
          />
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
                  <span className="text-gray-400 text-xs w-10">
                    {formatDateTime(f.time, "HH:mm")}
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-xs",
                      f.type === "milk"
                        ? "bg-pink-100 text-pink-600"
                        : "bg-emerald-100 text-emerald-600"
                    )}
                  >
                    {f.type === "milk" ? "奶" : "辅食"}
                  </span>
                  <span className="text-gray-700 dark:text-night-50 flex-1">
                    {f.amount}
                    {f.unit}
                    {f.note && ` · ${f.note}`}
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
                  <span className="text-gray-400 text-xs w-10">
                    {formatDateTime(d.time, "HH:mm")}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-600">
                    {d.type === "pee" ? "小便" : d.type === "poop" ? "大便" : "大小便"}
                  </span>
                  {d.note && <span className="text-gray-500">{d.note}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {sleeps.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">😴 睡眠记录</p>
            <div className="space-y-1.5">
              {sleeps.slice(0, 5).map((s) => {
                const isCrossDay =
                  s.endTime &&
                  new Date(s.startTime).toDateString() !==
                    new Date(s.endTime).toDateString();
                return (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 text-xs w-28">
                      {formatDateTime(s.startTime, "HH:mm")} -{" "}
                      {s.endTime ? formatDateTime(s.endTime, "HH:mm") : "进行中"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-xs bg-violet-100 text-violet-600">
                      {formatDuration(s.duration)}
                    </span>
                    {isCrossDay && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">
                        跨天
                      </span>
                    )}
                    {s.note && <span className="text-gray-500">{s.note}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {feedings.length === 0 && diapers.length === 0 && sleeps.length === 0 && (
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
                  <CatIcon
                    size={14}
                    className={cn(
                      "flex-shrink-0",
                      t.completed ? "text-gray-400" : "text-primary-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm flex-1",
                      t.completed
                        ? "text-gray-400 line-through"
                        : "text-gray-700 dark:text-night-50"
                    )}
                  >
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
              <p className="text-2xl font-bold text-sky-600 dark:text-sky-300">
                {latestGrowth.height}cm
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDate(latestGrowth.date, "MM/dd")}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-400/10">
              <p className="text-xs text-gray-400">最新体重</p>
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-300">
                {latestGrowth.weight}kg
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDate(latestGrowth.date, "MM/dd")}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-6 text-sm">暂无生长记录</p>
        )}
      </Card>
    </>
  );
}

function FullContent({ payload }: { payload: SharePayload }) {
  const { vaccines = [] } = payload;

  return (
    <>
      {vaccines.length > 0 && (
        <Card>
          <h3 className="section-title">
            <Syringe size={18} className="text-primary-500" /> 近期安排
          </h3>
          <div className="space-y-2">
            {vaccines.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-orange-50 dark:bg-orange-400/10"
              >
                {v.type === "vaccine" ? (
                  <Syringe size={16} className="text-orange-500" />
                ) : (
                  <Stethoscope size={16} className="text-orange-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-night-50">
                    {v.name}
                  </p>
                  <p className="text-xs text-gray-400">{v.plannedDate}</p>
                  {v.note && <p className="text-xs text-gray-400 mt-0.5">{v.note}</p>}
                </div>
                <span className="text-xs text-orange-500">
                  {v.type === "vaccine" ? "疫苗" : "体检"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <TodayContent payload={payload} />
    </>
  );
}

function GrowthContent({ payload }: { payload: SharePayload }) {
  const { growthRecords = [], latestGrowth } = payload;

  const sortedRecords = useMemo(() => {
    return [...growthRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [growthRecords]);

  const chartData = useMemo(() => {
    return sortedRecords.map((r) => ({
      date: formatDate(r.date, "MM/dd"),
      height: r.height,
      weight: r.weight,
    }));
  }, [sortedRecords]);

  return (
    <>
      <Card>
        <h3 className="section-title">
          <TrendingUp size={18} className="text-primary-500" /> 生长趋势
        </h3>

        {sortedRecords.length > 0 ? (
          <div className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #fce7f3",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="height"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={{ fill: "#38bdf8", r: 3 }}
                    name="身高(cm)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="weight"
                    stroke="#f472b6"
                    strokeWidth={2}
                    dot={{ fill: "#f472b6", r: 3 }}
                    name="体重(kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-400"></span>
                <span className="text-gray-500">身高 (cm)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-pink-400"></span>
                <span className="text-gray-500">体重 (kg)</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8 text-sm">暂无生长记录</p>
        )}
      </Card>

      <Card>
        <h3 className="section-title">
          <Ruler size={18} className="text-primary-500" /> 最新生长数据
        </h3>
        {latestGrowth ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-400/10">
              <p className="text-xs text-gray-400">最新身高</p>
              <p className="text-2xl font-bold text-sky-600 dark:text-sky-300">
                {latestGrowth.height}cm
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDate(latestGrowth.date, "MM/dd")}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-400/10">
              <p className="text-xs text-gray-400">最新体重</p>
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-300">
                {latestGrowth.weight}kg
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDate(latestGrowth.date, "MM/dd")}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-6 text-sm">暂无生长记录</p>
        )}
      </Card>

      {sortedRecords.length > 0 && (
        <Card>
          <h3 className="section-title">
            <Calendar size={18} className="text-primary-500" /> 生长记录列表
          </h3>
          <div className="space-y-2">
            {sortedRecords.slice().reverse().map((record: GrowthRecord) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-night-200/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-400/20 flex items-center justify-center">
                    <Ruler size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-night-50">
                      {formatDate(record.date, "yyyy年MM月dd日")}
                    </p>
                    {record.note && (
                      <p className="text-xs text-gray-400 mt-0.5">{record.note}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-sky-600 dark:text-sky-300">
                    {record.height}cm
                  </p>
                  <p className="text-sm font-bold text-pink-600 dark:text-pink-300">
                    {record.weight}kg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

function Week7Content({ payload }: { payload: SharePayload }) {
  const { dailyStats = [], weekStartDate, weekEndDate } = payload;

  const weekSummary = useMemo(() => {
    if (dailyStats.length === 0) return null;

    const totalDays = dailyStats.length;
    const totalMilk = dailyStats.reduce((s, d) => s + d.milkCount, 0);
    const totalMilkAmount = dailyStats.reduce((s, d) => s + d.milkAmount, 0);
    const totalSolids = dailyStats.reduce((s, d) => s + d.solidsCount, 0);
    const totalDiaper = dailyStats.reduce((s, d) => s + d.diaperCount, 0);
    const totalSleep = dailyStats.reduce((s, d) => s + d.totalSleepMin, 0);
    const totalNightSleep = dailyStats.reduce((s, d) => s + d.nightSleepMin, 0);
    const totalTodo = dailyStats.reduce((s, d) => s + d.todoTotal, 0);
    const doneTodo = dailyStats.reduce((s, d) => s + d.todoDone, 0);

    return {
      totalDays,
      avgMilkPerDay: Math.round((totalMilk / totalDays) * 10) / 10,
      totalMilkAmount,
      avgMilkAmountPerDay: Math.round(totalMilkAmount / totalDays),
      avgSolidsPerDay: Math.round((totalSolids / totalDays) * 10) / 10,
      avgDiaperPerDay: Math.round((totalDiaper / totalDays) * 10) / 10,
      avgSleepPerDayMin: Math.round(totalSleep / totalDays),
      totalSleepMin: totalSleep,
      totalNightSleepMin: totalNightSleep,
      totalTodo,
      doneTodo,
      completionRate: totalTodo > 0 ? Math.round((doneTodo / totalTodo) * 100) : 0,
    };
  }, [dailyStats]);

  return (
    <>
      <Card>
        <h3 className="section-title">
          <BarChart3 size={18} className="text-primary-500" /> 7天汇总
          {weekStartDate && weekEndDate && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              {formatDate(weekStartDate, "MM/dd")} - {formatDate(weekEndDate, "MM/dd")}
            </span>
          )}
        </h3>

        {weekSummary ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <StatMini
                label="日均喂奶"
                value={`${weekSummary.avgMilkPerDay}次`}
                hint={`${weekSummary.avgMilkAmountPerDay}ml`}
              />
              <StatMini label="日均辅食" value={`${weekSummary.avgSolidsPerDay}次`} />
              <StatMini label="日均换尿布" value={`${weekSummary.avgDiaperPerDay}次`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-400/10">
                <div className="flex items-center gap-2 mb-2">
                  <Moon size={16} className="text-violet-500" />
                  <p className="text-xs text-gray-500">总睡眠</p>
                </div>
                <p className="text-xl font-bold text-violet-600 dark:text-violet-300">
                  {formatDuration(weekSummary.totalSleepMin)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  日均 {formatDuration(weekSummary.avgSleepPerDayMin)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-400/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <p className="text-xs text-gray-500">待办完成率</p>
                </div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-300">
                  {weekSummary.completionRate}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {weekSummary.doneTodo}/{weekSummary.totalTodo} 项
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-6 text-sm">暂无数据</p>
        )}
      </Card>

      <Card>
        <h3 className="section-title">
          <Calendar size={18} className="text-primary-500" /> 每日明细
        </h3>

        {dailyStats.length > 0 ? (
          <div className="space-y-2">
            {dailyStats.map((day: DailyStats) => (
              <div
                key={day.date}
                className="p-3 rounded-xl bg-gray-50 dark:bg-night-200/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-night-50">
                    {formatDate(day.date, "MM月dd日 EEEE")}
                  </p>
                  {day.todoTotal > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                      待办 {day.todoDone}/{day.todoTotal}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-gray-400">喂奶</p>
                    <p className="font-medium text-pink-600 dark:text-pink-400 mt-0.5">
                      {day.milkCount}次
                      {day.milkAmount > 0 && (
                        <span className="text-gray-400"> ({day.milkAmount}ml)</span>
                      )}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">辅食</p>
                    <p className="font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {day.solidsCount}次
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">尿布</p>
                    <p className="font-medium text-orange-600 dark:text-orange-400 mt-0.5">
                      {day.diaperCount}次
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">睡眠</p>
                    <p className="font-medium text-violet-600 dark:text-violet-400 mt-0.5">
                      {formatDuration(day.totalSleepMin)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-6 text-sm">暂无数据</p>
        )}
      </Card>
    </>
  );
}

function StatMini({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-white/70 dark:bg-night-800/50 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-base font-bold text-gray-800 dark:text-night-50 mt-0.5">{value}</p>
      {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function FamilyFeedbackSection({
  babyId,
  shareDate,
}: {
  babyId: string;
  shareDate: string;
}) {
  const { addViewed, addNote, getDateFeedbacks } = useFeedbackStore();
  const feedbacks = useFeedbackStore((s) => s.getDateFeedbacks(babyId, shareDate));

  const [visitorName, setVisitorName] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [viewedNames, setViewedNames] = useState<string[]>([]);

  useEffect(() => {
    const viewed = feedbacks
      .filter((f) => f.type === "viewed")
      .map((f) => f.visitorName);
    setViewedNames([...new Set(viewed)]);
  }, [feedbacks]);

  const handleViewed = () => {
    const name = visitorName.trim();
    if (!name) return;
    if (viewedNames.includes(name)) return;
    addViewed(babyId, name, shareDate);
  };

  const handleNote = () => {
    const name = visitorName.trim();
    const content = noteContent.trim();
    if (!name || !content) return;
    addNote(babyId, name, content, shareDate);
    setNoteContent("");
  };

  const notes = feedbacks.filter((f) => f.type === "note");

  return (
    <Card>
      <h3 className="section-title">
        <span className="text-primary-500 text-lg">💬</span> 家人反馈
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            placeholder="你的称呼（如：奶奶、爸爸）"
            className="flex-1 px-3 py-2 rounded-xl border border-primary-200 dark:border-night-200/20 bg-white/70 dark:bg-night-800/50 text-sm text-gray-700 dark:text-night-50 placeholder:text-gray-300 dark:placeholder:text-night-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <button
            onClick={handleViewed}
            disabled={!visitorName.trim() || viewedNames.includes(visitorName.trim())}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
              !visitorName.trim() || viewedNames.includes(visitorName.trim())
                ? "bg-gray-100 text-gray-400 dark:bg-night-200/10 dark:text-night-200 cursor-not-allowed"
                : "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700"
            )}
          >
            已查看
          </button>
        </div>

        {viewedNames.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-gray-400">已看：</span>
            {viewedNames.map((name) => (
              <span
                key={name}
                className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
              >
                ✓ {name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="留个言吧…"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNote();
            }}
            className="flex-1 px-3 py-2 rounded-xl border border-primary-200 dark:border-night-200/20 bg-white/70 dark:bg-night-800/50 text-sm text-gray-700 dark:text-night-50 placeholder:text-gray-300 dark:placeholder:text-night-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <button
            onClick={handleNote}
            disabled={!visitorName.trim() || !noteContent.trim()}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
              !visitorName.trim() || !noteContent.trim()
                ? "bg-gray-100 text-gray-400 dark:bg-night-200/10 dark:text-night-200 cursor-not-allowed"
                : "bg-pink-500 text-white hover:bg-pink-600 active:bg-pink-700"
            )}
          >
            留言
          </button>
        </div>

        {notes.length > 0 && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-gray-400">最近留言</p>
            {notes.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-xl bg-gradient-to-r from-pink-50 to-primary-50 dark:from-pink-400/10 dark:to-primary-400/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-pink-600 dark:text-pink-400">
                    {n.visitorName}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {formatDateTime(n.createdAt, "MM-dd HH:mm")}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-night-50">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
