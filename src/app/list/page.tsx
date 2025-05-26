"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/utils/useAuth";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/utils/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import ListItem from "@/components/ListItem";
import AddItemForm from "@/components/AddItemForm";
import ClearListModal from "@/components/ClearListModal";
import UserMenu from "@/components/UserMenu";
import { FiShoppingCart, FiPlus } from "react-icons/fi";

type Item = {
  id: string;
  text: string;
  bought: boolean;
  createdAt: import("firebase/firestore").Timestamp | null;
};

export default function ListPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [input, setInput] = useState("");
  const [quantity, setQuantity] = useState("1"); // Default quantity is "1"
  const [adding, setAdding] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [proceedClicked, setProceedClicked] = useState(false);
  const [proceedHover, setProceedHover] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "items"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          bought: doc.data().bought || false,
          createdAt: doc.data().createdAt,
        }))
      );
    });
    return unsubscribe;
  }, [user]);

  // --- User Info Logic (after loading) ---
  let firstName = "User";
  let avatarUrl = "";
  let initial = "U";

  if (user) {
    const googleProfile = user.providerData.find(
      (p) => p.providerId === "google.com"
    );
    if (googleProfile) {
      const name = (
        user.displayName ||
        googleProfile.displayName ||
        "Google User"
      ).split(" ")[0];
      firstName = name;
      avatarUrl = user.photoURL || googleProfile.photoURL || "";
      initial = name.charAt(0).toUpperCase();
    } else {
      const name = user.email?.split("@")[0] || "User";
      firstName = name.charAt(0).toUpperCase() + name.slice(1);
      initial = name.charAt(0).toUpperCase();
      avatarUrl = "";
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setAdding(true);
    try {
      // Capitalize first letter, rest lower case
      const formattedText =
        input.trim().charAt(0).toUpperCase() +
        input.trim().slice(1).toLowerCase();

      await addDoc(collection(db, "items"), {
        text: formattedText,
        bought: false,
        uid: user.uid,
        createdAt: serverTimestamp(),
        // Optionally, save quantity if you want:
        // quantity: quantity,
      });
      setInput("");
      setQuantity("1"); // Reset quantity to 1 after adding
    } finally {
      setAdding(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "items", id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleToggleBought = async (id: string, bought: boolean) => {
    try {
      await updateDoc(doc(db, "items", id), { bought: !bought });
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // --- Clear List Handler ---
  const handleClearList = async () => {
    if (!user || items.length === 0) return;
    setProceedClicked(true);
    setClearing(true);
    try {
      const batch = writeBatch(db);
      items.forEach((item) => {
        batch.delete(doc(db, "items", item.id));
      });
      await batch.commit();
      setShowClearModal(false);
      setProceedClicked(false);
    } catch (error) {
      console.error("Error clearing list:", error);
    } finally {
      setClearing(false);
    }
  };

  const memoizedHandleToggleBought = useCallback(handleToggleBought, []);
  const memoizedHandleDelete = useCallback(handleDelete, []);

  if (loading || !user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-base-200 px-2">
      {/* Branding top-left, icon just smaller than text, close together, fully left-aligned */}
      <div
        className="fixed top-4 left-0 z-30 flex items-center gap-2 pl-4"
        style={{ height: "56px" }}
      >
        <FiShoppingCart className="text-primary w-7 h-7" />
        <span
          className="font-extrabold text-3xl sm:text-4xl text-primary tracking-tight select-none"
          style={{ lineHeight: "1" }}
        >
          Cartly
        </span>
      </div>
      {/* User Menu top-right, vertically aligned */}
      <div
        className="fixed top-4 right-4 z-30 flex items-center"
        style={{ height: "56px" }}
      >
        <UserMenu
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          menuRef={menuRef}
          avatarUrl={avatarUrl}
          firstName={firstName}
          initial={initial}
          onSignOut={handleSignOut}
        />
      </div>
      {/* Centered card */}
      <div className="w-full max-w-md mx-auto p-0 relative px-2 flex flex-col items-center">
        {/* Card */}
        <div
          className="p-4 sm:p-8 rounded-xl bg-base-100 text-center w-full flex flex-col"
          style={{ boxShadow: "0 4px 24px 0 rgba(60,60,60,0.08)" }} // softer shadow
        >
          <AddItemForm
            input={input}
            setInput={setInput}
            quantity={quantity}
            setQuantity={setQuantity}
            adding={adding}
            onAdd={handleAdd}
            addIcon={<FiPlus />}
          />
          <ul
            className="text-left overflow-y-auto max-h-[80vh] mt-2 flex-1"
            aria-live="polite"
            aria-label="Shopping list"
          >
            <AnimatePresence>
              {items.length === 0 ? (
                <motion.li
                  className="opacity-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  No items yet…
                </motion.li>
              ) : (
                items.map((item) => (
                  <ListItem
                    key={item.id}
                    item={item}
                    onToggleBought={memoizedHandleToggleBought}
                    onDelete={memoizedHandleDelete}
                  />
                ))
              )}
            </AnimatePresence>
          </ul>
          {/* --- Clear List Button and Modal --- */}
          <button
            className="mt-8 py-1 px-3 rounded text-error text-sm font-semibold hover:bg-error hover:text-base-100 transition self-center cursor-pointer"
            style={{ letterSpacing: "0.01em" }}
            onClick={() => setShowClearModal(true)}
            type="button"
            disabled={items.length === 0 || clearing}
          >
            Clear List
          </button>
          <ClearListModal
            show={showClearModal}
            onProceed={handleClearList}
            onCancel={() => {
              setShowClearModal(false);
              setProceedClicked(false);
            }}
            proceedClicked={proceedClicked}
            proceedHover={proceedHover}
            setProceedHover={setProceedHover}
            clearing={clearing}
          />
          {/* --- End Clear List Button and Modal --- */}
        </div>
      </div>
    </main>
  );
}
