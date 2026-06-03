// lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { findAccountByUsername } from '@/lib/accounts';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Đăng nhập',
      credentials: {
        username: { label: 'Tên đăng nhập', type: 'text' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (!username || !password) return null;

        const account = await findAccountByUsername(username);
        if (!account) return null;

        // So sánh trực tiếp (plaintext) vì mật khẩu mặc định đơn giản
        // Khi nâng cấp: dùng bcrypt.compare(password, account.hashedPassword)
        if (password !== account.password) return null;

        return {
          id: account.username,
          name: account.displayName,
          email: account.username + '@cdcdanang.vn',
          role: account.role,
          username: account.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { username?: string }).username = token.username as string;
      }
      return session;
    },
  },
});
