import React, { useState } from "react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { useBabyStore } from "@/store/baby";

interface Props {
  open: boolean;
  onClose: () => void;
}

const avatarOptions = ["👶", "👧", "👦", "🧒", "🐻", "🐰", "🐱", "🌸"];

export default function AddBabyModal({ open, onClose }: Props) {
  const { addBaby } = useBabyStore();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"boy" | "girl" | "unknown">("unknown");
  const [birthday, setBirthday] = useState(new Date().toISOString().split("T")[0]);
  const [avatar, setAvatar] = useState("👶");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addBaby({ name: name.trim(), gender, birthday, avatar });
    setName("");
    setGender("unknown");
    setBirthday(new Date().toISOString().split("T")[0]);
    setAvatar("👶");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="添加宝宝">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">
            选择头像
          </label>
          <div className="flex flex-wrap gap-2">
            {avatarOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatar(emoji)}
                className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all ${
                  avatar === emoji
                    ? "bg-primary-100 dark:bg-primary-200/30 ring-2 ring-primary-400"
                    : "bg-gray-50 dark:bg-night-200/10 hover:bg-primary-50"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">
            宝宝昵称
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-base"
            placeholder="请输入宝宝昵称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">
            性别
          </label>
          <div className="flex gap-2">
            {[
              { value: "girl", label: "女宝" },
              { value: "boy", label: "男宝" },
              { value: "unknown", label: "保密" },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGender(opt.value as "boy" | "girl" | "unknown")}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  gender === opt.value
                    ? "bg-primary-400 text-white"
                    : "bg-primary-50 dark:bg-night-800 text-primary-600 dark:text-primary-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-night-100 mb-1.5">
            出生日期
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="input-base"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button type="submit" className="flex-1">
            保存
          </Button>
        </div>
      </form>
    </Modal>
  );
}
