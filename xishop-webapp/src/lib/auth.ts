import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions, getServerSession, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./db";

// Extend the User type to include the id field from our database
declare module "next-auth" {
  interface Session {
    user?: User & {
      id: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add the user ID to the session object
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/sign-in',
  }
};

/**
 * Utility function to get the current user's session on the server.
 */
export const getAuthSession = () => getServerSession(authOptions);

/**
 * Utility function to check if the current user is the Super Admin.
 * It fetches the session and compares the user's email with the one in the environment variable.
 * @returns {Promise<boolean>} - True if the user is the Super Admin, false otherwise.
 */
export async function isSuperAdmin(): Promise<boolean> {
  const session = await getAuthSession();
  if (!session || !session.user || !session.user.email) {
    return false;
  }
  return session.user.email === process.env.SUPER_ADMIN_EMAIL;
} 