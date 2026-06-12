import type {
  FeedingRecord,
  DiaperRecord,
  SleepRecord,
  TodoItem,
  GrowthRecord,
} from "@/types";
import {
  getDateRange,
  isOverlappingDate,
  isNightSleep,
  formatDate,
  todayStr,
  calculateDuration,
} from "@/utils/date";

export interface DailyStats {
  date: string;
  milkCount: number;
  milkAmount: number;
  solidsCount: number;
  diaperCount: number;
  peeCount: number;
  poopCount: number;
  sleepCount: number;
  totalSleepMin: number;
  nightSleepMin: number;
  todoTotal: number;
  todoDone: number;
}

export interface PeriodSummary {
  startDate: string;
  endDate: string;
  totalDays: number;
  avgMilkPerDay: number;
  totalMilkAmount: number;
  avgSolidsPerDay: number;
  avgDiaperPerDay: number;
  avgSleepPerDayMin: number;
  totalSleepMin: number;
  nightSleepMin: number;
  totalTodo: number;
  completedTodo: number;
  completionRate: number;
  growthStart?: GrowthRecord;
  growthEnd?: GrowthRecord;
  daily: DailyStats[];
}

export function getDailyStats(
  dateStr: string,
  feedings: FeedingRecord[],
  diapers: DiaperRecord[],
  sleeps: SleepRecord[],
  todos: TodoItem[]
): DailyStats {
  const dayFeedings = feedings.filter(
    (f) => new Date(f.time).toISOString().split("T")[0] === dateStr
  );
  const dayDiapers = diapers.filter(
    (d) => new Date(d.time).toISOString().split("T")[0] === dateStr
  );
  const daySleeps = sleeps.filter((s) => isOverlappingDate(s.startTime, s.endTime, dateStr));
  const dayTodos = todos.filter((t) => t.date === dateStr);

  let totalSleepMin = 0;
  let nightSleepMin = 0;
  daySleeps.forEach((s) => {
    const end = s.endTime || new Date().toISOString();
    const dayStart = new Date(`${dateStr}T00:00:00`).getTime();
    const dayEnd = new Date(`${dateStr}T23:59:59.999`).getTime();
    const sStart = Math.max(new Date(s.startTime).getTime(), dayStart);
    const sEnd = Math.min(new Date(end).getTime(), dayEnd);
    const overlapMin = Math.max(0, Math.floor((sEnd - sStart) / 60000));
    totalSleepMin += overlapMin;
    if (isNightSleep(s.startTime, s.endTime)) {
      nightSleepMin += overlapMin;
    }
  });

  const milkFeedings = dayFeedings.filter((f) => f.type === "milk");
  const solidsFeedings = dayFeedings.filter((f) => f.type === "solids");

  return {
    date: dateStr,
    milkCount: milkFeedings.length,
    milkAmount: milkFeedings.reduce((sum, f) => sum + f.amount, 0),
    solidsCount: solidsFeedings.length,
    diaperCount: dayDiapers.length,
    peeCount: dayDiapers.filter((d) => d.type === "pee" || d.type === "both").length,
    poopCount: dayDiapers.filter((d) => d.type === "poop" || d.type === "both").length,
    sleepCount: daySleeps.length,
    totalSleepMin,
    nightSleepMin,
    todoTotal: dayTodos.length,
    todoDone: dayTodos.filter((t) => t.completed).length,
  };
}

export function getPeriodSummary(
  days: number,
  endDate: string,
  feedings: FeedingRecord[],
  diapers: DiaperRecord[],
  sleeps: SleepRecord[],
  todos: TodoItem[],
  growthRecords: GrowthRecord[]
): PeriodSummary {
  const dates = getDateRange(days, endDate);
  const daily = dates.map((d) => getDailyStats(d, feedings, diapers, sleeps, todos));

  const totalMilk = daily.reduce((s, d) => s + d.milkCount, 0);
  const totalMilkAmount = daily.reduce((s, d) => s + d.milkAmount, 0);
  const totalSolids = daily.reduce((s, d) => s + d.solidsCount, 0);
  const totalDiaper = daily.reduce((s, d) => s + d.diaperCount, 0);
  const totalSleep = daily.reduce((s, d) => s + d.totalSleepMin, 0);
  const nightSleep = daily.reduce((s, d) => s + d.nightSleepMin, 0);
  const totalTodo = daily.reduce((s, d) => s + d.todoTotal, 0);
  const doneTodo = daily.reduce((s, d) => s + d.todoDone, 0);

  const growthSorted = [...growthRecords].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const periodGrowth = growthSorted.filter(
    (g) => g.date >= dates[0] && g.date <= dates[dates.length - 1]
  );

  return {
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    totalDays: days,
    avgMilkPerDay: Math.round((totalMilk / days) * 10) / 10,
    totalMilkAmount,
    avgSolidsPerDay: Math.round((totalSolids / days) * 10) / 10,
    avgDiaperPerDay: Math.round((totalDiaper / days) * 10) / 10,
    avgSleepPerDayMin: Math.round(totalSleep / days),
    totalSleepMin: totalSleep,
    nightSleepMin: nightSleep,
    totalTodo,
    completedTodo: doneTodo,
    completionRate: totalTodo > 0 ? Math.round((doneTodo / totalTodo) * 100) : 0,
    growthStart: periodGrowth[0],
    growthEnd: periodGrowth[periodGrowth.length - 1],
    daily,
  };
}
