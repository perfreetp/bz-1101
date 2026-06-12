import React, { useState } from "react";
import { Syringe, Stethoscope, Plus, Check, X, Trash2, Edit2, Calendar, AlertCircle } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useBabyStore } from "@/store/baby";
import { useVaccineStore } from "@/store/vaccine";
import { useTodoStore } from "@/store/todo";
import { cn } from "@/lib/utils";
import { todayStr, formatDate } from "@/utils/date";
import type { VaccineItem, VaccineType } from "@/types";

interface Props {
  compact?: boolean;
}

export default function VaccineManager({ compact = false }: Props) {
  const { currentBabyId } = useBabyStore();
  const { getBabyVaccines, getUpcoming, addVaccine, updateVaccine, completeVaccine, uncompleteVaccine, deleteVaccine } = useVaccineStore();
  const { addTodo, todos, deleteTodo } = useTodoStore();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<VaccineItem | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("pending");

  const [name, setName] = useState("");
  const [type, setType] = useState<VaccineType>("vaccine");
  const [plannedDate, setPlannedDate] = useState(todayStr());
  const [note, setNote] = useState("");

  const vaccines = currentBabyId ? getBabyVaccines(currentBabyId) : [];
  const upcoming = currentBabyId ? getUpcoming(currentBabyId) : [];

  const filtered = vaccines.filter((v) => {
    if (filter === "pending") return !v.completedDate;
    if (filter === "done") return !!v.completedDate;
    return true;
  });

  function openAdd() {
    setEditing(null);
    setName("");
    setType("vaccine");
    setPlannedDate(todayStr());
    setNote("");
    setShowModal(true);
  }

  function openEdit(v: VaccineItem) {
    setEditing(v);
    setName(v.name);
    setType(v.type);
    setPlannedDate(v.plannedDate);
    setNote(v.note);
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentBabyId || !name.trim()) return;

    if (editing) {
      updateVaccine(editing.id, {
        name: name.trim(),
        type,
        plannedDate,
        note: note.trim(),
      });
    } else {
      addVaccine({
        babyId: currentBabyId,
        name: name.trim(),
        type,
        plannedDate,
        completedDate: null,
        note: note.trim(),
      });
    }
    setShowModal(false);
  }

  function getDaysLeft(dateStr: string): number {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  }

  function handleComplete(v: VaccineItem) {
    if (!currentBabyId) return;
    completeVaccine(v.id);
    const cat = v.type === "vaccine" ? "vaccine" : "checkup";
    const existing = todos.find(
      (t) => t.babyId === currentBabyId && t.vaccineId === v.id
    );
    if (existing) {
      useTodoStore.getState().toggleTodo(existing.id);
    } else {
      addTodo({
        babyId: currentBabyId,
        title: v.name,
        date: todayStr(),
        category: cat,
        completed: true,
        vaccineId: v.id,
      });
    }
  }

  function handleUncomplete(v: VaccineItem) {
    if (!currentBabyId) return;
    uncompleteVaccine(v.id);
    const existing = todos.find(
      (t) => t.babyId === currentBabyId && t.vaccineId === v.id
    );
    if (existing) {
      if (existing.completed) {
        useTodoStore.getState().toggleTodo(existing.id);
      }
    }
  }

  if (compact) {
    if (upcoming.length === 0) return null;
    return (
      <Card className="bg-gradient-to-r from-primary-50 to-mint-50 dark:from-primary-900/20 dark:to-mint-900/20 border-0">
        <div className="space-y-2">
          {upcoming.slice(0, 2).map((v) => {
            const days = getDaysLeft(v.plannedDate);
            return (
              <div key={v.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/70 dark:bg-night-800/50 flex items-center justify-center animate-pulse-soft flex-shrink-0">
                  {v.type === "vaccine" ? (
                    <Syringe size={18} className="text-primary-500" />
                  ) : (
                    <Stethoscope size={18} className="text-primary-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-300 truncate">
                    {days <= 0 ? "今日提醒" : `${days}天后`}：{v.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-night-100">
                    计划日期：{v.plannedDate}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">
          <Syringe size={20} className="text-primary-500" /> 疫苗 & 体检提醒
        </h3>
        <Button size="sm" onClick={openAdd}>
          <Plus size={16} className="mr-1" /> 添加
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {([
          { v: "pending", l: "待完成" },
          { v: "all", l: "全部" },
          { v: "done", l: "已完成" },
        ] as const).map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              filter === f.v
                ? "bg-primary-400 text-white"
                : "bg-gray-50 dark:bg-night-200/10 text-gray-500 hover:bg-primary-50 dark:hover:bg-night-200/5"
            )}
          >
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">💉</div>
          <p className="text-sm text-gray-400">暂无{filter === "pending" ? "待完成的" : filter === "done" ? "已完成的" : ""}记录</p>
          <button
            onClick={openAdd}
            className="mt-3 text-xs text-primary-500 hover:underline"
          >
            + 立即添加
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map((v) => {
            const days = getDaysLeft(v.plannedDate);
            const isUrgent = !v.completedDate && days <= 3;
            const isOverdue = !v.completedDate && days < 0;
            return (
              <div
                key={v.id}
                className={cn(
                  "p-3 rounded-xl border transition-all",
                  v.completedDate
                    ? "bg-gray-50 dark:bg-night-200/5 border-gray-100 dark:border-night-200/10 opacity-70"
                    : isOverdue
                    ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-400/30"
                    : isUrgent
                    ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-400/30"
                    : "bg-gray-50 dark:bg-night-200/5 border-transparent"
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => v.completedDate ? handleUncomplete(v) : handleComplete(v)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                      v.completedDate
                        ? "bg-emerald-400 border-emerald-400 text-white"
                        : "border-gray-300 dark:border-night-200 hover:border-emerald-400"
                    )}
                  >
                    {v.completedDate && <Check size={14} strokeWidth={3} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "text-sm font-medium",
                        v.completedDate ? "text-gray-400 line-through" : "text-gray-800 dark:text-night-50"
                      )}>
                        {v.name}
                      </span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full",
                        v.type === "vaccine"
                          ? "bg-pink-100 dark:bg-pink-400/20 text-pink-600"
                          : "bg-sky-100 dark:bg-sky-400/20 text-sky-600"
                      )}>
                        {v.type === "vaccine" ? "💉 疫苗" : "🩺 体检"}
                      </span>
                      {!v.completedDate && (isUrgent || isOverdue) && (
                        <span className="flex items-center gap-0.5 text-[10px] text-red-500 font-medium">
                          <AlertCircle size={10} />
                          {isOverdue ? "已过期" : `${days}天后`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Calendar size={12} />
                      <span>计划：{formatDate(v.plannedDate, "MM/dd")}</span>
                      {v.completedDate && (
                        <span className="text-emerald-500">✓ 已完成 {formatDate(v.completedDate, "MM/dd")}</span>
                      )}
                    </div>
                    {v.note && (
                      <p className="text-xs text-gray-400 mt-1">📝 {v.note}</p>
                    )}
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(v)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-night-200/10 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteVaccine(v.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "编辑提醒" : "添加疫苗/体检"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">类型</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("vaccine")}
                className={cn(
                  "py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5",
                  type === "vaccine"
                    ? "bg-primary-400 text-white"
                    : "bg-gray-50 dark:bg-night-200/10 text-gray-500"
                )}
              >
                <Syringe size={16} />
                疫苗接种
              </button>
              <button
                type="button"
                onClick={() => setType("checkup")}
                className={cn(
                  "py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5",
                  type === "checkup"
                    ? "bg-primary-400 text-white"
                    : "bg-gray-50 dark:bg-night-200/10 text-gray-500"
                )}
              >
                <Stethoscope size={16} />
                健康体检
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base"
              placeholder={type === "vaccine" ? "例如：乙肝疫苗第三针" : "例如：6个月体检"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">
              <Calendar size={14} className="inline mr-1" /> 计划日期
            </label>
            <input
              type="date"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">备注（可选）</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-base"
              placeholder="例如：记得带疫苗本、空腹"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              <X size={16} className="mr-1" /> 取消
            </Button>
            <Button type="submit" className="flex-1">
              <Check size={16} className="mr-1" /> {editing ? "保存修改" : "添加"}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
