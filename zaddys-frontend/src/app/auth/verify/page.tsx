"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerifyOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setEmail(sessionStorage.getItem("zaddys_pending_email") || "");
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
      const response = await fetch(`${apiUrl}/auth/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join("") }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Verification failed");
      localStorage.setItem("zaddys_access_token", data.access);
      localStorage.setItem("zaddys_refresh_token", data.refresh);
      sessionStorage.removeItem("zaddys_pending_email");
      router.push(sessionStorage.getItem("zaddys_auth_return") || "/");
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
      const response = await fetch(`${apiUrl}/auth/resend-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not resend code");
      setError("A new code has been sent.");
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-zaddys-black text-zaddys-white font-sans px-4 py-6 flex flex-col relative">
      <Link href="/auth" className="absolute top-6 left-4 text-zinc-400 hover:text-white transition">
        <ArrowLeft size={24} />
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full mt-10 text-center">
        <h1 className="text-3xl font-black mb-2 tracking-tight">Verify Account</h1>
        <p className="text-zinc-400 text-sm mb-8 px-4">
          We&apos;ve sent a 6-digit code to your email. Enter it below to verify your account.
        </p>
        {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={handleVerify}>
        <div className="flex justify-center space-x-2 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="number"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 bg-[#1A1A1A] border border-zinc-800 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-zaddys-red transition text-center no-spinners"
              maxLength={1}
            />
          ))}
        </div>

        <button disabled={loading || otp.join("").length !== 6 || !email} className="w-full bg-zaddys-red text-white font-bold rounded-xl py-3.5 hover:bg-red-700 transition disabled:opacity-50">
          Verify & Continue
        </button>
        </form>

        <div className="mt-8 text-sm text-zinc-400">
          Didn&apos;t receive the code? <button type="button" onClick={handleResend} disabled={resending || !email} className="font-bold text-zaddys-red disabled:opacity-50">{resending ? "Sending..." : "Resend code"}</button>
        </div>
      </div>
    </main>
  );
}