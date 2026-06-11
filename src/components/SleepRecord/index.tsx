import React, { useState, useEffect } from "react";
import { Moon, Play, Square, Plus, Trash2, Clock } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useBabyStore } from "@/store/baby";
import { useSleepStore } from "@/store/sleep";
import { formatTime, formatDuration, calculateDuration, getHoursMinutes } from "@/utils/date";
import { cn } from "@/lib/utils";
import type { SleepRecord } from "@/types";

export default function SleepRecord() {
  const { currentBabyId } = useBabyStore();
  const { getTodaySleeps, getTodayTotalMinutes, startSleep, endSleep, addSleep, deleteSleep, activeSleepId } = useSleepStore();

  const [showAdd, setShowAdd] = useState(false);
  const [startTime, setStartTime] = useState(formatTime(new Date()));
  const [endTime, setEndTime] = useState(formatTime(new Date()));
  const [quality, setQuality] = useState<SleepRecord["quality"]>("normal");
  const [note, setNote] = useState("");
  const [timer, setTimer] = useState(0);

  const sleeps = currentBabyId ? getTodaySleeps(currentBabyId) : [];
  const totalMinutes = currentBabyId ? getTodayTotalMinutes(currentBabyId) : 0;
  const activeSleep = sleeps.find((s) => s.id === activeSleepId);

  useEffect(() => {
    if (activeSleep) {
      const interval = setInterval(() => {
        setTimer(calculateDuration(activeSleep.startTime, new Date().toISOString()));
      }, 1000 * 30);
      setTimer(calculateDuration(activeSleep.startTime, new Date().toISOString()));
      return () => clearInterval(interval);
    } else {
      setTimer(0);
    }
  }, [activeSleep]);

  function handleStart() {
    if (!currentBabyId) return;
    startSleep(currentBabyId);
  }

  function handleEnd() {
    if (!activeSleepId) return;
    endSleep(activeSleepId, "normal", "");
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!currentBabyId) return;
    const today = new Date().toISOString().split("T")[0];
    addSleep({
      babyId: currentBabyId,
      startTime: `${today}T${startTime}:00`,
      endTime: `${today}T${endTime}:00`,
      quality,
      note: note.trim(),
    });
    setShowAdd(false);
    setNote("");
  }

  const hm = getHoursMinutes(
    activeSleep ? activeSleep.startTime : new Date().toISOString(),
    new Date().toISOString()
  );

  return (
    <div className="space-y-5">
      <Card className={cn(
        "bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/20 border-0 overflow-hidden relative"
      )}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/30 dark:bg-violet-400/10 rounded-full -mr-16 -mt-16" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/70 dark:bg-night-800/50 flex items-center justify-center">
                <Moon size={24} className="text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-violet-700 dark:text-violet-300 opacity-80">今日睡眠总时长</p>
                <p className="text-3xl font-bold text-violet-700 dark:text-violet-200 mt-0.5">
                  {formatDuration(totalMinutes)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-violet-700 dark:text-violet-300 opacity-80">睡眠次数</p>
              <p className="text-2xl font-bold text-violet-700 dark:text-violet-200">{sleeps.filter((s) => s.endTime).length}</p>
            </div>
          </div>

          {activeSleep ? (
            <div className="bg-white/60 dark:bg-night-800/40 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-violet-600 dark:text-violet-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    正在睡眠中...
                  </p>
                  <p className="text-3xl font-bold text-violet-700 dark:text-violet-200 font-mono mt-1">
                    {String(hm.hours).padStart(2, "0")}:{String(hm.minutes).padStart(2, "0")}
                  </p>
                  <p className="text-xs text-violet-500 mt-1">
                    开始于 {formatTime(activeSleep.startTime)}
                  </p>
                </div>
                <button
                  onClick={handleEnd}
                  className="w-16 h-16 rounded-full bg-red-400 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
                >
                  <Square size={24} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleStart}
              className="w-full bg-white/70 dark:bg-night-800/50 hover:bg-white dark:hover:bg-night-800/70 rounded-2xl p-5 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-violet-500 text-white flex items-center justify-center">
                <Play size={24} className="ml-1" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-violet-700 dark:text-violet-200">开始记录睡眠</p>
                <p className="text-xs text-violet-500 dark:text-violet-300 mt-0.5">点击开始计时</p>
              </div>
            </button>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">
            <Clock size={20} className="text-primary-500" /> 今日睡眠记录
          </h3>
          <Button size="sm" variant="secondary" onClick={() => setShowAdd(true)}>
            <Plus size={16} className="mr-1" /> 补录
          </Button>
        </div>

        {sleeps.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">今天还没有睡眠记录</p>
        ) : (
          <div className="space-y-3">
            {sleeps.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 dark:bg-night-200/5"
              >
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-400/20 flex items-center justify-center">
                  <Moon size={18} className="text-violet-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-night-50">
                      {formatTime(s.startTime)} - {s.endTime ? formatTime(s.endTime) : "进行中"}
                    </span>
                    <span className="text-sm text-violet-500 font-semibold bg-violet-100 dark:bg-violet-400/20 px-2 py-0.5 rounded-full">
                      {formatDuration(s.duration)}
                    </span>
                  </div>
                  {s.note && <p className="text-xs text-gray-400 mt-0.5">{s.note}</p>}
                </div>
                {s.endTime && (
                  <button
                    onClick={() => deleteSleep(s.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="补录睡眠">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">开始时间</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">结束时间</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input-base" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">睡眠质量</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { v: "good", l: "😴 好" },
                { v: "normal", l: "😐 一般" },
                { v: "poor", l: "😣 差" },
              ] as const).map((q) => (
                <button
                  key={q.v}
                  type="button"
                  onClick={() => setQuality(q.v)}
                  className={cn(
                    "py-2 rounded-xl text-sm transition-colors",
                    quality === q.v
                      ? "bg-violet-100 dark:bg-violet-400/20 text-violet-600"
                      : "bg-gray-50 dark:bg-night-200/5 text-gray-500"
                  )}
                >
                  {q.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">备注</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="input-base" placeholder="可选" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">取消</Button>
            <Button type="submit" className="flex-1">保存</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
