import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GithubProvider({ clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! })],
  callbacks: {
    // Create user preferences when they first sign up
    async signIn({ user, account, profile }) {
      return true; // Allow sign in
    },
    async session({ session, user }) {
      // Add user ID to session for easy access
      session.user.id = user.id;
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});