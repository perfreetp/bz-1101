import { formatDate, formatDateTime, formatDuration } from "./date";

interface DiaryData {
  babyName: string;
  date: string;
  feedings: Array<{ type: string; amount: number; unit: string; time: string; note: string }>;
  diapers: Array<{ type: string; time: string; note: string }>;
  sleeps: Array<{ startTime: string; endTime: string | null; duration: number; note: string }>;
  todos: Array<{ title: string; completed: boolean; category: string }>;
  growth?: { height: number; weight: number; note: string } | null;
}

export function exportDiaryToText(data: DiaryData): string {
  const lines: string[] = [];
  lines.push(`=== ${data.babyName} 的育儿日记 ===`);
  lines.push(`日期：${formatDate(data.date, "yyyy年MM月dd日")}`);
  lines.push("");

  lines.push("【喂养记录】");
  if (data.feedings.length === 0) {
    lines.push("  暂无记录");
  } else {
    data.feedings.forEach((f, i) => {
      const typeName = f.type === "milk" ? "喂奶" : "辅食";
      lines.push(`  ${i + 1}. ${formatDateTime(f.time, "HH:mm")} - ${typeName} ${f.amount}${f.unit}${f.note ? `（${f.note}）` : ""}`);
    });
    const totalMilk = data.feedings.filter((f) => f.type === "milk").reduce((s, f) => s + f.amount, 0);
    if (totalMilk > 0) lines.push(`  今日奶量总计：${totalMilk}ml`);
  }
  lines.push("");

  lines.push("【换尿布记录】");
  if (data.diapers.length === 0) {
    lines.push("  暂无记录");
  } else {
    const typeNames: Record<string, string> = { pee: "小便", poop: "大便", both: "大小便" };
    data.diapers.forEach((d, i) => {
      lines.push(`  ${i + 1}. ${formatDateTime(d.time, "HH:mm")} - ${typeNames[d.type] || d.type}${d.note ? `（${d.note}）` : ""}`);
    });
  }
  lines.push("");

  lines.push("【睡眠记录】");
  if (data.sleeps.length === 0) {
    lines.push("  暂无记录");
  } else {
    let totalMin = 0;
    data.sleeps.forEach((s, i) => {
      const end = s.endTime ? formatDateTime(s.endTime, "HH:mm") : "进行中";
      lines.push(`  ${i + 1}. ${formatDateTime(s.startTime, "HH:mm")} - ${end}（${formatDuration(s.duration)}）${s.note ? `（${s.note}）` : ""}`);
      totalMin += s.duration;
    });
    lines.push(`  今日睡眠总计：${formatDuration(totalMin)}`);
  }
  lines.push("");

  lines.push("【今日待办】");
  if (data.todos.length === 0) {
    lines.push("  暂无待办");
  } else {
    const categoryNames: Record<string, string> = {
      vaccine: "疫苗", checkup: "体检", shopping: "购物", other: "其他",
    };
    const done = data.todos.filter((t) => t.completed).length;
    const total = data.todos.length;
    lines.push(`  进度：${done}/${total} 已完成`);
    data.todos.forEach((t, i) => {
      const status = t.completed ? "✅ 已完成" : "⬜ 未完成";
      const cat = categoryNames[t.category] || t.category;
      lines.push(`  ${status} [${cat}] ${i + 1}. ${t.title}`);
    });
  }
  lines.push("");

  if (data.growth) {
    lines.push("【生长记录】");
    lines.push(`  身高：${data.growth.height}cm  体重：${data.growth.weight}kg${data.growth.note ? `（${data.growth.note}）` : ""}`);
  }

  lines.push("");
  lines.push("—— 记录于宝妈育儿助手 ——");
  return lines.join("\n");
}

export function downloadText(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
