import { FiLogIn, FiUserPlus, FiUser, FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import React from "react";

type AuthFormProps = {
  showSignUp: boolean;
  loading: boolean;
  error: string | null;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  verifyPassword: string;
  setVerifyPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogle: () => void;
};

export default function AuthForm({
  showSignUp,
  loading,
  error,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  verifyPassword,
  setVerifyPassword,
  onSubmit,
  onGoogle,
}: AuthFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4"
      autoComplete="off"
    >
      {showSignUp && (
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input input-bordered w-full pl-4"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            autoComplete="name"
          />
        </div>
      )}
      <div className="relative">
        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input input-bordered w-full pl-4"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />
      </div>
      <div className="relative">
        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input input-bordered w-full pl-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete={showSignUp ? "new-password" : "current-password"}
        />
      </div>
      {showSignUp && (
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input input-bordered w-full pl-4"
            type="password"
            placeholder="Verify Password"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
      )}
      <button
        className="btn btn-primary w-full flex items-center justify-center gap-2 cursor-pointer mt-2"
        type="submit"
        disabled={loading}
      >
        {showSignUp ? (
          <FiUserPlus className="inline-block" />
        ) : (
          <FiLogIn className="inline-block" />
        )}
        {loading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : showSignUp ? (
          "Sign Up"
        ) : (
          "Sign In"
        )}
      </button>
      <button
        type="button"
        className="btn btn-outline w-full flex items-center justify-center gap-2 cursor-pointer"
        onClick={onGoogle}
        disabled={loading}
      >
        <FcGoogle className="inline-block text-lg" />
        {showSignUp ? "Sign Up with Google" : "Login with Google"}
      </button>
      {error && <div className="text-error text-sm mt-2">{error}</div>}
    </form>
  );
}
