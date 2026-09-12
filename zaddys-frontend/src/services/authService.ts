export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  phone?: string;
  referralCode?: string;
  fullName?: string;
}) {
  const apiUrl = getApiUrl();
  
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

export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "https://zaddys-api.onrender.com/api";
}