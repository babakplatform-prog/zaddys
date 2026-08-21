export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  phone?: string;
  referralCode?: string;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  
  try {
    const res = await fetch(`${apiUrl}/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    return data;
  } catch (error: unknown) {
    console.error("Auth Error:", error instanceof Error ? error.message : error);
    throw error;
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("zaddys_access_token");
}