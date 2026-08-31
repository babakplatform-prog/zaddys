import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: (process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    AppleProvider({
      clientId: (process.env.APPLE_ID || process.env.APPLE_CLIENT_ID) as string,
      clientSecret: process.env.APPLE_SECRET as string,
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
              secret: process.env.NEXTAUTH_SECRET || "local-dev-key-for-migrations-only" 
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            token.djangoAccessToken = data.access;
          }
        } catch (error) {
          console.error("Social login sync error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.djangoAccessToken) {
        (session as any).djangoAccessToken = token.djangoAccessToken;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };