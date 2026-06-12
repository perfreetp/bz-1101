import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Ruler,
  Download,
  Plus,
  Trash2,
  TrendingUp,
  Moon,
  Sun,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useBabyStore } from "@/store/baby";
import { useGrowthStore } from "@/store/growth";
import { useFeedingStore } from "@/store/feeding";
import { useSleepStore } from "@/store/sleep";
import { useTodoStore } from "@/store/todo";
import { exportDiaryToText, downloadText, exportPeriodReport } from "@/utils/export";
import { formatDate, todayStr, formatDuration } from "@/utils/date";
import { getPeriodSummary } from "@/utils/stats";
import { cn } from "@/lib/utils";

type TabType = "today" | "week" | "month";

export default function DataSummary() {
  const { currentBabyId, getCurrentBaby } = useBabyStore();
  const { getBabyGrowth, getLatestGrowth, addGrowth, deleteGrowth } = useGrowthStore();
  const { getBabyFeedings, getBabyDiapers, getTodayFeedings, getTodayDiapers } = useFeedingStore();
  const { getBabySleeps, getTodaySleeps, getTodayTotalMinutes } = useSleepStore();
  const { getBabyTodos, getTodayTodos } = useTodoStore();

  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [showAddGrowth, setShowAddGrowth] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");

  const baby = getCurrentBaby();

  const growthRecords = useMemo(
    () => (currentBabyId ? getBabyGrowth(currentBabyId) : []),
    [currentBabyId, getBabyGrowth]
  );

  const latest = useMemo(
    () => (currentBabyId ? getLatestGrowth(currentBabyId) : null),
    [currentBabyId, getLatestGrowth]
  );

  const allFeedings = useMemo(
    () => (currentBabyId ? getBabyFeedings(currentBabyId) : []),
    [currentBabyId, getBabyFeedings]
  );

  const allDiapers = useMemo(
    () => (currentBabyId ? getBabyDiapers(currentBabyId) : []),
    [currentBabyId, getBabyDiapers]
  );

  const allSleeps = useMemo(
    () => (currentBabyId ? getBabySleeps(currentBabyId) : []),
    [currentBabyId, getBabySleeps]
  );

  const allTodos = useMemo(
    () => (currentBabyId ? getBabyTodos(currentBabyId) : []),
    [currentBabyId, getBabyTodos]
  );

  const weekSummary = useMemo(() => {
    if (!currentBabyId) return null;
    return getPeriodSummary(7, todayStr(), allFeedings, allDiapers, allSleeps, allTodos, growthRecords);
  }, [currentBabyId, allFeedings, allDiapers, allSleeps, allTodos, growthRecords]);

  const monthSummary = useMemo(() => {
    if (!currentBabyId) return null;
    return getPeriodSummary(30, todayStr(), allFeedings, allDiapers, allSleeps, allTodos, growthRecords);
  }, [currentBabyId, allFeedings, allDiapers, allSleeps, allTodos, growthRecords]);

  const growthChartData = growthRecords.map((r) => ({
    date: formatDate(r.date, "MM/dd"),
    身高: r.height,
    体重: r.weight,
  }));

  const sleepChartData = useMemo(() => {
    const summary = activeTab === "week" ? weekSummary : activeTab === "month" ? monthSummary : null;
    if (!summary) return [];
    return summary.daily.map((d) => ({
      date: formatDate(d.date, "MM/dd"),
      总睡眠: Math.round(d.totalSleepMin / 60 * 10) / 10,
      夜间睡眠: Math.round(d.nightSleepMin / 60 * 10) / 10,
    }));
  }, [activeTab, weekSummary, monthSummary]);

  const todayFeedings = currentBabyId ? getTodayFeedings(currentBabyId) : [];
  const todayDiapers = currentBabyId ? getTodayDiapers(currentBabyId) : [];
  const todaySleeps = currentBabyId ? getTodaySleeps(currentBabyId) : [];
  const todayTodos = currentBabyId ? getTodayTodos(currentBabyId) : [];
  const sleepMins = currentBabyId ? getTodayTotalMinutes(currentBabyId) : 0;

  function handleAddGrowth(e: React.FormEvent) {
    e.preventDefault();
    if (!currentBabyId) return;
    addGrowth({
      babyId: currentBabyId,
      date,
      height: Number(height) || 0,
      weight: Number(weight) || 0,
      note: note.trim(),
    });
    setHeight("");
    setWeight("");
    setNote("");
    setShowAddGrowth(false);
  }

  function handleExport() {
    if (!baby) return;
    const content = exportDiaryToText({
      babyName: baby.name,
      date: todayStr(),
      feedings: todayFeedings.map((f) => ({
        type: f.type, amount: f.amount, unit: f.unit, time: f.time, note: f.note,
      })),
      diapers: todayDiapers.map((d) => ({ type: d.type, time: d.time, note: d.note })),
      sleeps: todaySleeps.map((s) => ({
        startTime: s.startTime, endTime: s.endTime, duration: s.duration, note: s.note,
      })),
      todos: todayTodos.map((t) => ({ title: t.title, completed: t.completed, category: t.category })),
      growth: latest ? { height: latest.height, weight: latest.weight, note: latest.note } : null,
    });
    const filename = `${baby.name}_育儿日记_${todayStr()}.txt`;
    downloadText(content, filename);
  }

  function handleExportPeriod(period: "week" | "month") {
    if (!baby) return;
    const summary = period === "week" ? weekSummary : monthSummary;
    const label = period === "week" ? "周报" : "月报";
    if (!summary) return;
    const content = exportPeriodReport(summary, baby.name, label);
    const filename = `${baby.name}_${label}_${summary.startDate}_${summary.endDate}.txt`;
    downloadText(content, filename);
  }

  const currentSummary = activeTab === "week" ? weekSummary : activeTab === "month" ? monthSummary : null;

  return (
    <div className="space-y-5">
      <div className="flex bg-gray-100 dark:bg-night-200/10 rounded-2xl p-1">
        {[
          { key: "today", label: "今日", icon: Sun },
          { key: "week", label: "周报", icon: Calendar },
          { key: "month", label: "月报", icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-white dark:bg-night-300/30 text-primary-500 shadow-sm"
                : "text-gray-500 dark:text-night-100/60 hover:text-gray-700 dark:hover:text-night-100"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "today" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Ruler} label="最新身高" value={latest ? `${latest.height}cm` : "--"} sub={latest ? formatDate(latest.date) : "未记录"} color="sky" />
            <StatCard icon={TrendingUp} label="最新体重" value={latest ? `${latest.weight}kg` : "--"} sub={latest ? formatDate(latest.date) : "未记录"} color="pink" />
            <StatCard icon={BarChart3} label="生长记录" value={`${growthRecords.length}条`} sub="历史数据" color="violet" />
            <StatCard icon={Download} label="今日日记" value="导出" sub="点击下方按钮" color="emerald" clickable={handleExport} />
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">
                <TrendingUp size={20} className="text-primary-500" /> 生长趋势
              </h3>
              <Button size="sm" onClick={() => setShowAddGrowth(true)}>
                <Plus size={16} className="mr-1" /> 添加记录
              </Button>
            </div>

            {growthRecords.length < 2 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📈</div>
                <p className="text-gray-400 text-sm">至少需要 2 条记录才能显示趋势图</p>
                <p className="text-gray-300 text-xs mt-1">添加宝宝的身高和体重数据后，这里将展示生长曲线</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFE4EA" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(255,92,127,0.15)",
                      }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="身高" stroke="#FF7A99" strokeWidth={3} dot={{ fill: "#FF7A99", strokeWidth: 2, r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="体重" stroke="#68D391" strokeWidth={3} dot={{ fill: "#68D391", strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {growthRecords.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-night-200/10">
                <p className="text-sm text-gray-500 dark:text-night-100 mb-3">历史记录</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {growthRecords.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-night-200/5"
                    >
                      <span className="text-xs text-gray-400 w-16">{formatDate(r.date, "MM/dd")}</span>
                      <span className="text-sm text-sky-500 font-medium w-16">📏 {r.height}cm</span>
                      <span className="text-sm text-pink-500 font-medium w-16">⚖️ {r.weight}kg</span>
                      <span className="flex-1 text-xs text-gray-400 truncate">{r.note}</span>
                      <button
                        onClick={() => deleteGrowth(r.id)}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="section-title">
              <Download size={20} className="text-primary-500" /> 数据导出
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-pink-50 dark:from-primary-900/20 dark:to-pink-900/20 hover:shadow-soft transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-night-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Download size={20} className="text-primary-500" />
                </div>
                <p className="font-medium text-gray-800 dark:text-night-50">导出今日日记</p>
                <p className="text-xs text-gray-400 mt-1">TXT 文本格式，包含今日所有记录</p>
              </button>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 opacity-70">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-night-800 flex items-center justify-center mb-3">
                  <BarChart3 size={20} className="text-violet-500" />
                </div>
                <p className="font-medium text-gray-800 dark:text-night-50">更多导出格式</p>
                <p className="text-xs text-gray-400 mt-1">CSV / PDF 格式即将推出</p>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-gray-50 dark:bg-night-200/5">
              <p className="text-sm text-gray-500 dark:text-night-100 mb-2">📊 今日数据概览</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold text-primary-500">{todayFeedings.length}</p>
                  <p className="text-xs text-gray-400">喂养次数</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-violet-500">{todaySleeps.length}</p>
                  <p className="text-xs text-gray-400">睡眠次数</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-emerald-500">{Math.round(sleepMins / 60)}h{sleepMins % 60}m</p>
                  <p className="text-xs text-gray-400">睡眠时长</p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {activeTab !== "today" && currentSummary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard
              icon={Ruler}
              label="平均每日喂奶"
              value={`${currentSummary.avgMilkPerDay}次`}
              sub={`总量 ${currentSummary.totalMilkAmount}ml`}
              color="pink"
              diff={currentSummary.diff?.avgMilkPerDay}
            />
            <StatCard
              icon={TrendingUp}
              label="平均每日辅食"
              value={`${currentSummary.avgSolidsPerDay}次`}
              sub={`${currentSummary.totalDays}天总计`}
              color="sky"
              diff={currentSummary.diff?.avgSolidsPerDay}
            />
            <StatCard
              icon={BarChart3}
              label="平均每日换尿布"
              value={`${currentSummary.avgDiaperPerDay}次`}
              sub="护理统计"
              color="violet"
              diff={currentSummary.diff?.avgDiaperPerDay}
            />
            <StatCard
              icon={Moon}
              label="平均每日睡眠"
              value={formatDuration(currentSummary.avgSleepPerDayMin)}
              sub={`总睡眠 ${formatDuration(currentSummary.totalSleepMin)}`}
              color="emerald"
              diff={currentSummary.diff?.avgSleepPerDayMin}
              diffUnit="min"
            />
            <StatCard
              icon={Sun}
              label="夜间总睡眠"
              value={formatDuration(currentSummary.nightSleepMin)}
              sub="夜间睡眠统计"
              color="pink"
            />
            <StatCard
              icon={Calendar}
              label="待办完成率"
              value={`${currentSummary.completionRate}%`}
              sub={`${currentSummary.completedTodo}/${currentSummary.totalTodo} 已完成`}
              color="sky"
              diff={currentSummary.diff?.completionRate}
              diffUnit="%"
            />
          </div>

          {currentSummary.growthStart && currentSummary.growthEnd && (
            <Card>
              <h3 className="section-title">
                <TrendingUp size={20} className="text-primary-500" /> 期间生长变化
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20">
                  <p className="text-xs text-sky-600 dark:text-sky-300 opacity-70">身高变化</p>
                  <p className="text-xl font-bold text-sky-600 dark:text-sky-300 mt-1">
                    {currentSummary.growthStart.height}cm → {currentSummary.growthEnd.height}cm
                  </p>
                  <p className="text-sm text-sky-500 dark:text-sky-400 mt-1">
                    {currentSummary.growthEnd.height - currentSummary.growthStart.height >= 0 ? "+" : ""}
                    {(currentSummary.growthEnd.height - currentSummary.growthStart.height).toFixed(1)}cm
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
                  <p className="text-xs text-pink-600 dark:text-pink-300 opacity-70">体重变化</p>
                  <p className="text-xl font-bold text-pink-600 dark:text-pink-300 mt-1">
                    {currentSummary.growthStart.weight}kg → {currentSummary.growthEnd.weight}kg
                  </p>
                  <p className="text-sm text-pink-500 dark:text-pink-400 mt-1">
                    {currentSummary.growthEnd.weight - currentSummary.growthStart.weight >= 0 ? "+" : ""}
                    {(currentSummary.growthEnd.weight - currentSummary.growthStart.weight).toFixed(2)}kg
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">
                <Moon size={20} className="text-primary-500" /> 睡眠趋势
              </h3>
              <span className="text-xs text-gray-400">
                {formatDate(currentSummary.startDate, "MM/dd")} - {formatDate(currentSummary.endDate, "MM/dd")}
              </span>
            </div>

            {sleepChartData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">😴</div>
                <p className="text-gray-400 text-sm">暂无睡眠数据</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sleepChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFE4EA" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} unit="h" />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(255,92,127,0.15)",
                      }}
                      formatter={(value: number) => [`${value}小时`]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="总睡眠" stroke="#FF7A99" strokeWidth={3} dot={{ fill: "#FF7A99", strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="夜间睡眠" stroke="#A78BFA" strokeWidth={3} dot={{ fill: "#A78BFA", strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="section-title">
              <Download size={20} className="text-primary-500" /> 数据导出
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleExportPeriod(activeTab as "week" | "month")}
                className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-pink-50 dark:from-primary-900/20 dark:to-pink-900/20 hover:shadow-soft transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-night-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Download size={20} className="text-primary-500" />
                </div>
                <p className="font-medium text-gray-800 dark:text-night-50">
                  导出{activeTab === "week" ? "周报" : "月报"}
                </p>
                <p className="text-xs text-gray-400 mt-1">TXT 文本格式，包含周期统计和每日明细</p>
              </button>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 opacity-70">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-night-800 flex items-center justify-center mb-3">
                  <BarChart3 size={20} className="text-violet-500" />
                </div>
                <p className="font-medium text-gray-800 dark:text-night-50">更多导出格式</p>
                <p className="text-xs text-gray-400 mt-1">CSV / PDF 格式即将推出</p>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-gray-50 dark:bg-night-200/5">
              <p className="text-sm text-gray-500 dark:text-night-100 mb-2">
                📊 {activeTab === "week" ? "本周" : "本月"}数据概览
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold text-primary-500">{currentSummary.totalMilkAmount}ml</p>
                  <p className="text-xs text-gray-400">喂奶总量</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-violet-500">{formatDuration(currentSummary.totalSleepMin)}</p>
                  <p className="text-xs text-gray-400">总睡眠</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-emerald-500">{currentSummary.completionRate}%</p>
                  <p className="text-xs text-gray-400">待办完成率</p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      <Modal open={showAddGrowth} onClose={() => setShowAddGrowth(false)} title="添加生长记录">
        <form onSubmit={handleAddGrowth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">日期</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-base" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">身高 (cm)</label>
              <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="input-base" placeholder="例如：65.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">体重 (kg)</label>
              <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} className="input-base" placeholder="例如：7.25" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">备注</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="input-base" placeholder="可选" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAddGrowth(false)} className="flex-1">取消</Button>
            <Button type="submit" className="flex-1">保存</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

interface StatCardProps {
  icon: typeof Ruler;
  label: string;
  value: string;
  sub?: string;
  color: "sky" | "pink" | "violet" | "emerald";
  clickable?: () => void;
  diff?: number | null;
  diffUnit?: string;
}

function StatCard({ icon: Icon, label, value, sub, color, clickable, diff, diffUnit = "次" }: StatCardProps) {
  const colorMap = {
    sky: "from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 text-sky-600 dark:text-sky-300",
    pink: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 text-pink-600 dark:text-pink-300",
    violet: "from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 text-violet-600 dark:text-violet-300",
    emerald: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 text-emerald-600 dark:text-emerald-300",
  };
  const diffDisplay = diff != null ? (
    diff > 0 ? (
      <span className="text-emerald-500">↑+{diffUnit === "min" ? Math.round(diff) + "min" : (Math.round(diff * 10) / 10) + diffUnit}</span>
    ) : diff < 0 ? (
      <span className="text-red-500">↓{diffUnit === "min" ? Math.round(diff) + "min" : (Math.round(diff * 10) / 10) + diffUnit}</span>
    ) : (
      <span className="text-gray-400">持平</span>
    )
  ) : null;

  return (
    <div
      onClick={clickable}
      className={cn("rounded-2xl p-4 bg-gradient-to-br transition-all", colorMap[color], clickable && "cursor-pointer hover:shadow-soft")}
    >
      <Icon size={18} className="opacity-80" />
      <p className="text-xs opacity-70 mt-1">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      {diffDisplay && (
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[10px]">{diffDisplay}</span>
          <span className="text-[10px] text-gray-400">vs上期</span>
        </div>
      )}
      {sub && <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}
