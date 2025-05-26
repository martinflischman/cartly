import { FiCheckCircle } from "react-icons/fi";

type VerifyEmailModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function VerifyEmailModal({
  open,
  onClose,
}: VerifyEmailModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-base-100 rounded-xl shadow-lg p-8 max-w-xs w-full text-center relative">
        <FiCheckCircle className="mx-auto text-green-500 text-4xl mb-3" />
        <div className="text-lg font-semibold mb-2">Verify your email</div>
        <div className="text-gray-600 mb-4 text-sm">
          Please check your email to verify your account before signing in.
        </div>
        <button
          className="btn btn-primary w-full mt-2 cursor-pointer"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}
