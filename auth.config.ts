import type { NextAuthConfig } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.username = (user as { username?: string }).username;
        token.facilityName = (user as { facilityName?: string }).facilityName;
        token.password = (user as any).password;
      } else if (token.username) {
        // Kiểm tra lại password trong DB mỗi lần xác thực JWT
        try {
          const dbUser = await prisma.account.findUnique({
            where: { username: token.username as string }
          });
          if (!dbUser || dbUser.password !== token.password) {
            return null as any; // Invalidates the token if password changed or user deleted
          }
        } catch (e) {
          // Fallback if DB error, just allow for now
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { username?: string }).username = token.username as string;
        (session.user as { facilityName?: string }).facilityName = token.facilityName as string;
      }
      return session;
    },
  },
  providers: [], // Empty array, to be populated in lib/auth.ts
} satisfies NextAuthConfig;
