import React, { useState } from "react";
import { Plus, Milk, UtensilsCrossed, Baby, Trash2 } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useBabyStore } from "@/store/baby";
import { useFeedingStore } from "@/store/feeding";
import { formatDateTime } from "@/utils/date";
import { cn } from "@/lib/utils";
import type { FeedingType, DiaperType } from "@/types";

type RecordType = "feeding" | "diaper";

export default function FeedingRecord() {
  const { currentBabyId } = useBabyStore();
  const { getTodayFeedings, getTodayDiapers, addFeeding, deleteFeeding, addDiaper, deleteDiaper } = useFeedingStore();

  const [showAdd, setShowAdd] = useState(false);
  const [recordType, setRecordType] = useState<RecordType>("feeding");
  const [feedingType, setFeedingType] = useState<FeedingType>("milk");
  const [amount, setAmount] = useState("120");
  const [unit, setUnit] = useState("ml");
  const [diaperType, setDiaperType] = useState<DiaperType>("pee");
  const [note, setNote] = useState("");

  const feedings = currentBabyId ? getTodayFeedings(currentBabyId) : [];
  const diapers = currentBabyId ? getTodayDiapers(currentBabyId) : [];

  const totalMilk = feedings.filter((f) => f.type === "milk").reduce((s, f) => s + f.amount, 0);
  const totalSolids = feedings.filter((f) => f.type === "solids").reduce((s, f) => s + f.amount, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentBabyId) return;

    if (recordType === "feeding") {
      addFeeding({
        babyId: currentBabyId,
        type: feedingType,
        amount: Number(amount) || 0,
        unit: feedingType === "milk" ? "ml" : unit || "g",
        time: new Date().toISOString(),
        note: note.trim(),
      });
    } else {
      addDiaper({
        babyId: currentBabyId,
        type: diaperType,
        time: new Date().toISOString(),
        note: note.trim(),
      });
    }

    resetForm();
    setShowAdd(false);
  }

  function resetForm() {
    setAmount("120");
    setUnit("ml");
    setNote("");
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={Milk} label="今日奶量" value={`${totalMilk}ml`} color="pink" />
        <SummaryCard icon={UtensilsCrossed} label="今日辅食" value={`${totalSolids}g`} color="mint" />
        <SummaryCard icon={Baby} label="换尿布" value={`${diapers.length}次`} color="peach" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">
            <Milk size={20} className="text-primary-500" /> 喂养 & 尿布记录
          </h3>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={16} className="mr-1" /> 添加记录
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setRecordType("feeding")}
            className={cn(
              "flex-1 py-2 rounded-xl text-sm font-medium transition-colors",
              recordType === "feeding"
                ? "bg-primary-100 dark:bg-primary-400/20 text-primary-600 dark:text-primary-300"
                : "bg-gray-50 dark:bg-night-200/5 text-gray-500"
            )}
          >
            喂养记录
          </button>
          <button
            onClick={() => setRecordType("diaper")}
            className={cn(
              "flex-1 py-2 rounded-xl text-sm font-medium transition-colors",
              recordType === "diaper"
                ? "bg-primary-100 dark:bg-primary-400/20 text-primary-600 dark:text-primary-300"
                : "bg-gray-50 dark:bg-night-200/5 text-gray-500"
            )}
          >
            尿布记录
          </button>
        </div>

        {recordType === "feeding" ? (
          feedings.length === 0 ? (
            <EmptyState text="今天还没有喂养记录" />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {feedings.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary-50/50 dark:bg-night-200/5"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    f.type === "milk" ? "bg-pink-100 dark:bg-pink-400/20" : "bg-emerald-100 dark:bg-emerald-400/20"
                  )}>
                    {f.type === "milk" ? <Milk size={18} className="text-pink-500" /> : <UtensilsCrossed size={18} className="text-emerald-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-night-50">
                        {f.type === "milk" ? "喂奶" : "辅食"}
                      </span>
                      <span className="text-sm text-primary-500 font-semibold">{f.amount}{f.unit}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(f.time, "HH:mm")}{f.note && ` · ${f.note}`}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFeeding(f.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          diapers.length === 0 ? (
            <EmptyState text="今天还没有尿布记录" />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {diapers.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-orange-50/50 dark:bg-night-200/5"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-400/20 flex items-center justify-center">
                    <Baby size={18} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 dark:text-night-50">
                      {d.type === "pee" ? "小便" : d.type === "poop" ? "大便" : "大小便"}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(d.time, "HH:mm")}{d.note && ` · ${d.note}`}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDiaper(d.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="添加记录">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">记录类型</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRecordType("feeding")}
                className={cn(
                  "py-2.5 rounded-xl text-sm font-medium transition-colors",
                  recordType === "feeding"
                    ? "bg-primary-400 text-white"
                    : "bg-gray-50 dark:bg-night-200/5 text-gray-500"
                )}
              >
                🍼 喂养
              </button>
              <button
                type="button"
                onClick={() => setRecordType("diaper")}
                className={cn(
                  "py-2.5 rounded-xl text-sm font-medium transition-colors",
                  recordType === "diaper"
                    ? "bg-primary-400 text-white"
                    : "bg-gray-50 dark:bg-night-200/5 text-gray-500"
                )}
              >
                👶 换尿布
              </button>
            </div>
          </div>

          {recordType === "feeding" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">喂养方式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setFeedingType("milk"); setUnit("ml"); }}
                    className={cn(
                      "py-2 rounded-xl text-sm transition-colors",
                      feedingType === "milk"
                        ? "bg-pink-100 dark:bg-pink-400/20 text-pink-600"
                        : "bg-gray-50 dark:bg-night-200/5 text-gray-500"
                    )}
                  >
                    🍼 母乳/配方奶
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFeedingType("solids"); setUnit("g"); }}
                    className={cn(
                      "py-2 rounded-xl text-sm transition-colors",
                      feedingType === "solids"
                        ? "bg-emerald-100 dark:bg-emerald-400/20 text-emerald-600"
                        : "bg-gray-50 dark:bg-night-200/5 text-gray-500"
                    )}
                  >
                    🥣 辅食
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">份量</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">单位</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="input-base"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">类型</label>
              <div className="grid grid-cols-3 gap-2">
                {(["pee", "poop", "both"] as DiaperType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDiaperType(t)}
                    className={cn(
                      "py-2 rounded-xl text-sm transition-colors",
                      diaperType === t
                        ? "bg-orange-100 dark:bg-orange-400/20 text-orange-600"
                        : "bg-gray-50 dark:bg-night-200/5 text-gray-500"
                    )}
                  >
                    {t === "pee" ? "小便" : t === "poop" ? "大便" : "大小便"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">备注</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-base"
              placeholder="可选，如：吃得很香"
            />
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

function EmptyState({ text }: { text: string }) {
  return <p className="text-center text-gray-400 py-8 text-sm">{text}</p>;
}

interface SummaryCardProps {
  icon: typeof Milk;
  label: string;
  value: string;
  color: "pink" | "mint" | "peach";
}

function SummaryCard({ icon: Icon, label, value, color }: SummaryCardProps) {
  const colorMap = {
    pink: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 text-pink-600 dark:text-pink-300",
    mint: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 text-emerald-600 dark:text-emerald-300",
    peach: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-600 dark:text-orange-300",
  };
  return (
    <div className={cn("rounded-2xl p-4 bg-gradient-to-br", colorMap[color])}>
      <Icon size={18} className="opacity-80" />
      <p className="text-xs opacity-70 mt-1">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}
