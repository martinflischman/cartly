import { FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";

type ListItemProps = {
  item: {
    id: string;
    text: string;
    bought: boolean;
  };
  onToggleBought: (id: string, bought: boolean) => void;
  onDelete: (id: string) => void;
};

export default function ListItem({
  item,
  onToggleBought,
  onDelete,
}: ListItemProps) {
  return (
    <motion.li
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.2 }}
      className="py-2 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={item.bought}
          onChange={() => onToggleBought(item.id, item.bought)}
          className="checkbox checkbox-primary"
          aria-label="Mark as bought"
        />
        <span
          className={
            item.bought
              ? "line-through text-gray-400 font-medium"
              : "font-medium"
          }
        >
          {item.text}
        </span>
      </div>
      <button
        className="btn btn-ghost btn-xs text-error cursor-pointer flex items-center gap-1 group"
        title="Delete"
        onClick={() => onDelete(item.id)}
        type="button"
      >
        <span className="flex items-center">
          <FiTrash2 className="group-hover:text-error-dark transition-colors" />
          <span className="ml-1 hidden group-hover:inline">Delete</span>
        </span>
      </button>
    </motion.li>
  );
}
