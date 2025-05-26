import React, { RefObject } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut } from "react-icons/fi";

interface UserMenuProps {
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  menuRef: RefObject<HTMLDivElement>;
  avatarUrl: string;
  firstName: string;
  initial: string;
  onSignOut: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  showMenu,
  setShowMenu,
  menuRef,
  avatarUrl,
  firstName,
  initial,
  onSignOut,
}) => (
  <div className="fixed top-4 right-4 z-30">
    <div className="relative" ref={menuRef}>
      <button
        className="focus:outline-none"
        onClick={() => setShowMenu((v) => !v)}
        aria-label="User menu"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={firstName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover border-2 border-primary"
            priority
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
            {initial}
          </div>
        )}
      </button>
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-base-100 rounded-xl shadow-lg z-20"
            style={{ border: "none" }}
          >
            <div className="px-4 py-3 flex flex-col items-start">
              <span className="text-xs text-gray-500 font-medium mb-1">
                Logged in as
              </span>
              <span className="font-semibold text-base">{firstName}</span>
            </div>
            <button
              className="btn btn-primary btn-sm w-11/12 mx-auto mb-2 flex items-center justify-center gap-2"
              style={{ border: "none" }}
              onClick={onSignOut}
            >
              <FiLogOut className="inline-block" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

export default UserMenu;
