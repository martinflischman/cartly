import React from "react";

interface ClearListModalProps {
  show: boolean;
  onProceed: () => void;
  onCancel: () => void;
  proceedClicked: boolean;
  proceedHover: boolean;
  setProceedHover: (hover: boolean) => void;
  clearing: boolean;
}

const ClearListModal: React.FC<ClearListModalProps> = ({
  show,
  onProceed,
  onCancel,
  proceedClicked,
  proceedHover,
  setProceedHover,
  clearing,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-base-100 rounded-xl shadow-lg p-8 max-w-xs w-full text-center">
        <div className="text-lg font-semibold mb-4 text-error">
          Clear Shopping List
        </div>
        <div className="text-gray-600 mb-8 text-sm">
          This action can't be undone!
        </div>
        <div className="flex gap-2 justify-center">
          <button
            className={
              proceedClicked
                ? "btn btn-error text-white cursor-not-allowed"
                : "btn btn-outline btn-error hover:bg-error hover:text-white transition-colors"
            }
            onClick={onProceed}
            disabled={clearing || proceedClicked}
            onMouseEnter={() => setProceedHover(true)}
            onMouseLeave={() => setProceedHover(false)}
          >
            {clearing || proceedClicked ? "Clearing..." : "Proceed"}
          </button>
          <button
            className={
              proceedClicked || proceedHover
                ? "btn btn-outline btn-error text-error"
                : "btn btn-error text-white"
            }
            onClick={onCancel}
            disabled={clearing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearListModal;
