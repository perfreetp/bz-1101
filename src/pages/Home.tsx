import Header from "@/components/layout/Header";
import TabNav from "@/components/layout/TabNav";
import TodayPlan from "@/components/TodayPlan";
import FeedingRecord from "@/components/FeedingRecord";
import SleepRecord from "@/components/SleepRecord";
import SupplyList from "@/components/SupplyList";
import KnowledgeCard from "@/components/KnowledgeCard";
import FamilyShare from "@/components/FamilyShare";
import DataSummary from "@/components/DataSummary";
import { useUiStore } from "@/store/ui";
import { cn } from "@/lib/utils";

export default function Home() {
  const { activeTab } = useUiStore();

  return (
    <div className="min-h-screen">
      <Header />
      <TabNav />

      <main className="container pb-10 px-4">
        <div key={activeTab} className="animate-fade-in">
          {activeTab === "today" && <TodayPlan />}
          {activeTab === "feeding" && <FeedingRecord />}
          {activeTab === "sleep" && <SleepRecord />}
          {activeTab === "supply" && <SupplyList />}
          {activeTab === "knowledge" && <KnowledgeCard />}
          {activeTab === "share" && <FamilyShare />}
          {activeTab === "summary" && <DataSummary />}
        </div>
      </main>

      <footer className={cn(
        "pb-6 pt-2 text-center text-xs text-gray-400"
      )}>
        🌸 宝妈育儿助手 · 用心记录每一天
      </footer>
    </div>
  );
}
