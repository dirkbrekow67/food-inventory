// client/src/components/history/HistoryList.jsx

import { HistoryCard } from "./HistoryCard";

export function HistoryList({
  filteredHistoryItems,
  onOpenHistoryDialog,
  onOpenHistoryDeleteDialog,
}) {
  return (
    <div className="history-list">
      {filteredHistoryItems.map((item) => (
        <HistoryCard
          item={item}
          key={item.id}
          onOpenHistoryDialog={onOpenHistoryDialog}
          onOpenHistoryDeleteDialog={onOpenHistoryDeleteDialog}
        />
      ))}
    </div>
  );
}
