import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";

const requiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required authentication environment variable: ${name}`);
  return value;
};

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "missing-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "missing-google-client-secret",
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || "missing-apple-id",
      clientSecret: process.env.APPLE_SECRET || "missing-apple-secret",
    }),
  ],
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
          const res = await fetch(`${apiUrl}/auth/social-login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              provider: account.provider,
              secret: requiredEnv("SOCIAL_LOGIN_SECRET"),
            }),
          });
          
          if (!res.ok) {
            const details = await res.text();
            throw new Error(`Social account provisioning failed (${res.status}): ${details}`);
          }
          const data = await res.json() as { access?: string };
          if (!data.access) throw new Error("Social account provisioning returned no access token");
          token.djangoAccessToken = data.access;
        } catch (error) {
          console.error("Social login sync error:", error);
          throw error;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.djangoAccessToken) {
        session.djangoAccessToken = token.djangoAccessToken;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };