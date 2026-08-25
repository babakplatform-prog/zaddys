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
    signIn: '/auth', // Redirects users to our custom page
  }
});

export { handler as GET, handler as POST };