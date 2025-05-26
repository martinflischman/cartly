"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/utils/firebase";
import AuthForm from "@/components/AuthForm";
import VerifyEmailModal from "@/components/VerifyEmailModal";
import { FiUserPlus } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/list");
    } catch (err: any) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (password !== verifyPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
        await sendEmailVerification(auth.currentUser);
      }
      setShowVerifyModal(true);
      setName("");
      setEmail("");
      setPassword("");
      setVerifyPassword("");
    } catch (err: any) {
      setError("Could not create account. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/list");
    } catch (err: any) {
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-2">
      <VerifyEmailModal
        open={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setShowSignUp(false);
        }}
      />
      <div className="w-full max-w-sm mx-auto p-0 relative px-2">
        <div className="p-6 sm:p-8 rounded-xl shadow bg-base-100 text-center">
          {/* Header Section */}
          {showSignUp ? (
            <div className="mb-8 mt-2">
              <div className="text-3xl font-extrabold text-primary mb-2 tracking-tight">
                Cartly
              </div>
              <div className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-700 mb-2">
                <FiUserPlus className="inline-block" />
                Sign Up
              </div>
            </div>
          ) : (
            <div className="mb-8 mt-2">
              <div className="text-base text-gray-500 font-medium mb-1">
                Welcome to
              </div>
              <div className="text-3xl font-extrabold text-primary mb-2 tracking-tight">
                Cartly
              </div>
            </div>
          )}
          <AuthForm
            showSignUp={showSignUp}
            loading={loading}
            error={error}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            verifyPassword={verifyPassword}
            setVerifyPassword={setVerifyPassword}
            onSubmit={showSignUp ? handleSignUp : handleSignIn}
            onGoogle={handleGoogleLogin}
          />
          <div className="mt-8 flex flex-col items-center">
            {showSignUp ? (
              <>
                <span>Already have an account?</span>
                <button
                  className="text-primary mt-1 hover:underline cursor-pointer"
                  onClick={() => setShowSignUp(false)}
                  disabled={loading}
                  type="button"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <span>Don&apos;t have an account?</span>
                <button
                  className="text-primary mt-1 hover:underline cursor-pointer"
                  onClick={() => setShowSignUp(true)}
                  disabled={loading}
                  type="button"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
