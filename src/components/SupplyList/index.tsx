import React, { useState } from "react";
import { Plus, Minus, Package, ShoppingCart, Trash2, AlertTriangle, Plus as PlusIcon } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useBabyStore } from "@/store/baby";
import { useSupplyStore } from "@/store/supply";
import { cn } from "@/lib/utils";
import type { SupplyCategory, SupplyItem } from "@/types";

const categoryConfig: Record<SupplyCategory, { label: string; emoji: string; color: string }> = {
  formula: { label: "奶粉", emoji: "🍼", color: "bg-amber-100 dark:bg-amber-400/20 text-amber-600" },
  diaper: { label: "纸尿裤", emoji: "👶", color: "bg-sky-100 dark:bg-sky-400/20 text-sky-600" },
  other: { label: "其他", emoji: "📦", color: "bg-gray-100 dark:bg-gray-400/20 text-gray-600" },
};

export default function SupplyList() {
  const { currentBabyId } = useBabyStore();
  const { getBabySupplies, getLowStockItems, generateShoppingList, adjustStock, addSupply, deleteSupply, updateSupply } = useSupplyStore();

  const [showAdd, setShowAdd] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<SupplyCategory>("formula");
  const [currentStock, setCurrentStock] = useState("10");
  const [warningLevel, setWarningLevel] = useState("5");
  const [unit, setUnit] = useState("");

  const supplies = currentBabyId ? getBabySupplies(currentBabyId) : [];
  const lowStock = currentBabyId ? getLowStockItems(currentBabyId) : [];
  const shoppingList = currentBabyId ? generateShoppingList(currentBabyId) : [];

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!currentBabyId || !name.trim()) return;
    addSupply({
      babyId: currentBabyId,
      name: name.trim(),
      category,
      currentStock: Number(currentStock) || 0,
      warningLevel: Number(warningLevel) || 0,
      unit: unit.trim() || "件",
    });
    setName("");
    setCurrentStock("10");
    setWarningLevel("5");
    setUnit("");
    setShowAdd(false);
  }

  function getStockPercent(item: SupplyItem) {
    const total = item.warningLevel * 3;
    return Math.min(100, (item.currentStock / total) * 100);
  }

  return (
    <div className="space-y-5">
      {lowStock.length > 0 && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-400/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">库存预警</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                以下物品库存不足：{lowStock.map((s) => s.name).join("、")}
              </p>
              <button
                onClick={() => setShowShoppingList(true)}
                className="mt-2 text-xs font-medium text-white bg-red-400 hover:bg-red-500 px-3 py-1.5 rounded-full transition-colors"
              >
                生成购物清单
              </button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">
            <Package size={20} className="text-primary-500" /> 用品库存
          </h3>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowShoppingList(true)}>
              <ShoppingCart size={16} className="mr-1" /> 购物清单
            </Button>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <PlusIcon size={16} className="mr-1" /> 添加
            </Button>
          </div>
        </div>

        {supplies.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">暂无用品，点击上方按钮添加</p>
        ) : (
          <div className="space-y-3">
            {supplies.map((item) => {
              const cfg = categoryConfig[item.category];
              const isLow = item.currentStock <= item.warningLevel;
              const percent = getStockPercent(item);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "p-4 rounded-2xl transition-all",
                    isLow
                      ? "bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-400/20"
                      : "bg-gray-50 dark:bg-night-200/5"
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-lg", cfg.color)}>
                      {cfg.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-night-50">{item.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/70 dark:bg-night-800/50 text-gray-500">
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        低于 {item.warningLevel}{item.unit} 预警
                      </p>
                    </div>
                    <button
                      onClick={() => deleteSupply(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustStock(item.id, -1)}
                      className="w-9 h-9 rounded-full bg-white dark:bg-night-800 flex items-center justify-center shadow-sm text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                    >
                      <Minus size={16} />
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-gray-700 dark:text-night-50">
                          {item.currentStock}
                          <span className="text-xs font-normal text-gray-400 ml-1">{item.unit}</span>
                        </span>
                        <span className={cn(
                          "text-xs font-medium",
                          isLow ? "text-red-500" : "text-emerald-500"
                        )}>
                          {isLow ? "库存不足" : "充足"}
                        </span>
                      </div>
                      <div className="h-2 bg-white dark:bg-night-800 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isLow ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => adjustStock(item.id, 1)}
                      className="w-9 h-9 rounded-full bg-white dark:bg-night-800 flex items-center justify-center shadow-sm text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-400/10 transition-all active:scale-95"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="添加用品">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">分类</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(categoryConfig) as SupplyCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    if (cat === "formula") setUnit("罐");
                    else if (cat === "diaper") setUnit("片");
                  }}
                  className={cn(
                    "py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5",
                    category === cat
                      ? "bg-primary-400 text-white"
                      : "bg-gray-50 dark:bg-night-200/5 text-gray-500"
                  )}
                >
                  <span>{categoryConfig[cat].emoji}</span>
                  {categoryConfig[cat].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">名称</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-base" placeholder="例如：爱他美奶粉" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">当前库存</label>
              <input type="number" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">预警值</label>
              <input type="number" value={warningLevel} onChange={(e) => setWarningLevel(e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">单位</label>
              <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} className="input-base" placeholder="罐/片" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">取消</Button>
            <Button type="submit" className="flex-1">保存</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showShoppingList} onClose={() => setShowShoppingList(false)} title="购物清单">
        {shoppingList.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">当前没有需要采购的物品 🎉</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-night-100 mb-2">基于库存预警自动生成：</p>
            {shoppingList.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 dark:bg-night-200/5">
                <div className="w-6 h-6 rounded border-2 border-primary-300 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-gray-700 dark:text-night-50">{item.name}</span>
                </div>
                <span className="text-sm text-primary-500 font-semibold">建议买 {item.needed}{item.unit}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-100 dark:border-night-200/20">
              <Button
                className="w-full"
                onClick={() => {
                  const text = "🛒 购物清单\n\n" + shoppingList.map((i) => `□ ${i.name} × ${i.needed}${i.unit}`).join("\n");
                  navigator.clipboard?.writeText(text);
                  alert("已复制到剪贴板！");
                }}
              >
                复制清单
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
