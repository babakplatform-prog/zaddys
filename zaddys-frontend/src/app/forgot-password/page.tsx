"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [token] = useState<string | null>(() =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("token")
  );
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (token && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const endpoint = token ? "reset-password" : "forgot-password";
      const body = token ? { token, password } : { email };
      const response = await fetch(`${apiUrl}/auth/${endpoint}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      setMessage(data.message);
      if (!token) setEmail("");
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-[#111111] px-5 pb-36 pt-16 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/login" className="text-sm text-zinc-400 hover:text-white">Back to login</Link>
        <h1 className="mt-10 text-3xl font-black">{token ? "Create a new password" : "Forgot password?"}</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {token ? "Choose a new password for your Zaddys account." : "Enter your email and we will send a secure reset link."}
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {!token ? (
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="w-full rounded-xl border border-zinc-600 bg-transparent px-4 py-3 outline-none" />
          ) : (
            <>
              <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="w-full rounded-xl border border-zinc-600 bg-transparent px-4 py-3 outline-none" />
              <input type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="w-full rounded-xl border border-zinc-600 bg-transparent px-4 py-3 outline-none" />
            </>
          )}
          {error && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}
          {message && <p className="rounded-lg bg-green-950 p-3 text-sm text-green-200">{message}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-[#ff3b12] py-3 font-bold">
            {loading ? "Please wait..." : token ? "Save new password" : "Send reset link"}
          </button>
        </form>
      </div>
    </main>
  );
}
