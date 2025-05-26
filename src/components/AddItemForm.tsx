type AddItemFormProps = {
  input: string;
  setInput: (val: string) => void;
  quantity: string;
  setQuantity: (val: string) => void;
  adding: boolean;
  onAdd: (e: React.FormEvent) => void;
  addIcon?: React.ReactNode;
};

export default function AddItemForm({
  input,
  setInput,
  quantity,
  setQuantity,
  adding,
  onAdd,
  addIcon,
}: AddItemFormProps) {
  // Use your primary color for text when typing, else default grey
  const inputTextColor = input.length > 0 ? "oklch(45% 0.24 277.023)" : "#333";

  return (
    <form onSubmit={onAdd} className="flex flex-col gap-2 mb-4 w-full">
      <div className="flex flex-row gap-2 w-full">
        <input
          className="input input-bordered flex-[5] min-w-0 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-gray-400 placeholder:opacity-100"
          placeholder="Add item"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={adding}
          style={{ color: inputTextColor }}
        />
        <input
          type="number"
          min={1}
          className="input input-bordered flex-[0.8] min-w-0 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-gray-400 placeholder:opacity-100"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={adding}
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>
      <button
        className="btn btn-primary w-full flex items-center justify-center gap-2"
        type="submit"
        disabled={adding}
      >
        {adding ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <>
            {addIcon}
            Add
          </>
        )}
      </button>
    </form>
  );
}
