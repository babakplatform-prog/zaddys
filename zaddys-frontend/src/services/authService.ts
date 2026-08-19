export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  phone?: string;
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
  } catch (error: any) {
    console.error("Auth Error:", error.message);
    throw error;
  }
}