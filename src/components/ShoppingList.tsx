import { useState } from "react";
import ListItem from "./ListItem";

type ShoppingListProps = {
  items: {
    id: string;
    text: string;
    category: string;
    bought: boolean;
  }[];
  onToggleBought: (id: string, bought: boolean) => void;
  onDelete: (id: string) => void;
  onClearList: () => void;
};

export default function ShoppingList({
  items,
  onToggleBought,
  onDelete,
  onClearList,
}: ShoppingListProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6 sm:p-8 rounded-xl shadow bg-base-100 max-w-md mx-auto flex flex-col min-h-[400px]">
      <ul className="flex-1">
        {items.map((item) => (
          <ListItem
            key={item.id}
            item={item}
            onToggleBought={onToggleBought}
            onDelete={onDelete}
          />
        ))}
      </ul>

      {/* Clear List Button */}
      <button
        className="mt-8 mb-2 py-1 px-3 rounded text-error text-sm font-semibold hover:bg-error hover:text-base-100 transition self-center"
        style={{ letterSpacing: "0.01em" }}
        onClick={() => setShowModal(true)}
        type="button"
      >
        Clear List
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-base-100 rounded-xl shadow-lg p-8 max-w-xs w-full text-center">
            <div className="text-lg font-semibold mb-2 text-error">
              Clear Shopping List?
            </div>
            <div className="text-gray-600 mb-4 text-sm">
              You’re about to clear your entire shopping list! This action
              cannot be undone.
            </div>
            <div className="flex gap-2 justify-center">
              <button
                className="btn btn-error"
                onClick={() => {
                  onClearList();
                  setShowModal(false);
                }}
              >
                Proceed
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
